'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';
import { completeReferralIfEligible } from './referrals';
import { validatePromoCode } from './promotions';
import { createNotification } from './notifications';
import { computeCommissionSnapshot, computePricingSnapshot, generateTxnCode } from './financial';

export async function createOrder(service, details, total, promoCodeStr = null) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'STUDENT') {
            return { error: 'Only students can create orders.' };
        }

        let finalTotal = parseFloat(total);
        let promoCodeId = null;

        if (promoCodeStr) {
            const promoRes = await validatePromoCode(promoCodeStr, service);
            if (promoRes.success && promoRes.promo) {
                const promo = promoRes.promo;
                promoCodeId = promo.id;

                if (promo.discountType === 'PERCENTAGE') {
                    finalTotal = finalTotal - (finalTotal * (promo.discountAmount / 100));
                } else {
                    finalTotal = Math.max(0, finalTotal - promo.discountAmount);
                }

                await prisma.promoCode.update({
                    where: { id: promo.id },
                    data: { currentUses: { increment: 1 } }
                });
            } else {
                return { error: promoRes.error || 'Invalid promo code' };
            }
        }

        // Compute financial snapshots BEFORE creating records
        const promoDiscount = parseFloat(total) - finalTotal;
        const providerType = service === 'TRANSPORT' ? 'DRIVER' : 'MERCHANT';
        const commissionSnapshot = await computeCommissionSnapshot(service, providerType, finalTotal, promoDiscount);
        const pricingSnapshot = await computePricingSnapshot(service);

        const order = await prisma.order.create({
            data: {
                service,
                details: JSON.stringify(details),
                total: finalTotal,
                status: 'PENDING',
                userId: user.id,
                promoCodeId
            }
        });

        // Create unified Transaction record with frozen snapshots
        const txnCode = generateTxnCode();
        const txnRecord = await prisma.transaction.create({
            data: {
                txnCode,
                type: service,
                userId: user.id,
                amount: finalTotal,
                providerId: null, // Set when driver/merchant accepts
                promoCodeId,
                // Frozen pricing snapshot
                basePriceSnapshot: pricingSnapshot.basePriceSnapshot,
                feeComponentsSnapshot: pricingSnapshot.feeComponentsSnapshot,
                zoneSnapshot: pricingSnapshot.zoneSnapshot,
                pricingRuleId: pricingSnapshot.pricingRuleId,
                // Frozen commission snapshot
                commissionRuleId: commissionSnapshot.commissionRuleId,
                unizyCommissionAmount: commissionSnapshot.unizyCommissionAmount,
                providerNetAmount: commissionSnapshot.providerNetAmount,
                promoSubsidyAmount: commissionSnapshot.promoSubsidyAmount,
            }
        });

        await prisma.transactionHistory.create({
            data: {
                transactionId: txnRecord.id,
                newStatus: 'PENDING',
                actorId: user.id,
                reason: `${service} order placed`,
            }
        });

        // Notify User
        await createNotification(user.id, 'Order Placed', `Your ${service.toLowerCase()} order has been placed.`, 'SYSTEM', `/activity/tracking/${order.id}`);

        // Trigger referral completion if this is the student's first order
        await completeReferralIfEligible(user.id);

        // Revalidate relevant pages
        if (service === 'TRANSPORT') {
            revalidatePath('/transport');
        } else {
            revalidatePath('/delivery');
        }
        revalidatePath('/activity');

        return { success: true, order, transaction: txnRecord };
    } catch (error) {
        console.error('Failed to create order:', error);
        return { error: 'Failed to create the order.' };
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

        const order = await prisma.order.update({
            where: {
                id: orderId,
                driverId: user.id
            },
            data: {
                status: newStatus
            }
        });

        await createNotification(order.userId, 'Order Update', `Your order status changed to ${newStatus}.`, 'SYSTEM', `/activity/tracking/${order.id}`);

        revalidatePath('/driver');
        return { success: true, order };
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
