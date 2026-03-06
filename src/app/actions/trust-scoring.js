'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

// ===== TRUST SCORING SYSTEM =====

/**
 * Compute driver reliability score.
 * Factors: acceptance rate, completion rate, average rating.
 * Score range: 0-100.
 */
export async function computeDriverScore(driverId) {
    try {
        const totalAssigned = await prisma.order.count({
            where: { driverId, status: { not: 'PENDING' } },
        });
        const completed = await prisma.order.count({
            where: { driverId, status: 'COMPLETED' },
        });
        const cancelled = await prisma.order.count({
            where: { driverId, status: 'CANCELLED' },
        });

        // Get average rating
        const avgRating = await prisma.review.aggregate({
            where: { targetId: driverId },
            _avg: { rating: true },
        });

        const completionRate = totalAssigned > 0 ? (completed / totalAssigned) * 100 : 50;
        const cancellationPenalty = totalAssigned > 0 ? (cancelled / totalAssigned) * 20 : 0;
        const ratingScore = (avgRating._avg.rating || 3) * 20; // Scale 1-5 → 20-100

        // Weighted formula
        const score = Math.min(100, Math.max(0,
            (completionRate * 0.4) +
            (ratingScore * 0.4) -
            (cancellationPenalty * 0.2)
        ));

        return {
            success: true,
            score: Math.round(score),
            factors: {
                totalOrders: totalAssigned,
                completed,
                cancelled,
                completionRate: Math.round(completionRate),
                avgRating: avgRating._avg.rating || 0,
            },
        };
    } catch (error) {
        console.error('Driver score error:', error);
        return { error: 'Failed to compute driver score.' };
    }
}

/**
 * Compute merchant quality score.
 * Factors: order accuracy (low refund rate), average rating, total volume.
 */
export async function computeMerchantScore(merchantId) {
    try {
        const totalOrders = await prisma.order.count({ where: { merchantId } });
        const refundedTransactions = await prisma.transaction.count({
            where: { providerId: merchantId, status: 'REFUNDED' },
        });

        const avgRating = await prisma.review.aggregate({
            where: { targetId: merchantId },
            _avg: { rating: true },
        });

        const refundRate = totalOrders > 0 ? (refundedTransactions / totalOrders) * 100 : 0;
        const ratingScore = (avgRating._avg.rating || 3) * 20;
        const volumeBonus = Math.min(10, totalOrders / 10); // Up to 10 points for volume

        const score = Math.min(100, Math.max(0,
            ratingScore * 0.5 +
            (100 - refundRate) * 0.4 +
            volumeBonus
        ));

        return {
            success: true,
            score: Math.round(score),
            factors: {
                totalOrders,
                refundedTransactions,
                refundRate: Math.round(refundRate),
                avgRating: avgRating._avg.rating || 0,
            },
        };
    } catch (error) {
        console.error('Merchant score error:', error);
        return { error: 'Failed to compute merchant score.' };
    }
}

/**
 * Compute student reliability score.
 * Factors: cancellation rate, report count, order volume.
 */
export async function computeStudentScore(studentId) {
    try {
        const totalOrders = await prisma.order.count({ where: { userId: studentId } });
        const cancelled = await prisma.order.count({ where: { userId: studentId, status: 'CANCELLED' } });
        const reportCount = await prisma.report.count({ where: { targetUserId: studentId } });

        const cancelRate = totalOrders > 0 ? (cancelled / totalOrders) * 100 : 0;
        const reportPenalty = Math.min(30, reportCount * 10);

        const score = Math.min(100, Math.max(0,
            100 - cancelRate * 0.5 - reportPenalty
        ));

        return {
            success: true,
            score: Math.round(score),
            factors: {
                totalOrders,
                cancelled,
                cancelRate: Math.round(cancelRate),
                reportCount,
            },
        };
    } catch (error) {
        console.error('Student score error:', error);
        return { error: 'Failed to compute student score.' };
    }
}

/**
 * Get ranked drivers in a zone for dispatch priority.
 * Higher trust score = higher priority.
 */
export async function getDriversRankedByTrust(zoneId) {
    try {
        const driverZones = await prisma.driverZone.findMany({
            where: { zoneId, isActive: true },
            select: { driverId: true },
        });

        if (driverZones.length === 0) {
            return { success: true, drivers: [] };
        }

        const driverIds = driverZones.map(dz => dz.driverId);

        // Fetch all order stats in a single query
        const orderStatsRaw = await prisma.order.groupBy({
            by: ['driverId', 'status'],
            where: { driverId: { in: driverIds }, status: { not: 'PENDING' } },
            _count: { id: true },
        });

        // Fetch all review stats in a single query
        const reviewStatsRaw = await prisma.review.groupBy({
            by: ['targetUserId'],
            where: { targetUserId: { in: driverIds } },
            _avg: { rating: true },
        });

        // Aggregate into maps for O(1) lookup
        const orderStats = new Map();
        const reviewStats = new Map();

        driverIds.forEach(id => orderStats.set(id, { total: 0, completed: 0, cancelled: 0 }));

        orderStatsRaw.forEach(stat => {
            if (!stat.driverId) return;
            const driverData = orderStats.get(stat.driverId) || { total: 0, completed: 0, cancelled: 0 };
            driverData.total += stat._count.id;

            if (stat.status === 'COMPLETED') {
                driverData.completed += stat._count.id;
            } else if (stat.status === 'CANCELLED') {
                driverData.cancelled += stat._count.id;
            }
            orderStats.set(stat.driverId, driverData);
        });

        reviewStatsRaw.forEach(stat => {
            if (stat.targetUserId) {
                reviewStats.set(stat.targetUserId, stat._avg.rating || 3);
            }
        });

        const rankedDrivers = driverIds.map(driverId => {
            const orders = orderStats.get(driverId);
            const avgRating = reviewStats.get(driverId) || 3;

            const completionRate = orders.total > 0 ? (orders.completed / orders.total) * 100 : 50;
            const cancellationPenalty = orders.total > 0 ? (orders.cancelled / orders.total) * 20 : 0;
            const ratingScore = avgRating * 20;

            const score = Math.min(100, Math.max(0,
                (completionRate * 0.4) +
                (ratingScore * 0.4) -
                (cancellationPenalty * 0.2)
            ));

            return {
                driverId,
                score: Math.round(score),
                totalOrders: orders.total,
                completed: orders.completed,
                cancelled: orders.cancelled,
                completionRate: Math.round(completionRate),
                avgRating: avgRating,
            };
        });

        // Sort by score descending
        rankedDrivers.sort((a, b) => b.score - a.score);
        return { success: true, drivers: rankedDrivers };
    } catch (error) {
        console.error('Driver ranking error:', error);
        return { error: 'Failed to rank drivers.' };
    }
}
