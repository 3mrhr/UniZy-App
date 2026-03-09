'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { LedgerAccount } from '@/lib/ledger';

/**
 * Get Global Financial Stats (SuperAdmin Only)
 * Aggregates all ledger data into a high-level P&L view.
 */
export async function getGlobalFinancialStats() {
    try {
        const user = await getCurrentUser();
        if (user?.role !== 'ADMIN_SUPER') {
            return { error: 'Unauthorized. Requires SuperAdmin God-mode.' };
        }

        // 1. Gross Volume (Sum of all USER_WALLET debits for orders)
        const grossVolume = await prisma.ledgerEntry.aggregate({
            where: { accountType: LedgerAccount.USER_WALLET, type: 'DEBIT' },
            _sum: { amount: true }
        });

        // 2. Total Unizy Revenue
        const revenue = await prisma.ledgerEntry.aggregate({
            where: { accountType: LedgerAccount.UNIZY_REVENUE, type: 'CREDIT' },
            _sum: { amount: true }
        });

        // 3. Tax Liabilities
        const tax = await prisma.ledgerEntry.aggregate({
            where: { accountType: LedgerAccount.TAX_VAT, type: 'CREDIT' },
            _sum: { amount: true }
        });

        // 4. Platform Fees
        const fees = await prisma.ledgerEntry.aggregate({
            where: { accountType: LedgerAccount.PLATFORM_FEE, type: 'CREDIT' },
            _sum: { amount: true }
        });

        // 5. Active Escrow (Money currently held between Auth and Capture)
        const escrow = await prisma.ledgerEntry.aggregate({
            where: { accountType: LedgerAccount.UNIZY_ESCROW },
            _sum: { amount: true }
        });

        // 6. Merchant Payables (Outstanding payouts)
        const payables = await prisma.ledgerEntry.aggregate({
            where: { accountType: LedgerAccount.MERCHANT_PAYABLE },
            _sum: { amount: true }
        });

        return {
            success: true,
            stats: {
                grossVolume: Math.abs(grossVolume._sum.amount || 0),
                netRevenue: revenue._sum.amount || 0,
                taxLiabilities: tax._sum.amount || 0,
                platformFees: fees._sum.amount || 0,
                activeEscrow: escrow._sum.amount || 0,
                outstandingPayables: payables._sum.amount || 0,
                totalProfit: (revenue._sum.amount || 0) + (fees._sum.amount || 0)
            }
        };

    } catch (error) {
        console.error('Fin-Ops global stats error:', error);
        return { error: 'Failed to fetch financial stats.' };
    }
}

/**
 * Get Service-Specific P&L (SuperAdmin Only)
 * Filters ledger by transaction module tags.
 */
export async function getServicePnL(moduleName) {
    try {
        const user = await getCurrentUser();
        if (user?.role !== 'ADMIN_SUPER') return { error: 'Unauthorized' };

        const stats = await prisma.ledgerEntry.groupBy({
            by: ['type'],
            where: {
                transaction: {
                    module: moduleName
                },
                accountType: LedgerAccount.UNIZY_REVENUE
            },
            _sum: { amount: true }
        });

        const totalRevenue = stats.find(s => s.type === 'CREDIT')?._sum.amount || 0;
        const totalReversed = Math.abs(stats.find(s => s.type === 'DEBIT')?._sum.amount || 0);

        return {
            success: true,
            module: moduleName,
            netRevenue: totalRevenue - totalReversed
        };
    } catch (error) {
        console.error(`Fin-Ops stats error for ${moduleName}:`, error);
        return { error: 'Failed to fetch module stats.' };
    }
}

/**
 * Get Provider Earnings Snapshot
 * Allows Merchants/Drivers/Couriers to see their balance, today's income, and commission splits.
 */
export async function getProviderEarningsSnapshot() {
    try {
        const user = await getCurrentUser();
        if (!user || !['MERCHANT', 'DRIVER', 'CLEANER', 'SERVICE_PROVIDER', 'HOUSE_OWNER'].includes(user.role)) {
            return { error: 'Unauthorized. Provider role required.' };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Current Balance (Net amount payable to provider)
        const balance = await prisma.ledgerEntry.aggregate({
            where: {
                accountType: LedgerAccount.MERCHANT_PAYABLE,
                transaction: { providerId: user.id }
            },
            _sum: { amount: true }
        });

        // 2. Today's Gross Volume (Debit from Escrow for this provider)
        const todayGross = await prisma.ledgerEntry.aggregate({
            where: {
                accountType: LedgerAccount.UNIZY_ESCROW,
                type: 'DEBIT',
                transaction: { providerId: user.id, createdAt: { gte: today } }
            },
            _sum: { amount: true }
        });

        // 3. Today's Net Earnings (Credit to Merchant Payable)
        const todayNet = await prisma.ledgerEntry.aggregate({
            where: {
                accountType: LedgerAccount.MERCHANT_PAYABLE,
                type: 'CREDIT',
                transaction: { providerId: user.id, createdAt: { gte: today } }
            },
            _sum: { amount: true }
        });

        // 4. Lifetime Volume
        const lifetime = await prisma.transaction.aggregate({
            where: { providerId: user.id, status: 'COMPLETED' },
            _sum: { amount: true }
        });

        return {
            success: true,
            stats: {
                currentBalance: balance._sum.amount || 0,
                todayGross: Math.abs(todayGross._sum.amount || 0),
                todayNet: todayNet._sum.amount || 0,
                lifetimeVolume: lifetime._sum.amount || 0,
                totalCommissionPaid: Math.abs(todayGross._sum.amount || 0) - (todayNet._sum.amount || 0)
            }
        };
    } catch (error) {
        console.error('Provider earnings error:', error);
        return { error: 'Failed to fetch earnings.' };
    }
}
