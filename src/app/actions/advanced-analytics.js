'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

// ===== EVENT TRACKING SYSTEM =====

/**
 * Track a user event for analytics.
 * This creates a lightweight event log that can be used for funnel analysis,
 * retention cohorts, and conversion metrics.
 * 
 * Events are stored in a simple model and can be exported to external BI tools.
 */
export async function trackEvent(eventName, metadata = {}) {
    try {
        const user = await getCurrentUser();

        await prisma.analyticsEvent.create({
            data: {
                event: eventName,
                userId: user?.id || 'ANONYMOUS',
                metadata: JSON.stringify(metadata),
                sessionId: metadata.sessionId || null,
                module: metadata.module || null,
            },
        });

        return { success: true };
    } catch (error) {
        // Fail silently for tracking — don't break user flows
        console.error('Track event error:', error);
        return { success: false };
    }
}

/**
 * Funnel analytics: registration → first order → repeat.
 */
export async function getFunnelAnalytics() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const [totalRegistered, withFirstOrder, withRepeatOrders, withPayment] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({
                where: {
                    role: 'STUDENT',
                    orders: { some: {} },
                },
            }),
            prisma.user.count({
                where: {
                    role: 'STUDENT',
                    orders: { some: { status: 'COMPLETED' } },
                },
            }),
            prisma.user.count({
                where: {
                    role: 'STUDENT',
                    transactions: { some: { status: 'COMPLETED' } },
                },
            }),
        ]);

        return {
            success: true,
            funnel: {
                registered: totalRegistered,
                firstOrder: withFirstOrder,
                completedOrder: withRepeatOrders,
                paidOrder: withPayment,
                registrationToOrderRate: totalRegistered > 0 ? Math.round((withFirstOrder / totalRegistered) * 100) : 0,
                orderToCompletionRate: withFirstOrder > 0 ? Math.round((withRepeatOrders / withFirstOrder) * 100) : 0,
            },
        };
    } catch (error) {
        console.error('Funnel analytics error:', error);
        return { error: 'Failed to compute funnel.' };
    }
}

/**
 * Conversion metrics per module.
 */
export async function getModuleConversions() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const modules = ['TRANSPORT', 'DELIVERY', 'HOUSING', 'DEALS', 'MEALS', 'SERVICES', 'CLEANING'];

        const results = await Promise.all(
            modules.map(async (mod) => {
                const [started, completed] = await Promise.all([
                    prisma.transaction.count({ where: { type: mod } }),
                    prisma.transaction.count({ where: { type: mod, status: 'COMPLETED' } }),
                ]);
                return {
                    module: mod,
                    started,
                    completed,
                    conversionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
                };
            })
        );

        return { success: true, data: results };
    } catch (error) {
        console.error('Module conversions error:', error);
        return { error: 'Failed to compute conversions.' };
    }
}

/**
 * Retention cohorts (users who placed orders in the last N weeks).
 */
export async function getRetentionCohorts(weeks = 4) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const now = new Date();
        const overallStart = new Date(now);
        overallStart.setDate(overallStart.getDate() - weeks * 7);
        const overallEnd = new Date(now);

        // Group by exact 7-day intervals counting backward from `overallEnd`
        // This simulates a custom "date truncation" aligned precisely to the rolling window.
        const rawResults = await prisma.$queryRaw`
            SELECT
                FLOOR(EXTRACT(EPOCH FROM (${overallEnd}::timestamp - "createdAt")) / (7 * 24 * 60 * 60))::int as week_index,
                COUNT(DISTINCT "userId")::int as "activeUsers"
            FROM "Order"
            WHERE "createdAt" >= ${overallStart} AND "createdAt" < ${overallEnd}
            GROUP BY week_index
            ORDER BY week_index ASC
        `;

        const cohorts = [];
        for (let i = 0; i < weeks; i++) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - i * 7);

            const row = rawResults.find(r => r.week_index === i);

            cohorts.push({
                week: `Week -${i + 1}`,
                startDate: weekStart.toISOString().split('T')[0],
                endDate: weekEnd.toISOString().split('T')[0],
                activeUsers: row ? Number(row.activeUsers) : 0,
            });
        }

        return { success: true, cohorts };
    } catch (error) {
        console.error('Retention cohorts error:', error);
        return { error: 'Failed to compute retention.' };
    }
}
