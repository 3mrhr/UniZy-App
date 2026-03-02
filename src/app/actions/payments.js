'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

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
