'use server';

import { prisma } from '@/lib/prisma';

/**
 * Platinum Fraud Signal Engine
 * Implements basic velocity-based heuristics to detect suspicious payment patterns.
 * 
 * Heuristics:
 * 1. Transaction Velocity: More than 5 attempts in 10 minutes.
 * 2. High Value Spike: Transaction > 3x the user's average.
 */
export async function checkFraudSignals(userId, amount) {
    try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        // 1. Check Velocity (Recent Attempts)
        const recentAttemptCount = await prisma.transaction.count({
            where: {
                userId,
                createdAt: { gte: tenMinutesAgo }
            }
        });

        if (recentAttemptCount > 5) {
            return {
                flagged: true,
                reason: 'HIGH_VELOCITY',
                score: 85,
                details: `User attempted ${recentAttemptCount} transactions in 10 minutes.`
            };
        }

        // 2. High Value Spike (Heuristic)
        const userAvg = await prisma.transaction.aggregate({
            where: { userId, status: 'COMPLETED' },
            _avg: { amount: true }
        });

        const avg = userAvg._avg.amount || 0;
        if (avg > 0 && amount > avg * 5) {
            return {
                flagged: true,
                reason: 'VALUE_SPIKE',
                score: 65,
                details: `Amount ${amount} EGP is significantly higher than user average (${avg.toFixed(2)} EGP).`
            };
        }

        return { flagged: false, score: 0 };
    } catch (error) {
        console.error('Fraud signal error:', error);
        return { flagged: false, score: 0, error: 'Heuristic check failed' };
    }
}
