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

        const counts = await prisma.transaction.groupBy({
            by: ['type', 'status'],
            _count: {
                _all: true,
            },
            where: {
                type: {
                    in: modules,
                },
            },
        });

        const results = modules.map((mod) => {
            let started = 0;
            let completed = 0;

            for (const c of counts) {
                if (c.type === mod) {
                    started += c._count._all;
                    if (c.status === 'COMPLETED') {
                        completed += c._count._all;
                    }
                }
            }

            return {
                module: mod,
                started,
                completed,
                conversionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
            };
        });

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
/**
 * Regional Demand Heatmap: Visual density of user activity.
 * Returns a 0-100 "Heat" score per zone based on event volume.
 */
export async function getRegionalDensity() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        // Group activity by zone/region from orders and events
        const zones = await prisma.zone.findMany({
            select: { id: true, name: true }
        });

        const densityData = await Promise.all(zones.map(async (zone) => {
            const [orderCount, eventCount] = await Promise.all([
                prisma.order.count({ where: { zoneId: zone.id } }),
                prisma.analyticsEvent.count({
                    where: {
                        metadata: { contains: zone.name } // Heuristic mapping
                    }
                })
            ]);

            const volume = orderCount + (eventCount * 0.1);
            return {
                zoneId: zone.id,
                zoneName: zone.name,
                volume,
            };
        }));

        const maxVolume = Math.max(...densityData.map(d => d.volume)) || 1;

        const results = densityData.map(d => ({
            ...d,
            heatScore: Math.round((d.volume / maxVolume) * 100)
        }));

        return { success: true, heatmap: results };
    } catch (error) {
        console.error('Heatmap density error:', error);
        return { error: 'Failed to compute demand heatmap.' };
    }
}

/**
 * Growth Intelligence Summary Generator.
 * Consolidates metrics from across the system into a narrative summary for stakeholders.
 */
export async function generateGrowthSummary() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const [revenueData, userGrowth, moduleStats] = await Promise.all([
            prisma.transaction.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true }
            }),
            prisma.user.count({ where: { role: 'STUDENT' } }),
            getModuleConversions()
        ]);

        const totalRevenue = revenueData._sum.amount || 0;
        const topModule = [...(moduleStats.data || [])].sort((a, b) => b.completed - a.completed)[0];

        const summary = {
            timestamp: new Date().toISOString(),
            totalRevenue,
            activeStudents: userGrowth,
            primaryGrowthEngine: topModule ? topModule.module : 'N/A',
            intelligenceNotes: [
                `Revenue baseline is stable at ${totalRevenue.toFixed(2)} EGP.`,
                `User acquisition is currently at ${userGrowth} organic student signups.`,
                topModule ? `${topModule.module} is the highest converting module at ${topModule.conversionRate}%.` : null
            ].filter(Boolean)
        };

        return { success: true, summary };
    } catch (error) {
        console.error('Growth summary error:', error);
        return { error: 'Failed to generate growth summary.' };
    }
}
