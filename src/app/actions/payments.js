'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { checkFraudSignals } from './fraud-detection';
import { recordLedgerEntry, recordSplitEntry, LedgerAccount } from '@/lib/ledger';
import { earnRewardPoints } from './rewards-engine';

/**
 * Get all payments for the admin dashboard
 * Supports filtering by status and method
 */
export async function getPayments(filters = {}) {
    try {
        const user = await getCurrentUser();

        // Check if user has finance or superadmin privileges
        const isSuperAdmin = user?.role === "ADMIN_SUPER";
        const hasFinanceScope = user?.role === "ADMIN_COMMERCE" || user?.role === "ADMIN_TRANSPORT" || user?.role === "ADMIN_DELIVERY" || user?.role === "ADMIN_HOUSING";

        if (!user || (!isSuperAdmin && !hasFinanceScope)) {
            return { error: "Unauthorized. Requires admin privileges." };
        }

        const { status, method, page = 1, limit = 50, search } = filters;
        const skip = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;
        if (method) where.method = method;
        if (search) {
            where.OR = [
                { transaction: { txnCode: { contains: search, mode: 'insensitive' } } },
                { transaction: { user: { name: { contains: search, mode: 'insensitive' } } } },
                { transaction: { user: { email: { contains: search, mode: 'insensitive' } } } },
            ];
        }

        const payments = await prisma.payment.findMany({
            where,
            include: {
                transaction: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, phone: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });

        const total = await prisma.payment.count({ where });

        // Calculate sum of successful payments
        const successfulPaymentsSum = await prisma.payment.aggregate({
            where: { status: "PAID" },
            _sum: { amount: true }
        });

        const pendingPaymentsSum = await prisma.payment.aggregate({
            where: { status: "PENDING" },
            _sum: { amount: true }
        });

        return {
            payments,
            total,
            totalPages: Math.ceil(total / limit),
            stats: {
                totalPaid: successfulPaymentsSum._sum.amount || 0,
                totalPending: pendingPaymentsSum._sum.amount || 0
            }
        };
    } catch (error) {
        console.error("Error fetching payments:", error);
        return { error: "Failed to fetch payments." };
    }
}

/**
 * Get a specific payment by transaction ID for a student
 */
export async function getPaymentByTransaction(transactionId) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: "Unauthorized" };

        const payment = await prisma.payment.findFirst({
            where: {
                transactionId,
                transaction: {
                    userId: user.id
                }
            },
        });

        if (!payment) return { error: "Payment not found or access denied." };

        return { payment };
    } catch (error) {
        console.error("Error fetching payment:", error);
        return { error: "Failed to fetch payment details." };
    }
}

/**
 * Update the status of a payment (Admin only)
 */
export async function updatePaymentStatus(id, newStatus, reason = null) {
    try {
        const user = await getCurrentUser();

        // Check if user has finance or superadmin privileges
        const isSuperAdmin = user?.role === "ADMIN_SUPER";
        const hasFinanceScope = user?.role === "ADMIN_COMMERCE" || user?.role === "ADMIN_TRANSPORT" || user?.role === "ADMIN_DELIVERY" || user?.role === "ADMIN_HOUSING";

        if (!user || (!isSuperAdmin && !hasFinanceScope)) {
            return { error: "Unauthorized. Requires finance privileges." };
        }

        // Must be a valid status
        const validStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];
        if (!validStatuses.includes(newStatus)) {
            return { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
        }

        const currentPayment = await prisma.payment.findUnique({ where: { id } });
        if (!currentPayment) return { error: "Payment not found." };

        if (currentPayment.status === newStatus) {
            return { error: `Payment is already marked as ${newStatus}.` };
        }

        // 1. Platinum Fraud Guard: Check signals if we are moving to PAID
        if (newStatus === "PAID") {
            const fraud = await checkFraudSignals(currentPayment.transaction.userId, currentPayment.amount);
            if (fraud.flagged && fraud.score > 80) {
                // High risk - block automatic mark as paid
                return { error: `Fraud guard blocked this transaction. Reason: ${fraud.reason}`, details: fraud.details };
            }
        }

        const updateData = {
            status: newStatus,
            updatedAt: new Date()
        };

        if (newStatus === "PAID") {
            updateData.paidAt = new Date();
        } else if (newStatus === "FAILED" && reason) {
            updateData.failedReason = reason;
        }

        // Update payment, transaction, and create audit log
        const [updatedPayment] = await prisma.$transaction([
            prisma.payment.update({
                where: { id },
                data: updateData
            }),
            // Set the transaction status based on payment status
            prisma.transaction.update({
                where: { id: currentPayment.transactionId },
                data: {
                    status: newStatus === 'PAID' ? 'COMPLETED' : (newStatus === 'FAILED' ? 'FAILED' : 'PENDING')
                }
            }),
            prisma.auditLog.create({
                data: {
                    action: `UPDATE_PAYMENT_STATUS`,
                    module: "FINANCE",
                    targetId: id,
                    adminId: user.id,
                    details: JSON.stringify({
                        oldStatus: currentPayment.status,
                        newStatus,
                        amount: currentPayment.amount,
                        reason: reason || "Manual status update"
                    })
                }
            })
        ]);

        return { success: true, payment: updatedPayment };
    } catch (error) {
        console.error("Error updating payment status:", error);
        return { error: "Failed to update payment status." };
    }
}

/**
 * Internal helper to create a payment record when a transaction is generated
 */
export async function createPaymentRecord(transactionId, amount, method, currency = "EGP") {
    try {
        // 1. Idempotency Check: Don't create multiple payments for the same transaction
        const existing = await prisma.payment.findFirst({ where: { transactionId } });
        if (existing) return { success: true, payment: existing };

        // Basic validation
        if (!transactionId || amount === undefined || !method) {
            throw new Error("Missing required fields for payment creation.");
        }

        const validMethods = ["COD", "CASH", "CARD", "WALLET"];
        if (!validMethods.includes(method)) {
            throw new Error(`Invalid payment method: ${method}`);
        }

        const payment = await prisma.payment.create({
            data: {
                transactionId,
                amount: parseFloat(amount),
                currency,
                method,
                status: "PENDING"
            }
        });

        return { success: true, payment };
    } catch (error) {
        console.error("Error creating payment:", error);
        return { error: error.message || "Failed to create payment record." };
    }
}

/**
 * Elite: Authorize a payment (Hold Funds)
 * This reserves funds in the student's wallet (or gateway) but doesn't payout to merchant yet.
 */
export async function authorizePayment(transactionId) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: "Unauthorized" };

        const txn = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { payments: true }
        });

        if (!txn) return { error: "Transaction not found." };
        if (txn.userId !== user.id && user.role !== 'ADMIN_SUPER') return { error: "Access denied." };

        const payment = txn.payments[0]; // Assuming 1:1 for now
        if (!payment) return { error: "No payment record found for this transaction." };

        // 1. Platinum Fraud Guard
        const fraud = await checkFraudSignals(txn.userId, txn.amount);
        if (fraud.flagged && fraud.score > 80) {
            return { error: `Payment authorization blocked by fraud engine: ${fraud.reason}`, flagged: true };
        }

        return await prisma.$transaction(async (tx) => {
            // Update statuses
            const updatedPayment = await tx.payment.update({
                where: { id: payment.id },
                data: { status: 'AUTHORIZED' }
            });

            await tx.transaction.update({
                where: { id: txn.id },
                data: { status: 'AUTHORIZED' }
            });

            // Log history
            await tx.transactionHistory.create({
                data: {
                    transactionId: txn.id,
                    newStatus: 'AUTHORIZED',
                    actorId: user.id,
                    reason: 'Payment authorized and funds reserved.'
                }
            });

            // Elite Sync: Provision rewards at authorization
            await earnRewardPoints(txn.userId, txn.amount, txn.id, 'PROVISION');

            return { success: true, payment: updatedPayment };
        });

    } catch (error) {
        console.error("Auth payment error:", error);
        return { error: error.message || "Failed to authorize payment." };
    }
}

/**
 * Elite: Capture a payment (Payout and Ledger Settlement)
 * This is called when the order is DELIVERED or COMPLETED.
 */
export async function capturePayment(transactionId) {
    try {
        const adminOrSystem = await getCurrentUser(); // System could also call this via trigger

        const txn = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { payments: true }
        });

        if (!txn) return { error: "Transaction not found." };
        if (txn.status !== 'AUTHORIZED' && txn.status !== 'PENDING') {
            return { error: `Cannot capture transaction in status: ${txn.status}` };
        }

        return await prisma.$transaction(async (tx) => {
            // 1. Elite Ledger Distribution (The Split)
            // Gross (Captured from Escrow) -> Provider Net + VAT + Platform Fee + UniZy Profit

            const grossAmount = txn.amount;
            const vatRate = 0.14; // Regional Standard (Scaffolded)
            const vatAmount = Math.round(grossAmount * vatRate * 100) / 100;
            const platformFee = Math.round(grossAmount * 0.05 * 100) / 100; // 5% Platform Operation Fee
            const unizyProfit = txn.unizyCommissionAmount || (grossAmount * 0.1); // Default 10% if not set

            const providerNet = grossAmount - vatAmount - platformFee - unizyProfit;

            const splits = [
                { account: LedgerAccount.TAX_VAT, amount: vatAmount },
                { account: LedgerAccount.PLATFORM_FEE, amount: platformFee },
                { account: LedgerAccount.UNIZY_REVENUE, amount: unizyProfit }
            ];

            if (txn.providerId && providerNet > 0) {
                splits.push({ account: LedgerAccount.MERCHANT_PAYABLE, amount: providerNet });
            }

            // Record the balanced split: UNIZY_ESCROW (Debit) -> [TAX, FEE, REVENUE, MERCHANT] (Credits)
            await recordSplitEntry({
                debitAccount: LedgerAccount.UNIZY_ESCROW,
                credits: splits,
                description: `Elite Capture Split for Txn ${txn.txnCode}`,
                transactionId: txn.id,
                tx
            });

            // 2. Update statuses
            const updatedTxn = await tx.transaction.update({
                where: { id: txn.id },
                data: { status: 'COMPLETED' }
            });

            const payment = txn.payments[0];
            if (payment) {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: { status: 'PAID', paidAt: new Date() }
                });
            }

            await tx.transactionHistory.create({
                data: {
                    transactionId: txn.id,
                    oldStatus: txn.status,
                    newStatus: 'COMPLETED',
                    actorId: adminOrSystem?.id || 'SYSTEM',
                    reason: 'Payment captured and ledgered.'
                }
            });

            // Elite Sync: Finalize rewards at capture
            await earnRewardPoints(txn.userId, txn.amount, txn.id, 'FINALIZE');

            return { success: true, transaction: updatedTxn };
        });
    } catch (error) {
        console.error("Capture payment error:", error);
        return { error: error.message || "Failed to capture payment." };
    }
}
