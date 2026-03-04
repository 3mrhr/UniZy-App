'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';
import { completeReferralIfEligible } from './referrals';
import { createNotification } from './notifications';
import { computeCommissionSnapshot, computePricingSnapshot, generateTxnCode } from './financial';
import { logEvent } from './analytics';
import { logAdminAction } from './audit';

export async function createOrder(service, details, clientTotal, promoCodeStr = null, lineItems = []) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'STUDENT') {
            return { error: 'Only students can create orders.' };
        }

        // If lineItems are provided (e.g. DELIVERY / Meals), we calculate securely.
        // If not (e.g. TRANSPORT), we fallback to clientTotal for now
        let isCartBased = lineItems && lineItems.length > 0;

        // Idempotency guard: Prevent duplicate submissions
        const recentDuplicate = await prisma.order.findFirst({
            where: {
                userId: user.id,
                service,
                status: 'PENDING',
                createdAt: { gte: new Date(Date.now() - 10000) }, // Within last 10 seconds
            },
            orderBy: { createdAt: 'desc' },
        });

        if (recentDuplicate) {
            return { error: 'A similar order was just placed. Please wait a moment before trying again.' };
        }

        return await prisma.$transaction(async (tx) => {
            let subtotal = 0;
            let orderItemCreates = [];
            let providerId = details.vendorId || null;

            if (isCartBased) {
                for (const item of lineItems) {
                    const meal = await tx.meal.findUnique({
                        where: { id: item.mealId },
                        include: { variantGroups: { include: { options: true } }, addonGroups: { include: { options: true } } }
                    });

                    if (!meal || meal.status !== 'ACTIVE') throw new Error(`Meal ${item.mealId} unavailable.`);
                    if (meal.isSoldOut) throw new Error(`Meal ${meal.name} is sold out.`);

                    // Atomic Inventory Check
                    if (meal.trackInventory) {
                        if (meal.stockCount === null || meal.stockCount < item.quantity) {
                            throw new Error(`Insufficient stock for ${meal.name}. Only ${meal.stockCount || 0} left.`);
                        }

                        // Decrement stock atomically with condition preventing oversell race condition
                        const updateResult = await tx.meal.updateMany({
                            where: {
                                id: meal.id,
                                stockCount: { gte: item.quantity }
                            },
                            data: { stockCount: { decrement: item.quantity } }
                        });

                        if (updateResult.count === 0) {
                            throw new Error(`Insufficient stock for ${meal.name} due to concurrent orders. Please try again.`);
                        }
                    }

                    let itemBasePrice = meal.price;
                    let itemVariantSelections = [];
                    let itemAddonSelections = [];
                    let variantsTotal = 0;
                    let addonsTotal = 0;

                    // Compute Variants
                    if (item.variants && item.variants.length > 0) {
                        for (const v of item.variants) {
                            const group = meal.variantGroups.find(g => g.id === v.groupId);
                            const opt = group?.options.find(o => o.id === v.optionId);
                            if (opt && opt.isAvailable) {
                                variantsTotal += opt.priceDelta;
                                itemVariantSelections.push({
                                    groupNameSnapshot: group.name,
                                    optionNameSnapshot: opt.name,
                                    priceDeltaSnapshot: opt.priceDelta
                                });
                            }
                        }
                    }

                    // Compute Addons
                    if (item.addons && item.addons.length > 0) {
                        for (const a of item.addons) {
                            const group = meal.addonGroups.find(g => g.id === a.groupId);
                            const opt = group?.options.find(o => o.id === a.optionId);
                            if (opt && opt.isAvailable) {
                                addonsTotal += opt.priceDelta;
                                itemAddonSelections.push({
                                    groupNameSnapshot: group.name,
                                    optionNameSnapshot: opt.name,
                                    priceDeltaSnapshot: opt.priceDelta
                                });
                            }
                        }
                    }

                    const itemFinalPrice = itemBasePrice + variantsTotal + addonsTotal;
                    subtotal += (itemFinalPrice * item.quantity);

                    orderItemCreates.push({
                        mealId: meal.id,
                        nameSnapshot: meal.name,
                        basePriceSnapshot: itemFinalPrice,
                        qty: item.quantity,
                        notes: item.notes || null,
                        variantSelections: { create: itemVariantSelections },
                        addonSelections: { create: itemAddonSelections }
                    });
                }
            } else {
                subtotal = parseFloat(clientTotal);
            }

            let discountTotal = 0;
            let promoCodeId = null;

            if (promoCodeStr) {
                const promoRes = await validatePromoCode(promoCodeStr, service);
                if (promoRes.success && promoRes.promo) {
                    const promo = promoRes.promo;
                    promoCodeId = promo.id;

                    if (promo.discountType === 'PERCENTAGE') {
                        discountTotal = subtotal * (promo.discountAmount / 100);
                    } else {
                        discountTotal = promo.discountAmount;
                    }

                    // Cap discount if necessary (for now just apply)
                    discountTotal = Math.min(discountTotal, subtotal);

                    await tx.promoCode.update({
                        where: { id: promo.id },
                        data: { currentUses: { increment: 1 } }
                    });
                } else {
                    throw new Error(promoRes.error || 'Invalid promo code');
                }
            }

            // Assume delivery components
            const deliveryFee = service === 'DELIVERY' ? 15 : 0; // Simple stub for testing
            const feesTotal = deliveryFee;

            // REDEEM rewards logic
            let pointsRedeemed = 0;
            if (details.useRewards) {
                const rewardAcc = await tx.rewardAccount.findUnique({ where: { userId: user.id } });
                if (rewardAcc && rewardAcc.currentBalance > 0) {
                    // e.g. 1 point = 1 EGP
                    const maxRedeemable = subtotal - discountTotal + feesTotal;
                    pointsRedeemed = Math.min(Number(rewardAcc.currentBalance), maxRedeemable);
                    discountTotal += pointsRedeemed;

                    // deduct points immediately 
                    await tx.rewardAccount.update({
                        where: { userId: user.id },
                        data: { currentBalance: { decrement: pointsRedeemed } }
                    });
                }
            }

            const grandTotal = Math.max(0, subtotal - discountTotal + feesTotal);

            // Compute financial snapshots BEFORE creating records
            const providerType = service === 'TRANSPORT' ? 'DRIVER' : 'MERCHANT';
            const commissionSnapshot = await computeCommissionSnapshot(service, providerType, grandTotal, discountTotal);
            const pricingSnapshot = await computePricingSnapshot(service);

            const order = await tx.order.create({
                data: {
                    service,
                    details: JSON.stringify(details),
                    total: grandTotal,
                    status: 'PENDING',
                    userId: user.id,
                    promoCodeId,
                    orderItems: {
                        create: orderItemCreates
                    }
                }
            });

            // Create unified Transaction record with explicit fields
            const txnCode = generateTxnCode();
            const txnRecord = await tx.transaction.create({
                data: {
                    txnCode,
                    type: service,
                    userId: user.id,
                    amount: grandTotal,
                    providerId, // Link merchant if exists
                    promoCodeId,
                    // orderId: order.id, Removed because it is not in the DB schema

                    // Explicit math fields
                    subtotal,
                    discountTotal,
                    feesTotal,
                    deliveryFee,
                    grandTotal,

                    // Frozen pricing snapshot
                    basePriceSnapshot: pricingSnapshot.basePriceSnapshot,
                    feeComponentsSnapshot: pricingSnapshot.feeComponentsSnapshot,
                    pricingSnapshot: JSON.stringify(pricingSnapshot),
                    zoneSnapshot: pricingSnapshot.zoneSnapshot,
                    pricingRuleId: pricingSnapshot.pricingRuleId,

                    // Frozen commission snapshot
                    commissionRuleId: commissionSnapshot.commissionRuleId,
                    commissionSnapshot: JSON.stringify(commissionSnapshot),
                    unizyCommissionAmount: commissionSnapshot.unizyCommissionAmount,
                    providerNetAmount: commissionSnapshot.providerNetAmount,
                    promoSubsidyAmount: commissionSnapshot.promoSubsidyAmount,
                }
            });

            await tx.transactionHistory.create({
                data: {
                    transactionId: txnRecord.id,
                    newStatus: 'PENDING',
                    actorId: user.id,
                    reason: `${service} order placed`,
                }
            });

            if (pointsRedeemed > 0) {
                await tx.rewardTransaction.create({
                    data: {
                        userId: user.id,
                        transactionId: txnRecord.id,
                        type: 'REDEEM',
                        points: pointsRedeemed,
                        description: `Redeemed points for Txn ${txnRecord.id}`
                    }
                });
            }

            return { success: true, order, transaction: txnRecord };
        });

        // Log analytics outside transaction for guaranteed history insertion even on edge fail
        if (result.success) {
            await logEvent('ORDER_CREATED', result.order.id, { service, total: result.order.total });
            // Assuming payment is captured immediately upon order creation for simplicity
            await logEvent('PAYMENT_SUCCEEDED', result.order.id, { amount: result.order.total });
        }

        await createNotification(user.id, 'Order Placed', `Your ${service.toLowerCase()} order has been placed.`, 'SYSTEM', `/activity/tracking/${result.order.id}`);
        return result;
    } catch (error) {
        console.error('Failed to create order:', error);
        return { error: error.message || 'Failed to create the order.' };
    }
}

export async function getStudentOrders() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'STUDENT') {
            return { error: 'Unauthorized.' };
        }

        const orders = await prisma.order.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return orders;
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return [];
    }
}

export async function getDriverOrders() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'DRIVER') {
            return { error: 'Unauthorized.' };
        }

        // Drivers see pending orders or their accepted orders
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { status: 'PENDING' },
                    { driverId: user.id }
                ]
            },
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return orders;
    } catch (error) {
        console.error('Failed to fetch driver orders:', error);
        return [];
    }
}

export async function acceptOrder(orderId) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'DRIVER') {
            return { error: 'Unauthorized. Only drivers can accept orders.' };
        }

        const order = await prisma.order.update({
            where: {
                id: orderId,
                status: 'PENDING' // Ensure it's not already taken
            },
            data: {
                status: 'ACCEPTED',
                driverId: user.id
            }
        });

        revalidatePath('/driver');
        return { success: true, order };
    } catch (error) {
        console.error('Failed to accept order (possibly already taken):', error);
        return { error: 'Failed to accept order. It might have been taken by someone else.' };
    }
}

export async function updateOrderStatus(orderId, newStatus) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'DRIVER') {
            return { error: 'Unauthorized.' };
        }

        const result = await prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: {
                    id: orderId,
                    driverId: user.id
                },
                data: {
                    status: newStatus
                }
            });

            // If order is completed/delivered (payment captured), trigger Rewards EARN
            if (newStatus === 'DELIVERED') {
                const txn = await tx.transaction.findFirst({
                    where: { orderId: order.id }
                });

                if (txn && txn.amount > 0) {
                    // Rule: points = paid_amount * 0.1, rounded to 2 decimal places
                    const points = Math.round(txn.amount * 0.1 * 100) / 100;

                    await tx.rewardTransaction.create({
                        data: {
                            userId: order.userId,
                            transactionId: txn.id,
                            type: 'EARN',
                            points,
                            description: `Earned points for order ${order.id}`
                        }
                    });

                    await tx.rewardAccount.upsert({
                        where: { userId: order.userId },
                        update: { currentBalance: { increment: points } },
                        create: { userId: order.userId, currentBalance: points }
                    });
                }
            }

            return order;
        });

        // Analytics log for success
        if (newStatus === 'DELIVERED') {
            await logEvent('PAYMENT_SUCCEEDED', result.id, { amount: result.total });
            await logEvent('ORDER_STATUS_TRANSITION', result.id, { newStatus: 'DELIVERED' });
        } else {
            await logEvent('ORDER_STATUS_TRANSITION', result.id, { newStatus });
        }

        // Audit trail for order status transitions
        try {
            await logAdminAction(
                `ORDER_STATUS_${newStatus}`,
                'ORDERS',
                result.id,
                { driverId: user.id, orderId: result.id, previousStatus: null, newStatus }
            );
        } catch (_) { /* Non-critical: audit log failure should not break order flow */ }

        await createNotification(result.userId, 'Order Update', `Your order status changed to ${newStatus}.`, 'SYSTEM', `/activity/tracking/${result.id}`);

        revalidatePath('/driver');
        return { success: true, order: result };
    } catch (error) {
        console.error('Failed to update order status:', error);
        return { error: 'Failed to update order status.' };
    }
}

export async function getRideEstimate(pickup, destination, vehicle) {
    try {
        // Fallback pricing
        const basePrices = {
            'Standard': 45,
            'Premium': 75,
            'Scooter': 25,
            'Shuttle Bus': 10
        };

        let price = basePrices[vehicle] || 50;

        // Try to fetch pricing rule from Phase 35
        const rule = await prisma.pricingRule.findFirst({
            where: { module: 'TRANSPORT', isActive: true, serviceType: vehicle }
        });

        if (rule && rule.basePrice) {
            price = rule.basePrice;
        }

        // Apply a small random distance multiplier for demo (1.0 to 1.5)
        const multiplier = 1 + (Math.random() * 0.5);
        let finalPrice = price * multiplier;

        return { success: true, price: Math.ceil(finalPrice) };
    } catch (error) {
        console.error('Failed to get ride estimate:', error);
        return { success: false, error: 'Failed to get ride estimate.' };
    }
}

export async function cancelOrder(orderId) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Unauthorized.' };

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.userId !== user.id) return { error: 'Order not found.' };

        if (order.status !== 'PENDING' && order.status !== 'ACCEPTED') {
            return { error: 'Cannot cancel an order in progress.' };
        }

        const cancelled = await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' }
        });

        await createNotification(user.id, 'Order Cancelled', `Your order has been cancelled.`, 'SYSTEM');

        revalidatePath('/activity');
        revalidatePath(`/activity/tracking/${orderId}`);
        return { success: true, order: cancelled };
    } catch (error) {
        console.error('Failed to cancel order:', error);
        return { error: 'Failed to cancel order.' };
    }
}

export async function triggerSOS(orderId) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Unauthorized.' };

        // Create a critical support ticket
        const ticket = await prisma.supportTicket.create({
            data: {
                subject: `EMERGENCY ALERT: Order ${orderId}`,
                category: 'SAFETY',
                priority: 'HIGH',
                status: 'OPEN',
                userId: user.id
            }
        });

        return { success: true, ticket };
    } catch (error) {
        console.error('Failed to trigger SOS:', error);
        return { error: 'Failed to trigger SOS.' };
    }
}

export async function pollOrderStatus(orderId) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Unauthorized.' };

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                driver: {
                    select: { name: true, phone: true }
                }
            }
        });

        if (!order || order.userId !== user.id) {
            return { error: 'Order not found.' };
        }

        return { success: true, order };
    } catch (error) {
        console.error('Failed to fetch order status:', error);
        return { error: 'Failed to fetch order status.' };
    }
}
