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

        if (activeRules.length === 0) return { success: true, breachesCreated: 0 };

        // Pre-calculate minimum thresholds for each metric to query all potential breaches at once
        const minThresholds = {};
        for (const rule of activeRules) {
            const t = rule.thresholdMinutes || 30;
            if (!minThresholds[rule.metric] || t < minThresholds[rule.metric]) {
                minThresholds[rule.metric] = t;
            }
        }

        const now = Date.now();
        const potentialTargets = {
            ORDER_ACCEPTANCE_TIME: [],
            ORDER_DELIVERY_TIME: [],
            TICKET_RESPONSE_TIME: []
        };

        // Pre-fetch all targets that could potentially breach ANY active rule
        if (minThresholds['ORDER_ACCEPTANCE_TIME'] !== undefined) {
            potentialTargets.ORDER_ACCEPTANCE_TIME = await prisma.order.findMany({
                where: {
                    status: 'PENDING',
                    createdAt: { lte: new Date(now - minThresholds['ORDER_ACCEPTANCE_TIME'] * 60 * 1000) },
                },
                select: { id: true, createdAt: true },
            });
        }

        if (minThresholds['ORDER_DELIVERY_TIME'] !== undefined) {
            potentialTargets.ORDER_DELIVERY_TIME = await prisma.order.findMany({
                where: {
                    status: { in: ['ACCEPTED', 'PICKED_UP'] },
                    createdAt: { lte: new Date(now - minThresholds['ORDER_DELIVERY_TIME'] * 60 * 1000) },
                },
                select: { id: true, createdAt: true },
            });
        }

        if (minThresholds['TICKET_RESPONSE_TIME'] !== undefined) {
            potentialTargets.TICKET_RESPONSE_TIME = await prisma.supportTicket.findMany({
                where: {
                    status: 'OPEN',
                    createdAt: { lte: new Date(now - minThresholds['TICKET_RESPONSE_TIME'] * 60 * 1000) },
                },
                select: { id: true, createdAt: true },
            });
        }

        let breachesCreated = 0;

        for (const rule of activeRules) {
            const thresholdMinutes = rule.thresholdMinutes || 30;
            const cutoff = new Date(now - thresholdMinutes * 60 * 1000);

            // Find targets that exceed the threshold and haven't been breached yet
            let breachableTargets = [];

            if (rule.metric === 'ORDER_ACCEPTANCE_TIME') {
                breachableTargets = potentialTargets.ORDER_ACCEPTANCE_TIME.filter(t => t.createdAt <= cutoff);
            } else if (rule.metric === 'ORDER_DELIVERY_TIME') {
                breachableTargets = potentialTargets.ORDER_DELIVERY_TIME.filter(t => t.createdAt <= cutoff);
            } else if (rule.metric === 'TICKET_RESPONSE_TIME') {
                breachableTargets = potentialTargets.TICKET_RESPONSE_TIME.filter(t => t.createdAt <= cutoff);
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
