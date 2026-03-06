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

        let allBreachableTargets = [];

        for (const rule of activeRules) {
            const thresholdMinutes = rule.thresholdMinutes || 30;
            const cutoff = new Date(now - thresholdMinutes * 60 * 1000);

            let breachableTargetsForThisRule = [];

            if (rule.metric === 'ORDER_ACCEPTANCE_TIME') {
                breachableTargetsForThisRule = potentialTargets.ORDER_ACCEPTANCE_TIME.filter(t => t.createdAt <= cutoff);
            } else if (rule.metric === 'ORDER_DELIVERY_TIME') {
                breachableTargetsForThisRule = potentialTargets.ORDER_DELIVERY_TIME.filter(t => t.createdAt <= cutoff);
            } else if (rule.metric === 'TICKET_RESPONSE_TIME') {
                breachableTargetsForThisRule = potentialTargets.TICKET_RESPONSE_TIME.filter(t => t.createdAt <= cutoff);
            }

            for (const target of breachableTargetsForThisRule) {
                allBreachableTargets.push({
                    ruleId: rule.id,
                    targetId: target.id,
                    ruleName: rule.name || rule.metric,
                    metric: rule.metric,
                    thresholdMinutes
                });
            }
        }

        if (allBreachableTargets.length === 0) return { success: true, breachesCreated: 0 };

        // Bulk check for existing breaches for all rules and targets at once
        const ruleIds = [...new Set(allBreachableTargets.map(t => t.ruleId))];
        const targetIds = [...new Set(allBreachableTargets.map(t => t.targetId))];

        const existingBreaches = await prisma.sLABreach.findMany({
            where: {
                ruleId: { in: ruleIds },
                targetId: { in: targetIds },
            },
            select: { ruleId: true, targetId: true },
        });

        const existingMap = new Map();
        for (const b of existingBreaches) {
            if (!existingMap.has(b.ruleId)) {
                existingMap.set(b.ruleId, new Set());
            }
            existingMap.get(b.ruleId).add(b.targetId);
        }

        const newBreachesToCreate = [];
        const newNotificationsToCreate = [];

        for (const item of allBreachableTargets) {
            const alreadyExists = existingMap.get(item.ruleId)?.has(item.targetId);
            if (!alreadyExists) {
                newBreachesToCreate.push({
                    ruleId: item.ruleId,
                    targetId: item.targetId,
                    status: 'OPEN',
                });

                newNotificationsToCreate.push({
                    type: 'SLA_BREACH',
                    title: `SLA Breach: ${item.ruleName}`,
                    message: `${item.metric} threshold (${item.thresholdMinutes} min) exceeded for ${item.targetId}`,
                    userId: 'SYSTEM',
                });
            }
        }

        if (newBreachesToCreate.length > 0) {
            await prisma.sLABreach.createMany({ data: newBreachesToCreate });
            await prisma.notification.createMany({ data: newNotificationsToCreate });
        }

        return { success: true, breachesCreated: newBreachesToCreate.length };
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
