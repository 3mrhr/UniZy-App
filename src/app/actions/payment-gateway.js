'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { earnRewardPoints } from './rewards-engine';
import { logAdminAction } from './audit';
import { v4 as uuidv4 } from 'uuid';

// ===== CONSTANTS =====
const PAYMENT_EXPIRY_MINUTES = 30; // Auto-cancel pending payments after 30 mins

/**
 * Create a payment intent for a transaction.
 * Generates an idempotency key to prevent double charges.
 * In production, this would call Paymob/Stripe API.
 *
 * @param {string} transactionId
 * @param {string} method - CARD, WALLET, COD, CASH
 * @param {string} gatewayProvider - PAYMOB, STRIPE, CASH, WALLET
 */
export async function createPaymentIntent(transactionId, method = 'CARD', gatewayProvider = 'PAYMOB') {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
        });
        if (!transaction) return { error: 'Transaction not found' };

        // Check for existing pending payment with this transaction (idempotency)
        const existingPayment = await prisma.payment.findFirst({
            where: {
                transactionId,
                status: { in: ['PENDING', 'PAID'] },
            },
        });
        if (existingPayment) {
            if (existingPayment.status === 'PAID') {
                return { error: 'This transaction is already paid.' };
            }
            return { success: true, payment: existingPayment, message: 'Existing pending payment found.' };
        }

        // Generate idempotency key
        const idempotencyKey = `PAY-${transaction.txnCode}-${Date.now()}`;

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + PAYMENT_EXPIRY_MINUTES);

        const payment = await prisma.payment.create({
            data: {
                transactionId,
                amount: transaction.amount,
                currency: transaction.currency,
                method,
                status: 'PENDING',
                idempotencyKey,
                gatewayProvider,
                expiresAt,
            },
        });

        // TODO: In production, call gateway API here and get gatewayRef

        return { success: true, payment };
    } catch (error) {
        console.error('Create payment intent error:', error);
        return { error: 'Failed to create payment.' };
    }
}

/**
 * Confirm a payment (webhook-style).
 * In production, this would ONLY be called by the payment gateway webhook.
 * NEVER by the frontend directly.
 *
 * @param {string} paymentId
 * @param {string} gatewayRef - External reference from gateway
 * @param {boolean} success - Whether the payment succeeded
 * @param {string|null} failureReason
 */
export async function confirmPayment(paymentId, gatewayRef, success, failureReason = null) {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { transaction: true },
        });

        if (!payment) return { error: 'Payment not found' };
        if (payment.status === 'PAID') return { error: 'Payment already confirmed' };
        if (payment.status === 'EXPIRED') return { error: 'Payment has expired' };

        if (success) {
            // Mark payment as PAID
            await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'PAID',
                    gatewayRef,
                    paidAt: new Date(),
                },
            });

            // Update transaction status
            await prisma.transaction.update({
                where: { id: payment.transactionId },
                data: { status: 'CONFIRMED' },
            });

            // Log history
            await prisma.transactionHistory.create({
                data: {
                    transactionId: payment.transactionId,
                    oldStatus: payment.transaction.status,
                    newStatus: 'CONFIRMED',
                    reason: `Payment confirmed via ${payment.gatewayProvider}`,
                },
            });

            // Earn reward points
            await earnRewardPoints(
                payment.transaction.userId,
                payment.amount,
                payment.transactionId
            );

            return { success: true, status: 'PAID' };
        } else {
            // Mark payment as FAILED
            await prisma.payment.update({
                where: { id: paymentId },
                data: {
                    status: 'FAILED',
                    gatewayRef,
                    failedReason: failureReason || 'Payment failed',
                },
            });

            return { success: true, status: 'FAILED' };
        }
    } catch (error) {
        console.error('Confirm payment error:', error);
        return { error: 'Failed to confirm payment.' };
    }
}

/**
 * Auto-expire pending payments past their TTL.
 * Should be called periodically (cron job or scheduled task).
 */
export async function expireStalePendingPayments() {
    try {
        const now = new Date();

        const result = await prisma.payment.updateMany({
            where: {
                status: 'PENDING',
                expiresAt: { lte: now },
            },
            data: {
                status: 'EXPIRED',
                failedReason: `Auto-expired after ${PAYMENT_EXPIRY_MINUTES} minutes`,
            },
        });

        return { success: true, expired: result.count };
    } catch (error) {
        console.error('Expire payments error:', error);
        return { error: 'Failed to expire payments.' };
    }
}

/**
 * Get payment status for a transaction (user-facing).
 */
export async function getPaymentStatus(transactionId) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const payment = await prisma.payment.findFirst({
            where: { transactionId },
            orderBy: { createdAt: 'desc' },
        });

        if (!payment) return { success: true, payment: null };
        return { success: true, payment };
    } catch (error) {
        console.error('Get payment status error:', error);
        return { error: 'Failed to get payment status.' };
    }
}
