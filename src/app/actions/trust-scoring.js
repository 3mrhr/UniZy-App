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

        const rankedDrivers = [];
        for (const dz of driverZones) {
            const scoreResult = await computeDriverScore(dz.driverId);
            if (scoreResult.success) {
                rankedDrivers.push({
                    driverId: dz.driverId,
                    score: scoreResult.score,
                    ...scoreResult.factors,
                });
            }
        }

        // Sort by score descending
        rankedDrivers.sort((a, b) => b.score - a.score);
        return { success: true, drivers: rankedDrivers };
    } catch (error) {
        console.error('Driver ranking error:', error);
        return { error: 'Failed to rank drivers.' };
    }
}
