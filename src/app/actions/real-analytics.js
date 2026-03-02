'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

// ===== REAL ANALYTICS ENGINE =====

/**
 * Revenue by module (HOUSING, TRANSPORT, DELIVERY, DEALS, MEALS, SERVICES).
 */
export async function getRevenueByModule() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const modules = ['HOUSING', 'TRANSPORT', 'DELIVERY', 'DEALS', 'MEALS', 'SERVICES', 'CLEANING'];

        const results = await Promise.all(
            modules.map(async (mod) => {
                const revenue = await prisma.transaction.aggregate({
                    where: { type: mod, status: { not: 'REFUNDED' } },
                    _sum: { amount: true },
                    _count: true,
                });
                const commission = await prisma.transaction.aggregate({
                    where: { type: mod, status: { not: 'REFUNDED' } },
                    _sum: { unizyCommissionAmount: true },
                });
                return {
                    module: mod,
                    revenue: revenue._sum.amount || 0,
                    commission: commission._sum.unizyCommissionAmount || 0,
                    transactions: revenue._count || 0,
                };
            })
        );

        return { success: true, data: results };
    } catch (error) {
        console.error('Revenue by module error:', error);
        return { error: 'Failed to fetch revenue data.' };
    }
}

/**
 * Provider performance metrics.
 */
export async function getProviderPerformance(limit = 20) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const providers = await prisma.user.findMany({
            where: { role: { in: ['DRIVER', 'MERCHANT', 'PROVIDER'] } },
            select: { id: true, name: true, role: true },
            take: limit,
        });

        const results = await Promise.all(
            providers.map(async (provider) => {
                const [totalTxns, totalEarnings, avgRating, completedOrders, totalOrders] = await Promise.all([
                    prisma.transaction.count({ where: { providerId: provider.id } }),
                    prisma.transaction.aggregate({
                        where: { providerId: provider.id, status: 'COMPLETED' },
                        _sum: { providerNetAmount: true },
                    }),
                    prisma.review.aggregate({
                        where: { targetId: provider.id },
                        _avg: { rating: true },
                    }),
                    prisma.order.count({ where: { driverId: provider.id, status: 'COMPLETED' } }),
                    prisma.order.count({ where: { driverId: provider.id } }),
                ]);

                return {
                    id: provider.id,
                    name: provider.name,
                    role: provider.role,
                    totalTransactions: totalTxns,
                    totalEarnings: totalEarnings._sum.providerNetAmount || 0,
                    avgRating: avgRating._avg.rating || 0,
                    completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
                };
            })
        );

        // Sort by earnings descending
        results.sort((a, b) => b.totalEarnings - a.totalEarnings);
        return { success: true, data: results };
    } catch (error) {
        console.error('Provider performance error:', error);
        return { error: 'Failed to fetch provider performance.' };
    }
}

/**
 * Refund rates by module and by provider.
 */
export async function getRefundRates() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const modules = ['HOUSING', 'TRANSPORT', 'DELIVERY', 'DEALS', 'MEALS', 'SERVICES', 'CLEANING'];

        const byModule = await Promise.all(
            modules.map(async (mod) => {
                const [total, refunded] = await Promise.all([
                    prisma.transaction.count({ where: { type: mod } }),
                    prisma.transaction.count({ where: { type: mod, status: 'REFUNDED' } }),
                ]);
                return {
                    module: mod,
                    totalTransactions: total,
                    refundedTransactions: refunded,
                    refundRate: total > 0 ? Math.round((refunded / total) * 100) : 0,
                };
            })
        );

        return { success: true, byModule };
    } catch (error) {
        console.error('Refund rates error:', error);
        return { error: 'Failed to fetch refund rates.' };
    }
}

/**
 * Reward liability (total outstanding unredeemed points across all users).
 */
export async function getRewardLiability() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const [earned, spent, reversed, expired] = await Promise.all([
            prisma.rewardTransaction.aggregate({
                where: { type: { in: ['EARN', 'ADMIN_ADJUST'] }, points: { gt: 0 } },
                _sum: { points: true },
            }),
            prisma.rewardTransaction.aggregate({
                where: { type: 'SPEND' },
                _sum: { points: true },
            }),
            prisma.rewardTransaction.aggregate({
                where: { type: 'REVERSE' },
                _sum: { points: true },
            }),
            prisma.rewardTransaction.aggregate({
                where: { type: 'EXPIRE' },
                _sum: { points: true },
            }),
        ]);

        const totalEarned = earned._sum.points || 0;
        const totalSpent = Math.abs(spent._sum.points || 0);
        const totalReversed = Math.abs(reversed._sum.points || 0);
        const totalExpired = Math.abs(expired._sum.points || 0);
        const outstanding = Math.max(0, totalEarned - totalSpent - totalReversed - totalExpired);

        // Estimate liability in EGP (1 point ≈ 10 EGP cost at 0.1 pts/EGP)
        const estimatedLiabilityEGP = outstanding * 10;

        return {
            success: true,
            totalEarned: Math.round(totalEarned * 100) / 100,
            totalSpent: Math.round(totalSpent * 100) / 100,
            totalReversed: Math.round(totalReversed * 100) / 100,
            totalExpired: Math.round(totalExpired * 100) / 100,
            outstanding: Math.round(outstanding * 100) / 100,
            estimatedLiabilityEGP: Math.round(estimatedLiabilityEGP),
        };
    } catch (error) {
        console.error('Reward liability error:', error);
        return { error: 'Failed to compute reward liability.' };
    }
}

/**
 * Export analytics data as CSV string (for download).
 */
export async function exportRevenueCSV() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const transactions = await prisma.transaction.findMany({
            select: {
                txnCode: true,
                type: true,
                amount: true,
                currency: true,
                status: true,
                unizyCommissionAmount: true,
                providerNetAmount: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1000,
        });

        const headers = 'TxnCode,Module,Amount,Currency,Status,Commission,ProviderNet,Date\n';
        const rows = transactions.map(t =>
            `${t.txnCode},${t.type},${t.amount},${t.currency},${t.status},${t.unizyCommissionAmount || 0},${t.providerNetAmount || 0},${t.createdAt.toISOString()}`
        ).join('\n');

        return { success: true, csv: headers + rows };
    } catch (error) {
        console.error('Export error:', error);
        return { error: 'Failed to export data.' };
    }
}
