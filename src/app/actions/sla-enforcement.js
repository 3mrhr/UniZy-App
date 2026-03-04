'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';

// ===== SLA ENFORCEMENT AUTOMATION =====

/**
 * Check all active SLA rules against orders/transactions and auto-generate breaches.
 * Call this periodically (e.g., every 5 minutes via cron).
 */
export async function checkSLABreaches() {
    try {
        const activeRules = await prisma.sLARule.findMany({
            where: { active: true },
        });

        let breachesCreated = 0;

        const rulesWithTargets = [];
        const allTargetIds = new Set();
        const ruleIds = [];

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
            rulesWithTargets.push({ rule, targetIds, thresholdMinutes });
            ruleIds.push(rule.id);
            targetIds.forEach(id => allTargetIds.add(id));
        }

        // Bulk check for existing breaches across all rules and targets at once
        let allExistingBreaches = [];
        if (rulesWithTargets.length > 0) {
            allExistingBreaches = await prisma.sLABreach.findMany({
                where: {
                    ruleId: { in: ruleIds },
                    targetId: { in: Array.from(allTargetIds) },
                },
                select: { ruleId: true, targetId: true },
            });
        }

        // Pre-index existing breaches in a map for O(1) lookup
        const existingBreachesMap = new Map();
        for (const b of allExistingBreaches) {
            existingBreachesMap.set(`${b.ruleId}_${b.targetId}`, true);
        }

        for (const { rule, targetIds, thresholdMinutes } of rulesWithTargets) {
            const newTargets = targetIds.filter(id => !existingBreachesMap.has(`${rule.id}_${id}`));

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
