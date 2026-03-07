'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { revalidatePath } from 'next/cache';
import { success, failure } from '@/lib/actionResult';
import { createNotification } from './notifications';
import { logEvent } from './analytics';
import { generateTxnCode } from './financial';

/**
 * Creates a custom "Order Anything" request
 */
export async function createCustomDelivery(itemDescription, pickupLocation, dropoffLocation, options = {}) {
    try {
        const user = await requireRole(['STUDENT']);

        const request = await prisma.customDeliveryRequest.create({
            data: {
                itemDescription,
                pickupLocation,
                dropoffLocation,
                pickupLat: options?.pickupLat,
                pickupLng: options?.pickupLng,
                dropoffLat: options?.dropoffLat,
                dropoffLng: options?.dropoffLng,
                userId: user.id,
                status: 'PENDING',
                deliveryOTP: Math.floor(100000 + Math.random() * 900000).toString()
            }
        });

        await logEvent('CUSTOM_DELIVERY_CREATED', request.id, { userId: user.id });

        revalidatePath('/delivery');
        return success(request);
    } catch (error) {
        console.error('Failed to create custom delivery:', error);
        return failure('CREATE_FAILED', 'Failed to create request.');
    }
}

/**
 * Courier completes a custom delivery using the student's OTP
 */
export async function completeCustomDelivery(requestId, otp) {
    try {
        const user = await requireRole(['COURIER']);

        const request = await prisma.customDeliveryRequest.findUnique({
            where: { id: requestId },
            include: { transaction: true }
        });

        if (!request || request.courierId !== user.id) {
            return failure('UNAUTHORIZED', 'You are not the assigned courier.');
        }

        if (!otp || otp !== request.deliveryOTP) {
            await prisma.customDeliveryRequest.update({
                where: { id: requestId },
                data: { failedOtpAttempts: { increment: 1 } }
            });

            if ((request.failedOtpAttempts + 1) >= 5) {
                // Potential brute force - could flag for admin review here
                console.warn(`Brute force attempt detected on delivery ${requestId}`);
            }
            return failure('INVALID_OTP', `Invalid delivery code. Attempts: ${request.failedOtpAttempts + 1}/5`);
        }

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.customDeliveryRequest.update({
                where: { id: requestId },
                data: { status: 'DELIVERED' }
            });

            // Handle Payout if transaction exists
            if (request.transactionId) {
                const txn = await tx.transaction.findUnique({
                    where: { id: request.transactionId }
                });

                if (txn && txn.providerNetAmount > 0) {
                    const wallet = await tx.wallet.upsert({
                        where: { userId: user.id },
                        update: { balance: { increment: txn.providerNetAmount } },
                        create: { userId: user.id, balance: txn.providerNetAmount }
                    });

                    await tx.walletTransaction.create({
                        data: {
                            walletId: wallet.id,
                            type: 'COMMISSION',
                            amount: txn.providerNetAmount,
                            description: `Commission for Custom Delivery ${request.id}`,
                            transactionId: txn.id
                        }
                    });

                    await tx.transaction.update({
                        where: { id: txn.id },
                        data: { status: 'COMPLETED' }
                    });
                }
            }

            return updated;
        });

        await createNotification(
            request.userId,
            'Delivery Complete! 🎉',
            'Your custom delivery has been successfully verified and completed.',
            'SYSTEM',
            '/activity'
        );

        revalidatePath('/courier');
        revalidatePath(`/activity/tracking/${requestId}`);
        return success(result);
    } catch (error) {
        console.error('Failed to complete delivery:', error);
        return failure('COMPLETE_FAILED', 'Failed to complete delivery.');
    }
}

/**
 * Student approves the price set by the courier for a custom order
 * Creates a financial transaction and moves the status to READY (or PICKED_UP)
 */
export async function approveCustomPrice(requestId) {
    try {
        const user = await requireRole(['STUDENT']);

        const request = await prisma.customDeliveryRequest.findUnique({
            where: { id: requestId },
            include: { courier: true }
        });

        if (!request || request.userId !== user.id) {
            return failure('UNAUTHORIZED', 'You are not authorized for this request.');
        }

        if (!request.actualCost) {
            return failure('INVALID_STATE', 'Courier has not set a price yet.');
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Create financial snapshot
            const baseFee = 25; // Delivery fee
            const totalAmount = request.actualCost + baseFee;

            const txnCode = await generateTxnCode();
            const txn = await tx.transaction.create({
                data: {
                    txnCode,
                    type: 'DELIVERY',
                    userId: user.id,
                    providerId: request.courierId, // The courier gets the net
                    amount: totalAmount,
                    subtotal: request.actualCost,
                    feesTotal: baseFee,
                    deliveryFee: baseFee,
                    grandTotal: totalAmount,
                    providerNetAmount: request.actualCost, // Courier gets 100% of item cost
                    unizyCommissionAmount: baseFee, // UniZy keeps the delivery fee
                    status: 'PENDING'
                }
            });

            // 2. Link transaction to request and update status
            const updatedRequest = await tx.customDeliveryRequest.update({
                where: { id: requestId },
                data: {
                    transactionId: txn.id,
                    status: 'PICKED_UP'
                }
            });

            return { updatedRequest, txn };
        });

        await createNotification(
            request.courierId,
            'Price Approved! 🚀',
            `The student approved the price for "${request.itemDescription.substring(0, 20)}...". You can now proceed to dropoff.`,
            'SYSTEM',
            '/courier'
        );

        revalidatePath(`/activity/tracking/${requestId}`);
        revalidatePath('/courier');
        return success(result);
    } catch (error) {
        console.error('Failed to approve price:', error);
        return failure('APPROVE_FAILED', 'Failed to approve. Please try again.');
    }
}

/**
 * Courier accepts a custom delivery task
 */
export async function acceptCustomDelivery(requestId) {
    try {
        const user = await requireRole(['COURIER']);

        const updated = await prisma.customDeliveryRequest.updateMany({
            where: {
                id: requestId,
                status: 'PENDING',
                courierId: null
            },
            data: {
                status: 'ACCEPTED',
                courierId: user.id
            }
        });

        if (updated.count === 0) {
            return failure('UNAVAILABLE', 'Request is no longer available.');
        }

        const request = await prisma.customDeliveryRequest.findUnique({ where: { id: requestId } });

        await createNotification(
            request.userId,
            'Courier Assigned! 🛵',
            `A courier has accepted your custom request: "${request.itemDescription.substring(0, 20)}..."`,
            'SYSTEM',
            `/activity/tracking/${request.id}`
        );

        revalidatePath('/courier');
        return success(request);
    } catch (error) {
        console.error('Failed to accept custom delivery:', error);
        return failure('ACCEPT_FAILED', 'Failed to accept request.');
    }
}

/**
 * Courier confirms the actual cost of items for a custom delivery
 * This triggers a notification to the student to approve/pay
 */
export async function setCustomItemPrice(requestId, actualCost) {
    try {
        const user = await requireRole(['COURIER']);

        const request = await prisma.customDeliveryRequest.findUnique({
            where: { id: requestId }
        });

        if (!request || request.courierId !== user.id) {
            return failure('UNAUTHORIZED', 'You are not the assigned courier.');
        }

        const updated = await prisma.customDeliveryRequest.update({
            where: { id: requestId },
            data: {
                actualCost: parseFloat(actualCost),
                status: 'PREPARING' // Transition to preparing after price set
            }
        });

        await createNotification(
            request.userId,
            'Price Confirmed 💰',
            `Courier confirmed the cost: ${actualCost} EGP for your request. Items are being prepared.`,
            'SYSTEM',
            `/activity/tracking/${request.id}`
        );

        revalidatePath('/courier');
        revalidatePath(`/activity/tracking/${requestId}`);
        return success(updated);
    } catch (error) {
        console.error('Failed to set item price:', error);
        return failure('UPDATE_FAILED', 'Failed to update price.');
    }
}


/**
 * Get active tasks assigned to the current courier
 */
export async function getCourierActiveTasks() {
    try {
        const user = await requireRole(['COURIER', 'DRIVER']);

        const [orders, custom, trips] = await Promise.all([
            prisma.order.findMany({
                where: {
                    driverId: user.id,
                    status: { in: ['PICKED_UP', 'IN_TRANSIT'] }
                },
                include: { user: { select: { name: true } } }
            }),
            prisma.customDeliveryRequest.findMany({
                where: {
                    courierId: user.id,
                    status: { in: ['ACCEPTED', 'PREPARING', 'PICKED_UP'] }
                },
                include: { user: { select: { name: true } } }
            }),
            prisma.transportTrip.findMany({
                where: {
                    driverId: user.id,
                    status: { in: ['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'] }
                },
                include: { user: { select: { name: true } } }
            })
        ]);

        return success([
            ...orders.map(o => ({ ...o, type: 'merchant' })),
            ...custom.map(c => ({ ...c, type: 'custom' })),
            ...trips.map(t => ({ ...t, type: 'trip' }))
        ]);
    } catch (error) {
        console.error('Failed to fetch active tasks:', error);
        return failure('FETCH_FAILED', 'Failed to load active tasks.');
    }
}

/**
 * Get available custom requests for couriers
 */
export async function getAvailableCustomRequests() {
    try {
        await requireRole(['COURIER']);

        const requests = await prisma.customDeliveryRequest.findMany({
            where: {
                status: 'PENDING',
                courierId: null
            },
            include: {
                user: {
                    select: { name: true, university: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return success(requests);
    } catch (error) {
        console.error('Failed to fetch custom requests:', error);
        return failure('FETCH_FAILED', 'Failed to load requests.');
    }
}
