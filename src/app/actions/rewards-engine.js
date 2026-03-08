'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';

// ===== CONSTANTS =====
const POINTS_PER_EGP = 0.1; // 1 EGP = 0.1 reward points (Base)
const POINTS_EXPIRY_MONTHS = 6; // Points expire after 6 months

// Tier Multipliers (Platinum Level)
const TIER_MULTIPLIERS = {
    BRONZE: 1.0,
    SILVER: 1.2,
    GOLD: 1.5,
    PLATINUM: 2.0
};

const STREAK_BONUS_POINTS = 5; // Points for maintaining a streak daily

// ===== CORE FUNCTIONS =====

/**
 * Get a user's reward balance (derived from ledger, not a stored field).
 * Balance = SUM(EARN + ADMIN_ADJUST) - SUM(SPEND) - SUM(REVERSE) - SUM(EXPIRE)
 */
export async function getRewardBalance(userId = null) {
    try {
        const user = userId ? { id: userId } : await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const earned = await prisma.rewardTransaction.aggregate({
            where: { userId: user.id, type: { in: ['EARN', 'ADMIN_ADJUST'] }, points: { gt: 0 } },
            _sum: { points: true },
        });
        const deducted = await prisma.rewardTransaction.aggregate({
            where: { userId: user.id, type: { in: ['SPEND', 'REVERSE', 'EXPIRE'] } },
            _sum: { points: true },
        });

        const totalEarned = earned._sum.points || 0;
        const totalDeducted = Math.abs(deducted._sum.points || 0);
        const balance = Math.max(0, totalEarned - totalDeducted);

        // Get recent history
        const history = await prisma.rewardTransaction.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });

        return {
            success: true,
            balance: Math.round(balance * 100) / 100,
            totalEarned: Math.round(totalEarned * 100) / 100,
            totalSpent: Math.round(totalDeducted * 100) / 100,
            history,
        };
    } catch (error) {
        console.error('Reward balance error:', error);
        return { error: 'Failed to fetch reward balance.' };
    }
}

/**
 * Earn reward points from a completed payment.
 * Called when Payment.status → PAID.
 * @param {string} userId
 * @param {number} amountPaid - EGP amount
 * @param {string} transactionId - Reference to the financial transaction
 */
export async function earnRewardPoints(userId, amountPaid, transactionId) {
    try {
        // Fetch user tier for multiplier
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tier: true }
        });

        const multiplier = TIER_MULTIPLIERS[user?.tier] || 1.0;
        const basePoints = amountPaid * POINTS_PER_EGP;
        const points = Math.round(basePoints * multiplier * 100) / 100;

        if (points <= 0) return { success: true, points: 0 };

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + POINTS_EXPIRY_MONTHS);

        await prisma.rewardTransaction.create({
            data: {
                type: 'EARN',
                points,
                description: `Earned from payment of ${amountPaid} EGP (${user?.tier || 'BRONZE'} Tier x${multiplier})`,
                userId,
                transactionId,
                expiresAt,
            },
        });

        return { success: true, points };
    } catch (error) {
        console.error('Earn points error:', error);
        return { error: 'Failed to earn points.' };
    }
}

/**
 * Update a student's daily streak and award bonus points.
 * Called on login or first activity of the day.
 */
export async function updateDailyStreak(userId) {
    try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const streak = await prisma.dailyStreak.upsert({
            where: { userId },
            update: {},
            create: { userId, lastActiveAt: new Date(0) }
        });

        const lastActive = new Date(streak.lastActiveAt);
        lastActive.setHours(0, 0, 0, 0);

        const diffTime = now.getTime() - lastActive.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            // Already active today
            return { success: true, alreadyActive: true, currentStreak: streak.currentCount };
        }

        let newCount = 1;
        if (diffDays === 1) {
            // Consecutive day
            newCount = streak.currentCount + 1;
        }

        const longestCount = Math.max(streak.longestCount, newCount);

        await prisma.$transaction([
            prisma.dailyStreak.update({
                where: { userId },
                data: {
                    currentCount: newCount,
                    longestCount,
                    lastActiveAt: new Date()
                }
            }),
            prisma.rewardTransaction.create({
                data: {
                    type: 'EARN',
                    points: STREAK_BONUS_POINTS,
                    description: `Daily Streak Bonus (Day ${newCount})`,
                    userId
                }
            })
        ]);

        return { success: true, newCount, pointsAwarded: STREAK_BONUS_POINTS };
    } catch (error) {
        console.error('Update streak error:', error);
        return { error: 'Failed to update streak.' };
    }
}

/**
 * Spend reward points (redeem).
 * @param {number} pointsToSpend
 * @param {string} description - What the points are being spent on
 */
export async function spendRewardPoints(pointsToSpend, description = 'Reward redemption') {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const balanceResult = await getRewardBalance(user.id);
        if (balanceResult.error) return balanceResult;

        if (balanceResult.balance < pointsToSpend) {
            return { error: `Insufficient points. Available: ${balanceResult.balance}` };
        }

        await prisma.rewardTransaction.create({
            data: {
                type: 'SPEND',
                points: -Math.abs(pointsToSpend),
                description,
                userId: user.id,
            },
        });

        return { success: true, spent: pointsToSpend, newBalance: balanceResult.balance - pointsToSpend };
    } catch (error) {
        console.error('Spend points error:', error);
        return { error: 'Failed to spend points.' };
    }
}

/**
 * Reverse reward points on refund.
 * Called from refund cascade.
 * @param {string} userId
 * @param {string} transactionId - Original transaction being refunded
 */
export async function reverseRewardPoints(userId, transactionId) {
    try {
        // Find all EARN entries for this transaction
        const earnEntries = await prisma.rewardTransaction.findMany({
            where: { userId, transactionId, type: 'EARN' },
        });

        if (earnEntries.length === 0) return { success: true, reversed: 0 };

        const totalToReverse = earnEntries.reduce((sum, e) => sum + e.points, 0);

        await prisma.rewardTransaction.create({
            data: {
                type: 'REVERSE',
                points: -Math.abs(totalToReverse),
                description: `Reversed due to refund on transaction ${transactionId}`,
                userId,
                transactionId,
            },
        });

        return { success: true, reversed: totalToReverse };
    } catch (error) {
        console.error('Reverse points error:', error);
        return { error: 'Failed to reverse points.' };
    }
}

/**
 * Expire old reward points (cron-job callable).
 * Finds all EARN entries past their expiresAt that haven't been expired yet.
 */
export async function expireOldPoints() {
    try {
        const now = new Date();

        const expirableEntries = await prisma.rewardTransaction.findMany({
            where: {
                type: 'EARN',
                expired: false,
                expiresAt: { lte: now },
                points: { gt: 0 },
            },
        });

        if (expirableEntries.length === 0) {
            return { success: true, entriesExpired: 0, totalPoints: 0 };
        }

        let totalExpired = 0;
        const newTransactions = [];
        const entryIds = [];

        for (const entry of expirableEntries) {
            // Check if points from this entry are still available (not already spent/reversed)
            newTransactions.push({
                type: 'EXPIRE',
                points: -entry.points,
                description: `Points expired (earned on ${entry.createdAt.toISOString().split('T')[0]})`,
                userId: entry.userId,
                transactionId: entry.transactionId,
            });
            entryIds.push(entry.id);
            totalExpired += entry.points;
        }

        await prisma.$transaction([
            prisma.rewardTransaction.createMany({
                data: newTransactions
            }),
            prisma.rewardTransaction.updateMany({
                where: { id: { in: entryIds } },
                data: { expired: true }
            })
        ]);

        return { success: true, entriesExpired: expirableEntries.length, totalPoints: totalExpired };
    } catch (error) {
        console.error('Expire points error:', error);
        return { error: 'Failed to expire points.' };
    }
}

/**
 * Admin: Manually adjust a user's reward points.
 */
export async function adminAdjustPoints(userId, points, reason) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) {
            return { error: 'Only admins can adjust points.' };
        }

        await prisma.rewardTransaction.create({
            data: {
                type: 'ADMIN_ADJUST',
                points,
                description: `Admin adjustment: ${reason}`,
                userId,
                adminId: admin.id,
            },
        });

        await logAdminAction('ADJUST_REWARD_POINTS', 'REWARDS', userId, {
            points,
            reason,
            adjustedBy: admin.id,
        });

        return { success: true };
    } catch (error) {
        console.error('Admin adjust error:', error);
        return { error: 'Failed to adjust points.' };
    }
}
