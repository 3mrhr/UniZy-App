'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

export async function getReferralStats() {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { referralCode: true, points: true }
        });

        const referrals = await prisma.referral.findMany({
            where: { referrerId: user.id },
            include: {
                referred: { select: { name: true, createdAt: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            code: dbUser?.referralCode || 'N/A',
            points: dbUser?.points || 0,
            totalReferrals: referrals.length,
            totalEarned: referrals.reduce((sum, r) => sum + r.pointsAwarded, 0),
            history: referrals.map(r => ({
                name: r.referred.name,
                date: r.createdAt.toISOString(),
                points: r.pointsAwarded,
            })),
        };
    } catch (error) {
        console.error('Referral stats error:', error);
        return { code: 'N/A', points: 0, totalReferrals: 0, totalEarned: 0, history: [] };
    }
}
