'use server';

import { prisma } from '@/lib/prisma';
import { requireRole, requireOwnership } from '@/lib/authz';
import { revalidatePath } from 'next/cache';
import { completeReferralIfEligible } from './referrals';
import { createNotification } from './notifications';
import { generateTxnCode, computeCommissionSnapshot, computePricingSnapshot } from './financial';
import { logEvent } from './analytics';
import { logAdminAction } from './audit';
import { success, failure } from '@/lib/actionResult';

export async function createOrder(service, details, clientTotal, promoCodeStr = null, lineItems = []) {
    try {
        const user = await requireRole(['STUDENT']);

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
            return failure('DUPLICATE', 'A similar order was just placed. Please wait a moment before trying again.');
        }

        const result = await prisma.$transaction(async (tx) => {
            let subtotal = 0;
            let orderItemCreates = [];
            let providerId = details.vendorId || null;

            if (isCartBased) {
                const mealIds = lineItems.map(item => item.mealId);
                const meals = await tx.meal.findMany({
                    where: { id: { in: mealIds } },
                    include: { variantGroups: { include: { options: true } }, addonGroups: { include: { options: true } } }
                });
                const mealsMap = new Map(meals.map(m => {
                    // Pre-index variants and addons for O(1) lookup
                    const variantGroupsMap = new Map(m.variantGroups.map(g => [
                        g.id,
                        { ...g, optionsMap: new Map(g.options.map(o => [o.id, o])) }
                    ]));
                    const addonGroupsMap = new Map(m.addonGroups.map(g => [
                        g.id,
                        { ...g, optionsMap: new Map(g.options.map(o => [o.id, o])) }
                    ]));

                    return [m.id, { ...m, variantGroupsMap, addonGroupsMap }];
                }));

                const mealOptionMaps = new Map();

                for (const meal of meals) {
                    const variantGroupsMap = new Map();
                    if (meal.variantGroups) {
                        for (const group of meal.variantGroups) {
                            const optMap = new Map();
                            if (group.options) {
                                for (const opt of group.options) {
                                    optMap.set(opt.id, opt);
                                }
                            }
                            variantGroupsMap.set(group.id, { group, optMap });
                        }
                    }

                    const addonGroupsMap = new Map();
                    if (meal.addonGroups) {
                        for (const group of meal.addonGroups) {
                            const optMap = new Map();
                            if (group.options) {
                                for (const opt of group.options) {
                                    optMap.set(opt.id, opt);
                                }
                            }
                            addonGroupsMap.set(group.id, { group, optMap });
                        }
                    }

                    mealOptionMaps.set(meal.id, { variantGroupsMap, addonGroupsMap });
                }

                for (const item of lineItems) {
                    const meal = mealsMap.get(item.mealId);

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

                    const optionMaps = mealOptionMaps.get(meal.id);

                    // Compute Variants
                    if (item.variants && item.variants.length > 0) {
                        const variantGroupsMap = optionMaps?.variantGroupsMap;

                        for (const v of item.variants) {
                            const groupObj = variantGroupsMap?.get(v.groupId);
                            const opt = groupObj?.optMap.get(v.optionId);
                            if (opt && opt.isAvailable) {
                                variantsTotal += opt.priceDelta;
                                itemVariantSelections.push({
                                    groupNameSnapshot: groupObj.group.name,
                                    optionNameSnapshot: opt.name,
                                    priceDeltaSnapshot: opt.priceDelta
                                });
                            }
                        }
                    }

                    // Compute Addons
                    if (item.addons && item.addons.length > 0) {
                        const addonGroupsMap = optionMaps?.addonGroupsMap;

                        for (const a of item.addons) {
                            const groupObj = addonGroupsMap?.get(a.groupId);
                            const opt = groupObj?.optMap.get(a.optionId);
                            if (opt && opt.isAvailable) {
                                addonsTotal += opt.priceDelta;
                                itemAddonSelections.push({
                                    groupNameSnapshot: groupObj.group.name,
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
                    orderId: order.id,

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

            return success({ order, transaction: txnRecord });
        });

        // Log analytics outside transaction
        if (result?.ok) {
            try {
                await logEvent('ORDER_CREATED', result.data.order.id, { service, total: result.data.order.total });
                await logEvent('PAYMENT_SUCCEEDED', result.data.order.id, { amount: result.data.order.total });
                await createNotification(user.id, 'Order Placed', `Your ${service.toLowerCase()} order has been placed.`, 'SYSTEM', `/activity/tracking/${result.data.order.id}`);
            } catch (_) { /* non-critical */ }
        }
        return result;
    } catch (error) {
        console.error('Failed to create order:', error);
        return failure('CREATE_FAILED', error.message || 'Failed to create the order.');
    }
}

export async function getStudentOrders() {
    try {
        const user = await requireRole(['STUDENT']);

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
        const user = await requireRole(['DRIVER']);

        // Drivers see READY delivery orders (available to pick up) + their own assigned orders
        const orders = await prisma.order.findMany({
            where: {
                service: 'DELIVERY',
                OR: [
                    { status: 'READY', driverId: null },
                    { driverId: user.id }
                ]
            },
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                    }
                },
                orderItems: {
                    select: {
                        nameSnapshot: true,
                        qty: true,
                        basePriceSnapshot: true,
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
        const user = await requireRole(['DRIVER']);

        // Conditional update: only accept if status is READY and no driver assigned (prevents double-accept)
        const updated = await prisma.order.updateMany({
            where: {
                id: orderId,
                status: 'READY',
                driverId: null
            },
            data: {
                status: 'PICKED_UP',
                driverId: user.id
            }
        });

        if (updated.count === 0) {
            return failure('UNAVAILABLE', 'Order is no longer available. It may have been taken by another driver.');
        }

        const order = await prisma.order.findUnique({ where: { id: orderId } });

        try {
            await createNotification(order.userId, 'Driver Assigned', `A driver has picked up your order!`, 'SYSTEM', `/activity/tracking/${order.id}`);
        } catch (_) { /* non-critical */ }

        revalidatePath('/driver');
        revalidatePath('/merchant');
        return success({ order });
    } catch (error) {
        console.error('Failed to accept order:', error);
        return failure('ACCEPT_FAILED', 'Failed to accept order.');
    }
}

// Allowed driver transitions
const DRIVER_TRANSITIONS = {
    'PICKED_UP': ['IN_TRANSIT', 'DELIVERED'],
    'IN_TRANSIT': ['DELIVERED']
};

export async function updateOrderStatus(orderId, newStatus) {
    try {
        const user = await requireRole(['DRIVER']);

        // Verify ownership: driver can only update their own orders
        const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
        if (!existingOrder) return failure('NOT_FOUND', 'Order not found.');

        requireOwnership(existingOrder.driverId, user.id);

        // Enforce state machine
        const allowed = DRIVER_TRANSITIONS[existingOrder.status];
        if (!allowed || !allowed.includes(newStatus)) {
            return failure('INVALID_STATE', `Cannot transition from ${existingOrder.status} to ${newStatus}.`);
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

            // If order is completed/delivered, trigger Rewards EARN
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

                    // Update transaction status to COMPLETED
                    await tx.transaction.update({
                        where: { id: txn.id },
                        data: { status: 'COMPLETED' }
                    });

                    await tx.transactionHistory.create({
                        data: {
                            transactionId: txn.id,
                            oldStatus: txn.status,
                            newStatus: 'COMPLETED',
                            actorId: user.id,
                            reason: 'Order delivered'
                        }
                    });
                }
            }

            return order;
        });

        // Analytics log
        if (newStatus === 'DELIVERED') {
            await logEvent('PAYMENT_SUCCEEDED', result.id, { amount: result.total });
            await logEvent('ORDER_STATUS_TRANSITION', result.id, { newStatus: 'DELIVERED' });
        } else {
            await logEvent('ORDER_STATUS_TRANSITION', result.id, { newStatus });
        }
        await logAdminAction(
            `ORDER_STATUS_${newStatus}`,
            'ORDERS',
            result.id,
            { driverId: user.id, orderId: result.id, previousStatus: existingOrder.status, newStatus }
        );

        await createNotification(result.userId, 'Order Update', `Your order status changed to ${newStatus}.`, 'SYSTEM', `/activity/tracking/${result.id}`);

        revalidatePath('/driver');
        return success({ order: result });
    } catch (error) {
        console.error('Failed to update order status:', error);
        return failure('UPDATE_FAILED', 'Failed to update order status.');
    }
}

// ============================================================
// MERCHANT ORDER ACTIONS
// ============================================================

// Allowed merchant transitions
const MERCHANT_TRANSITIONS = {
    'PENDING': ['ACCEPTED'],
    'ACCEPTED': ['PREPARING'],
    'PREPARING': ['READY'],
};

export async function getMerchantOrders() {
    try {
        const user = await requireRole(['MERCHANT']);

        // Only return orders that contain this merchant's meals (ownership enforcement)
        const orders = await prisma.order.findMany({
            where: {
                service: 'DELIVERY',
                orderItems: {
                    some: {
                        meal: {
                            merchantId: user.id
                        }
                    }
                }
            },
            include: {
                user: { select: { name: true, phone: true } },
                orderItems: {
                    select: {
                        nameSnapshot: true,
                        qty: true,
                        basePriceSnapshot: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return { success: true, orders };
    } catch (error) {
        console.error('Failed to fetch merchant orders:', error);
        return { error: 'Failed to fetch orders.' };
    }
}

export async function updateMerchantOrderStatus(orderId, newStatus) {
    try {
        const user = await requireRole(['MERCHANT']);

        // Ownership check: ensure order contains this merchant's meals
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                orderItems: {
                    some: {
                        meal: {
                            merchantId: user.id
                        }
                    }
                }
            }
        });

        if (!order) {
            return failure('NOT_FOUND', 'Order not found or does not belong to you.');
        }

        // Enforce state machine
        const allowed = MERCHANT_TRANSITIONS[order.status];
        if (!allowed || !allowed.includes(newStatus)) {
            return failure('INVALID_STATE', `Cannot transition from ${order.status} to ${newStatus}.`);
        }

        const updated = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus }
        });

        try {
            await createNotification(order.userId, 'Order Update', `Your order is now ${newStatus}.`, 'SYSTEM', `/activity/tracking/${order.id}`);
            await logEvent('ORDER_STATUS_TRANSITION', order.id, { newStatus, actor: 'MERCHANT' });
        } catch (_) { /* non-critical */ }

        revalidatePath('/merchant');
        return success({ order: updated });
    } catch (error) {
        console.error('Failed to update merchant order status:', error);
        return failure('UPDATE_FAILED', 'Failed to update order status.');
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
        const user = await requireRole(['STUDENT', 'MERCHANT', 'DRIVER']);

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) return { error: 'Order not found.' };

        // Ownership check
        if (order.userId !== user.id) {
            return { error: 'Unauthorized: Order belongs to another user.' };
        }

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
        const user = await requireRole(['STUDENT', 'DRIVER']);

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
        const user = await requireRole(['STUDENT']);

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                driver: {
                    select: { name: true, phone: true }
                }
            }
        });

        if (!order) {
            return { error: 'Order not found.' };
        }

        requireOwnership(order.userId, user.id);

        return { success: true, order };
    } catch (error) {
        console.error('Failed to fetch order status:', error);
        return { error: 'Failed to fetch order status.' };
    }
}
