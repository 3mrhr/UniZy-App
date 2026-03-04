'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';
import { revalidatePath } from 'next/cache';
import { logEvent } from './analytics';

/**
 * Get all refund requests (Admin specific)
 */
export async function getRefunds({ page = 1, limit = 20, status = null } = {}) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
            return { error: 'Unauthorized. Admin only.' };
        }

        const skip = (page - 1) * limit;
        const where = status ? { status } : {};

        const refunds = await prisma.refund.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                transaction: {
                    include: {
                        user: {
                            select: { name: true, email: true, phone: true }
                        }
                    }
                },
                requestedBy: true,
                approvedBy: true,
            }
        });

        const total = await prisma.refund.count({ where });

        return { refunds, total, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error('Error fetching refunds:', error);
        return { error: error.message };
    }
}

/**
 * Approve or Reject a Refund Request
 */
export async function updateRefundStatus(refundId, newStatus) {
    try {
        const admin = await getCurrentUser();
        if (!admin || (!admin.role?.startsWith('ADMIN_') && admin.role !== 'ADMIN_SUPER')) {
            return { error: 'Unauthorized.' };
        }

        const validStatuses = ['APPROVED', 'REJECTED', 'PROCESSED'];
        if (!validStatuses.includes(newStatus)) {
            return { error: 'Invalid status.' };
        }

        const updatedRefund = await prisma.$transaction(async (tx) => {
            const refund = await tx.refund.findUnique({
                where: { id: refundId },
                include: { transaction: true }
            });

            if (!refund) throw new Error('Refund request not found.');

            const updateData = {
                status: newStatus,
                approvedById: newStatus === 'APPROVED' ? admin.id : refund.approvedById,
                processedAt: newStatus === 'PROCESSED' ? new Date() : refund.processedAt,
            };

            const updated = await tx.refund.update({
                where: { id: refundId },
                data: updateData
            });

            // ===== FINANCIAL CASCADE when refund is PROCESSED =====
            if (newStatus === 'PROCESSED' && refund.transaction) {
                const txn = refund.transaction;

                // 1. Update Transaction status → REFUNDED
                await tx.transaction.update({
                    where: { id: txn.id },
                    data: {
                        status: 'REFUNDED',
                        // Reverse commission amounts (zero them out for full refunds)
                        unizyCommissionAmount: refund.type === 'FULL' ? 0 : Math.max(0, txn.unizyCommissionAmount - (txn.unizyCommissionAmount * (refund.amount / txn.amount))),
                        providerNetAmount: refund.type === 'FULL' ? 0 : Math.max(0, txn.providerNetAmount - (txn.providerNetAmount * (refund.amount / txn.amount))),
                    },
                });

                // 2. Log status transition in TransactionHistory
                await tx.transactionHistory.create({
                    data: {
                        transactionId: txn.id,
                        oldStatus: txn.status,
                        newStatus: 'REFUNDED',
                        actorId: admin.id,
                        reason: `Refund ${refund.type} processed: ${refund.reason}`,
                    },
                });

                // 3. Update Payment status if applicable
                const payment = await tx.payment.findFirst({
                    where: { transactionId: txn.id, status: 'PAID' }
                });
                if (payment && refund.type === 'FULL') {
                    await tx.payment.update({
                        where: { id: payment.id },
                        data: { status: 'REFUNDED' }
                    });
                }

                // 4. Adjust related Settlement if one exists
                if (txn.providerId) {
                    const settlement = await tx.settlement.findFirst({
                        where: {
                            providerId: txn.providerId,
                            periodStart: { lte: txn.createdAt },
                            periodEnd: { gte: txn.createdAt },
                        },
                    });

                    if (settlement && txn.amount > 0) {
                        const refundRatio = refund.amount / txn.amount;
                        await tx.settlement.update({
                            where: { id: settlement.id },
                            data: {
                                grossAmount: Math.max(0, settlement.grossAmount - refund.amount),
                                commissionAmount: Math.max(0, settlement.commissionAmount - (txn.unizyCommissionAmount * refundRatio)),
                                netAmount: Math.max(0, settlement.netAmount - (txn.providerNetAmount * refundRatio)),
                            },
                        });
                    }
                }

                // 5. Reverse reward points (Inline for atomic guarantee)
                const pointLog = await tx.rewardTransaction.findFirst({
                    where: { orderId: txn.orderId, type: 'EARN' } // Find what was earned 
                });

                if (pointLog) {
                    // deduct points earned from that order
                    const reversedPoints = Math.round(pointLog.points * 100) / 100;
                    await tx.rewardTransaction.create({
                        data: {
                            userId: txn.userId,
                            transactionId: txn.id,
                            type: 'REVERSE',
                            points: -Math.abs(reversedPoints),
                            description: `Reversed ${reversedPoints} points for refunded Txn ${txn.id}`
                        }
                    });

                    // Update account balance
                    await tx.rewardAccount.update({
                        where: { userId: txn.userId },
                        data: { currentBalance: { decrement: pointLog.points } }
                    });
                }

                // 6. Credit wallet if refund goes to wallet (Inline for atomic)
                if (refund.type === 'FULL') {
                    const wallet = await tx.wallet.findUnique({ where: { userId: txn.userId } });
                    if (wallet) {
                        await tx.wallet.update({
                            where: { id: wallet.id },
                            data: { balance: { increment: refund.amount } }
                        });
                        await tx.walletTransaction.create({
                            data: {
                                walletId: wallet.id,
                                amount: refund.amount,
                                type: 'CREDIT',
                                status: 'COMPLETED',
                                reference: `Refund for Tk ${txn.txnCode || txn.id}`,
                                actorId: admin.id
                            }
                        });
                    } else {
                        // Create wallet if it doesn't exist? For now, standard behavior is assumed.
                        const newWallet = await tx.wallet.create({
                            data: { userId: txn.userId, balance: refund.amount }
                        });
                        await tx.walletTransaction.create({
                            data: {
                                walletId: newWallet.id,
                                amount: refund.amount,
                                type: 'CREDIT',
                                status: 'COMPLETED',
                                reference: `Refund Tk ${txn.txnCode || txn.id}`,
                                actorId: admin.id
                            }
                        });
                    }
                }
            }

            return updated;
        });

        // Audit Log
        await logAdminAction(
            `Marked Refund ${refundId} as ${newStatus}`,
            'FINANCE',
            refundId,
            { previousStatus: null, newStatus }
        );

        if (newStatus === 'PROCESSED') {
            await logEvent('REFUND_PROCESSED', updatedRefund.transactionId, { refundId: updatedRefund.id, amount: updatedRefund.amount });
        }

        revalidatePath('/admin/refunds');
        return { success: true, refund: updatedRefund };
    } catch (error) {
        console.error('Error updating refund status:', error);
        return { error: error.message };
    }
}

/**
 * Create a new Refund Request (Support Agent or Admin)
 */
export async function createRefundRequest({ transactionId, amount, type, reason }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Unauthorized' };

        // Validate transaction exists
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) return { error: 'Transaction not found.' };

        // Ensure no duplicate active requests exist
        const existingRef = await prisma.refund.findFirst({
            where: {
                transactionId,
                status: { in: ['REQUESTED', 'APPROVED'] }
            }
        });

        if (existingRef) return { error: 'An active refund request already exists for this transaction.' };

        const refund = await prisma.refund.create({
            data: {
                transactionId,
                amount: parseFloat(amount),
                type,
                reason,
                requestedById: user.id
            }
        });

        return { success: true, refund };
    } catch (error) {
        console.error('Error creating refund:', error);
        return { error: error.message };
    }
}
