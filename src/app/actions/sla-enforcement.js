'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';

// ===== SLA ENFORCEMENT AUTOMATION =====

// In-memory cache for active SLA rules
let cachedActiveRules = null;
let lastRulesCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Check all active SLA rules against orders/transactions and auto-generate breaches.
 * Call this periodically (e.g., every 5 minutes via cron).
 */
export async function checkSLABreaches() {
    try {
        const now = Date.now();
        if (!cachedActiveRules || now - lastRulesCacheTime > CACHE_TTL_MS) {
            cachedActiveRules = await prisma.sLARule.findMany({
                where: { active: true },
            });
            lastRulesCacheTime = now;
        }

        const activeRules = cachedActiveRules;

        let breachesCreated = 0;

        for (const rule of activeRules) {
            const thresholdMinutes = rule.thresholdMinutes || 30;
            const cutoff = new Date(Date.now() - thresholdMinutes * 60 * 1000);

            // Find orders that exceed the threshold and haven't been breached yet
            let breachableTargets = [];

            if (rule.metric === 'ORDER_ACCEPTANCE_TIME') {
                // Orders still PENDING beyond threshold
                breachableTargets = await prisma.order.findMany({
                    where: {
                        status: 'PENDING',
                        createdAt: { lte: cutoff },
                    },
                    select: { id: true },
                });
            } else if (rule.metric === 'ORDER_DELIVERY_TIME') {
                // Orders ACCEPTED but not COMPLETED beyond threshold
                breachableTargets = await prisma.order.findMany({
                    where: {
                        status: { in: ['ACCEPTED', 'PICKED_UP'] },
                        createdAt: { lte: cutoff },
                    },
                    select: { id: true },
                });
            } else if (rule.metric === 'TICKET_RESPONSE_TIME') {
                // Support tickets OPEN beyond threshold
                breachableTargets = await prisma.supportTicket.findMany({
                    where: {
                        status: 'OPEN',
                        createdAt: { lte: cutoff },
                    },
                    select: { id: true },
                });
            }

            if (breachableTargets.length === 0) continue;

            const targetIds = breachableTargets.map(t => t.id);

            // Bulk check for existing breaches
            const existingBreaches = await prisma.sLABreach.findMany({
                where: {
                    ruleId: rule.id,
                    targetId: { in: targetIds },
                },
                select: { targetId: true },
            });

            const existingTargetIds = new Set(existingBreaches.map(b => b.targetId));
            const newTargets = targetIds.filter(id => !existingTargetIds.has(id));

            if (newTargets.length > 0) {
                // Bulk create breaches
                await prisma.sLABreach.createMany({
                    data: newTargets.map(targetId => ({
                        ruleId: rule.id,
                        targetId,
                        status: 'OPEN',
                    })),
                });

                // Bulk create notifications
                await prisma.notification.createMany({
                    data: newTargets.map(targetId => ({
                        type: 'SLA_BREACH',
                        title: `SLA Breach: ${rule.name || rule.metric}`,
                        message: `${rule.metric} threshold (${thresholdMinutes} min) exceeded for ${targetId}`,
                        userId: 'SYSTEM',
                    })),
                });

                breachesCreated += newTargets.length;
            }
        }

        return { success: true, breachesCreated };
    } catch (error) {
        console.error('SLA check error:', error);
        return { error: 'Failed to check SLA breaches.' };
    }
}

/**
 * Resolve an SLA breach (admin action).
 */
export async function resolveSLABreach(breachId, notes = '') {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const breach = await prisma.sLABreach.update({
            where: { id: breachId },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date(),
                resolvedById: admin.id,
                notes,
            },
        });

        await logAdminAction('RESOLVE_SLA_BREACH', 'SYSTEM', breachId, {
            notes,
            resolvedBy: admin.id,
        });

        return { success: true, breach };
    } catch (error) {
        console.error('Resolve breach error:', error);
        return { error: 'Failed to resolve breach.' };
    }
}

/**
 * Get all open SLA breaches (admin dashboard).
 */
export async function getOpenSLABreaches() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const breaches = await prisma.sLABreach.findMany({
            where: { status: 'OPEN' },
            include: { rule: true },
            orderBy: { createdAt: 'asc' },
        });

        return { success: true, breaches };
    } catch (error) {
        console.error('Get breaches error:', error);
        return { error: 'Failed to fetch breaches.' };
    }
}
