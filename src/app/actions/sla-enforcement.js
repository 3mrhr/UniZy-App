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
            where: { isActive: true },
        });

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

            for (const target of breachableTargets) {
                // Check if breach already exists for this rule+target
                const existing = await prisma.sLABreach.findFirst({
                    where: { ruleId: rule.id, targetId: target.id },
                });

                if (!existing) {
                    await prisma.sLABreach.create({
                        data: {
                            ruleId: rule.id,
                            targetId: target.id,
                            status: 'OPEN',
                        },
                    });

                    // Create admin notification
                    await prisma.notification.create({
                        data: {
                            type: 'SLA_BREACH',
                            title: `SLA Breach: ${rule.name}`,
                            message: `${rule.metric} threshold (${thresholdMinutes} min) exceeded for ${target.id}`,
                            userId: 'SYSTEM', // System notification — should go to admin
                        },
                    });

                    breachesCreated++;
                }
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
