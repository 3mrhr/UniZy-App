'use server';

import { prisma } from '@/lib/prisma';
import { requireUser, requireRole, requireOwnership } from '@/lib/authz';

/**
 * Get or create a wallet for the current user.
 */
export async function getOrCreateWallet() {
    try {
        const user = await requireUser();

        let wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
            include: {
                walletTransactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });

        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: {
                    userId: user.id,
                    balance: 0,
                    currency: 'EGP',
                },
                include: {
                    walletTransactions: true,
                },
            });
        }

        return { success: true, wallet };
    } catch (error) {
        console.error('Wallet error:', error);
        return { error: error.message || 'Failed to fetch wallet.' };
    }
}

/**
 * Credit wallet (for refunds → wallet credit).
 * @param {string} userId
 * @param {number} amount
 * @param {string} description
 * @param {string|null} transactionId - Reference to the original transaction
 */
export async function creditWallet(userId, amount, description, transactionId = null) {
    try {
        await requireRole(['ADMIN_SUPER', 'ADMIN_FINANCE', 'ADMIN_SUPPORT']);

        if (amount <= 0) return { error: 'Amount must be positive.' };

        // Get or create wallet
        let wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: { userId, balance: 0, currency: 'EGP' },
            });
        }

        // Create wallet transaction and update balance atomically
        const result = await prisma.$transaction(async (tx) => {
            const walletTxn = await tx.walletTransaction.create({
                data: {
                    type: 'REFUND_CREDIT',
                    amount,
                    description,
                    walletId: wallet.id,
                    transactionId,
                },
            });

            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } },
            });

            return { walletTxn, updatedWallet };
        });

        return { success: true, newBalance: result.updatedWallet.balance };
    } catch (error) {
        console.error('Credit wallet error:', error);
        return { error: error.message || 'Failed to credit wallet.' };
    }
}

/**
 * Spend from wallet on an order.
 * @param {string} userId
 * @param {number} amount
 * @param {string} description
 * @param {string|null} transactionId
 */
export async function spendFromWallet(userId, amount, description, transactionId = null) {
    try {
        const user = await requireUser();
        requireOwnership(userId, user.id);

        if (amount <= 0) return { error: 'Amount must be positive.' };

        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) return { error: 'No wallet found.' };
        if (wallet.balance < amount) {
            return { error: `Insufficient wallet balance. Available: ${wallet.balance} EGP` };
        }

        const result = await prisma.$transaction(async (tx) => {
            const walletTxn = await tx.walletTransaction.create({
                data: {
                    type: 'SPEND',
                    amount: -amount,
                    description,
                    walletId: wallet.id,
                    transactionId,
                },
            });

            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } },
            });

            return { walletTxn, updatedWallet };
        });

        return { success: true, newBalance: result.updatedWallet.balance };
    } catch (error) {
        console.error('Spend wallet error:', error);
        return { error: error.message || 'Failed to spend from wallet.' };
    }
}

/**
 * Top up wallet (future — would be called after payment gateway confirms).
 */
export async function topUpWallet(userId, amount, description = 'Wallet top-up') {
    try {
        const user = await requireUser();
        requireOwnership(userId, user.id);

        if (amount <= 0) return { error: 'Amount must be positive.' };

        let wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: { userId, balance: 0, currency: 'EGP' },
            });
        }

        const result = await prisma.$transaction(async (tx) => {
            const walletTxn = await tx.walletTransaction.create({
                data: {
                    type: 'TOP_UP',
                    amount,
                    description,
                    walletId: wallet.id,
                },
            });

            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: amount } },
            });

            return { walletTxn, updatedWallet };
        });

        return { success: true, newBalance: result.updatedWallet.balance };
    } catch (error) {
        console.error('Top up wallet error:', error);
        return { error: error.message || 'Failed to top up wallet.' };
    }
}
