'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';

// ===== FRAUD DETECTION RULES =====

/**
 * Detect duplicate accounts (same phone/email across multiple users).
 * Returns list of suspicious groups.
 */
export async function detectDuplicateAccounts() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        // Find emails used by multiple accounts
        const duplicateEmails = await prisma.$queryRaw`
            SELECT email, COUNT(*) as count 
            FROM "User" 
            WHERE email IS NOT NULL 
            GROUP BY email 
            HAVING COUNT(*) > 1
        `;

        // Find phones used by multiple accounts
        const duplicatePhones = await prisma.$queryRaw`
            SELECT phone, COUNT(*) as count 
            FROM "User" 
            WHERE phone IS NOT NULL 
            GROUP BY phone 
            HAVING COUNT(*) > 1
        `;

        return {
            success: true,
            duplicateEmails: duplicateEmails || [],
            duplicatePhones: duplicatePhones || [],
            totalSuspicious: (duplicateEmails?.length || 0) + (duplicatePhones?.length || 0),
        };
    } catch (error) {
        console.error('Duplicate detection error:', error);
        return { error: 'Failed to detect duplicates.' };
    }
}

/**
 * Detect referral abuse (self-referral or ring referral patterns).
 */
export async function detectReferralAbuse() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        // Find users who have been referred
        const selfReferrals = await prisma.user.findMany({
            where: {
                referralsUsed: { some: {} },
            },
            select: {
                id: true,
                name: true,
                email: true,
                referralsUsed: {
                    select: { referrerId: true },
                    take: 1, // Get the primary referral
                },
            },
        });

        // Prepare a batch lookup for referrers to prevent N+1 querying in the loop
        const parentReferrerIdsToFetch = [];
        for (const user of selfReferrals) {
            const referredById = user.referralsUsed[0]?.referrerId;
            if (referredById && referredById !== user.id) {
                parentReferrerIdsToFetch.push(referredById);
            }
        }

        // Fetch referrers in a single query
        const parentReferrals = await prisma.user.findMany({
            where: {
                id: { in: parentReferrerIdsToFetch },
                referralsUsed: { some: {} },
            },
            select: {
                id: true,
                referralsUsed: {
                    select: { referrerId: true },
                    take: 1,
                },
            },
        });

        const parentReferrerMap = new Map();
        for (const parent of parentReferrals) {
            parentReferrerMap.set(parent.id, parent.referralsUsed[0]?.referrerId);
        }

        // Check for self referrals and ring referrals (A referred B who referred A)
        const ringReferrals = [];
        for (const user of selfReferrals) {
            const referredById = user.referralsUsed[0]?.referrerId;
            if (!referredById) continue;

            if (referredById === user.id) {
                ringReferrals.push({ type: 'SELF_REFERRAL', userId: user.id, name: user.name });
                continue;
            }

            const parentReferredById = parentReferrerMap.get(referredById);
            if (parentReferredById === user.id) {
                ringReferrals.push({ type: 'RING_REFERRAL', userId: user.id, referrerId: referredById });
            }
        }

        return { success: true, ringReferrals, totalSuspicious: ringReferrals.length };
    } catch (error) {
        console.error('Referral abuse error:', error);
        return { error: 'Failed to detect referral abuse.' };
    }
}

/**
 * Detect coupon/promo abuse (users with excessive redemption counts).
 */
export async function detectCouponAbuse(threshold = 5) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const heavyUsers = await prisma.$queryRaw`
            SELECT "userId", COUNT(*) as redemptions
            FROM "PromoRedemption"
            GROUP BY "userId"
            HAVING COUNT(*) > ${threshold}
            ORDER BY redemptions DESC
        `;

        return {
            success: true,
            abusiveUsers: heavyUsers || [],
            totalSuspicious: heavyUsers?.length || 0,
        };
    } catch (error) {
        console.error('Coupon abuse error:', error);
        return { error: 'Failed to detect coupon abuse.' };
    }
}

/**
 * Detect suspicious cancellation rates.
 * Users who cancel > 30% of their orders are flagged.
 */
export async function detectSuspiciousCancellations(thresholdPercent = 30) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const suspiciousUsers = await prisma.$queryRaw`
            SELECT 
                "userId",
                COUNT(*) as total_orders,
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_orders,
                ROUND(
                    SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END)::decimal / 
                    NULLIF(COUNT(*), 0) * 100, 1
                ) as cancel_rate
            FROM "Order"
            GROUP BY "userId"
            HAVING COUNT(*) >= 3 AND
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END)::decimal / 
                NULLIF(COUNT(*), 0) * 100 > ${thresholdPercent}
            ORDER BY cancel_rate DESC
        `;

        return {
            success: true,
            suspiciousUsers: suspiciousUsers || [],
            totalSuspicious: suspiciousUsers?.length || 0,
        };
    } catch (error) {
        console.error('Cancellation detection error:', error);
        return { error: 'Failed to detect cancellation abuse.' };
    }
}

/**
 * Run all fraud detection rules and return combined results.
 */
export async function runFullFraudScan() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const [duplicates, referrals, coupons, cancellations] = await Promise.all([
            detectDuplicateAccounts(),
            detectReferralAbuse(),
            detectCouponAbuse(),
            detectSuspiciousCancellations(),
        ]);

        const totalFlags =
            (duplicates.totalSuspicious || 0) +
            (referrals.totalSuspicious || 0) +
            (coupons.totalSuspicious || 0) +
            (cancellations.totalSuspicious || 0);

        await logAdminAction('FRAUD_SCAN', 'SYSTEM', null, {
            totalFlags,
            duplicateAccounts: duplicates.totalSuspicious || 0,
            referralAbuse: referrals.totalSuspicious || 0,
            couponAbuse: coupons.totalSuspicious || 0,
            cancellationAbuse: cancellations.totalSuspicious || 0,
        });

        return {
            success: true,
            totalFlags,
            duplicates,
            referrals,
            coupons,
            cancellations,
        };
    } catch (error) {
        console.error('Full fraud scan error:', error);
        return { error: 'Failed to run fraud scan.' };
    }
}
