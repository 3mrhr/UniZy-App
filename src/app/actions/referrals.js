'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

/**
 * Checks if the user was referred and completes the referral if this is their first transaction.
 */
export async function completeReferralIfEligible(userId) {
    try {
        // 1. Check if user already has any COMPLETED transactions
        const existingCompletedTxns = await prisma.transaction.count({
            where: {
                userId,
                status: 'COMPLETED'
            }
        });

        // Also check Orders just in case they aren't unified yet
        const existingOrders = await prisma.order.count({
            where: {
                userId,
                status: { in: ['COMPLETED', 'DELIVERED', 'SUCCESSFUL'] }
            }
        });

        if (existingCompletedTxns + existingOrders > 1) {
            // Not the first transaction (it's already been triggered or they have prior history)
            return { success: false, message: 'Not the first transaction' };
        }

        // 2. Find pending referral
        const pendingReferral = await prisma.referral.findFirst({
            where: {
                referredId: userId,
                status: 'PENDING'
            }
        });

        if (!pendingReferral) {
            return { success: false, message: 'No pending referral found' };
        }

        // 3. Complete referral and award points
        // Points Awarded: 50 to referrer (stored in record), 25 to referred user (standard)
        await prisma.$transaction([
            prisma.referral.update({
                where: { id: pendingReferral.id },
                data: { status: 'COMPLETED' }
            }),
            prisma.user.update({
                where: { id: pendingReferral.referrerId },
                data: { points: { increment: pendingReferral.pointsAwarded } }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { points: { increment: 25 } }
            }),
            // Log reward notification
            prisma.notification.create({
                data: {
                    userId: pendingReferral.referrerId,
                    title: 'Referral Reward Earned! 🎁',
                    message: `Your friend completed their first order. You've been awarded ${pendingReferral.pointsAwarded} points!`,
                    type: 'REFERRAL'
                }
            }),
            prisma.notification.create({
                data: {
                    userId: userId,
                    title: 'Welcome Reward! 🌟',
                    message: 'You\'ve earned 25 points for completing your first transaction via referral.',
                    type: 'REFERRAL'
                }
            })
        ]);

        return { success: true };
    } catch (error) {
        console.error('Error completing referral:', error);
        return { success: false, error: 'Database error' };
    }
}

/**
 * Get referral stats for the currently logged in student.
 */
export async function getReferralStats() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const referrals = await prisma.referral.findMany({
            where: { referrerId: user.id },
            include: {
                referred: {
                    select: { name: true, createdAt: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const stats = {
            totalInvited: referrals.length,
            completed: referrals.filter(r => r.status === 'COMPLETED').length,
            pending: referrals.filter(r => r.status === 'PENDING').length,
            totalPointsEarned: referrals
                .filter(r => r.status === 'COMPLETED')
                .reduce((sum, r) => sum + r.pointsAwarded, 0),
            history: referrals
        };

        return { success: true, stats };
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        return { success: false, error: 'Failed to fetch stats' };
    }
}

/**
 * ADMIN ONLY: Get global referral performance and abuse detection.
 */
export async function getAdminReferralStats() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        const totalReferrals = await prisma.referral.count();
        const pendingReferrals = await prisma.referral.count({ where: { status: 'PENDING' } });
        const completedReferrals = await prisma.referral.count({ where: { status: 'COMPLETED' } });

        // Identify potential abuse: Users with high referral counts but low conversions
        const topReferrers = await prisma.user.findMany({
            where: {
                referralsSubmitted: { some: {} }
            },
            include: {
                _count: {
                    select: {
                        referralsSubmitted: true
                    }
                },
                referralsSubmitted: {
                    select: { status: true }
                }
            },
            orderBy: {
                referralsSubmitted: { _count: 'desc' }
            },
            take: 20
        });

        const abuseFlags = topReferrers.map(user => {
            const total = user.referralsSubmitted.length;
            const completed = user.referralsSubmitted.filter(r => r.status === 'COMPLETED').length;
            const conversionRate = total > 0 ? (completed / total) * 100 : 0;

            return {
                userId: user.id,
                name: user.name,
                email: user.email,
                totalReferrals: total,
                completedReferrals: completed,
                conversionRate: conversionRate.toFixed(1),
                isSuspicious: total > 5 && conversionRate < 10 // Flag if > 5 referrals but < 10% conversion
            };
        });

        return {
            success: true,
            stats: {
                totalReferrals,
                pendingReferrals,
                completedReferrals,
                conversionRate: totalReferrals > 0 ? ((completedReferrals / totalReferrals) * 100).toFixed(1) : 0,
                abuseFlags
            }
        };
    } catch (error) {
        console.error('Error fetching admin referral stats:', error);
        return { success: false, error: 'Failed to fetch admin stats' };
    }
}
