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

        const groupResults = await prisma.transaction.groupBy({
            by: ['type'],
            where: {
                type: { in: modules },
                status: { not: 'REFUNDED' },
            },
            _sum: {
                amount: true,
                unizyCommissionAmount: true,
            },
            _count: {
                _all: true,
            },
        });

        const results = modules.map((mod) => {
            const data = groupResults.find((g) => g.type === mod);
            return {
                module: mod,
                revenue: data?._sum?.amount || 0,
                commission: data?._sum?.unizyCommissionAmount || 0,
                transactions: data?._count?._all || 0,
            };
        });

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
            where: { role: { in: ['DRIVER', 'MERCHANT', 'CLEANER', 'SERVICE_PROVIDER', 'HOUSE_OWNER'] } },
            select: { id: true, name: true, role: true },
            take: limit,
        });

        if (providers.length === 0) return { success: true, data: [] };

        const providerIds = providers.map((p) => p.id);

        const [
            txnsCountsRaw,
            txnsEarningsRaw,
            reviewsAvgRaw,
            ordersCompletedRaw,
            ordersTotalRaw,
        ] = await Promise.all([
            prisma.transaction.groupBy({
                by: ['providerId'],
                where: { providerId: { in: providerIds } },
                _count: { providerId: true },
            }),
            prisma.transaction.groupBy({
                by: ['providerId'],
                where: { providerId: { in: providerIds }, status: 'COMPLETED' },
                _sum: { providerNetAmount: true },
            }),
            prisma.review.groupBy({
                by: ['targetUserId'],
                where: { targetUserId: { in: providerIds } },
                _avg: { rating: true },
            }),
            prisma.order.groupBy({
                by: ['driverId'],
                where: { driverId: { in: providerIds }, status: 'COMPLETED' },
                _count: { driverId: true },
            }),
            prisma.order.groupBy({
                by: ['driverId'],
                where: { driverId: { in: providerIds } },
                _count: { driverId: true },
            }),
        ]);

        const txnsCounts = new Map(txnsCountsRaw.map((x) => [x.providerId, x._count.providerId]));
        const txnsEarnings = new Map(txnsEarningsRaw.map((x) => [x.providerId, x._sum.providerNetAmount]));
        const reviewsAvg = new Map(reviewsAvgRaw.map((x) => [x.targetUserId, x._avg.rating]));
        const ordersCompleted = new Map(ordersCompletedRaw.map((x) => [x.driverId, x._count.driverId]));
        const ordersTotal = new Map(ordersTotalRaw.map((x) => [x.driverId, x._count.driverId]));

        const results = providers.map((provider) => {
            const totalTxns = txnsCounts.get(provider.id) || 0;
            const totalEarnings = txnsEarnings.get(provider.id) || 0;
            const avgRating = reviewsAvg.get(provider.id) || 0;
            const completedOrders = ordersCompleted.get(provider.id) || 0;
            const totalOrders = ordersTotal.get(provider.id) || 0;

            return {
                id: provider.id,
                name: provider.name,
                role: provider.role,
                totalTransactions: totalTxns,
                totalEarnings,
                avgRating,
                completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
            };
        });

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

        const stats = await prisma.transaction.groupBy({
            by: ['type', 'status'],
            _count: {
                _all: true,
            },
            where: {
                type: { in: modules },
            },
        });

        const statsMap = modules.reduce((acc, mod) => {
            acc[mod] = { total: 0, refunded: 0 };
            return acc;
        }, {});

        for (const stat of stats) {
            if (!statsMap[stat.type]) continue;
            statsMap[stat.type].total += stat._count._all;
            if (stat.status === 'REFUNDED') {
                statsMap[stat.type].refunded += stat._count._all;
            }
        }

        const byModule = modules.map((mod) => {
            const total = statsMap[mod].total;
            const refunded = statsMap[mod].refunded;
            return {
                module: mod,
                totalTransactions: total,
                refundedTransactions: refunded,
                refundRate: total > 0 ? Math.round((refunded / total) * 100) : 0,
            };
        });

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
