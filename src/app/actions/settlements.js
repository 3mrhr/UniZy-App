'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';

/**
 * Auto-generate settlement records from completed transactions.
 * Groups completed transactions by provider for a given period.
 * 
 * @param {string} periodStart - ISO date string for period start
 * @param {string} periodEnd - ISO date string for period end
 * @returns {Object} { success, settlements, summary }
 */
export async function generateSettlements(periodStart, periodEnd) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'ADMIN_SUPER' && user.role !== 'ADMIN_FINANCE')) {
            return { error: 'Only Super Admin or Finance Admin can generate settlements.' };
        }

        const start = new Date(periodStart);
        const end = new Date(periodEnd);

        if (isNaN(start) || isNaN(end) || start >= end) {
            return { error: 'Invalid date range.' };
        }

        // Find all COMPLETED transactions with a provider in this period
        // that don't already have a settlement
        const completedTransactions = await prisma.transaction.findMany({
            where: {
                status: 'COMPLETED',
                providerId: { not: null },
                createdAt: {
                    gte: start,
                    lte: end,
                },
            },
            select: {
                id: true,
                providerId: true,
                amount: true,
                unizyCommissionAmount: true,
                providerNetAmount: true,
                promoSubsidyAmount: true,
            },
        });

        if (completedTransactions.length === 0) {
            return { success: true, settlements: [], summary: { message: 'No completed transactions in this period.' } };
        }

        // Group transactions by provider
        const providerGroups = {};
        for (const txn of completedTransactions) {
            const pid = txn.providerId;
            if (!providerGroups[pid]) {
                providerGroups[pid] = {
                    grossAmount: 0,
                    commissionAmount: 0,
                    netAmount: 0,
                    transactionIds: [],
                };
            }
            providerGroups[pid].grossAmount += txn.amount;
            providerGroups[pid].commissionAmount += txn.unizyCommissionAmount;
            providerGroups[pid].netAmount += txn.providerNetAmount;
            providerGroups[pid].transactionIds.push(txn.id);
        }

        // Create settlement records
        const providerIds = Object.keys(providerGroups);
        const existingSettlements = await prisma.settlement.findMany({
            where: {
                providerId: { in: providerIds },
                periodStart: start,
                periodEnd: end,
            },
        });

        const existingSettlementMap = new Map();
        for (const settlement of existingSettlements) {
            existingSettlementMap.set(settlement.providerId, settlement);
        }

        const updates = [];
        const creates = [];

        for (const [providerId, data] of Object.entries(providerGroups)) {
            const existing = existingSettlementMap.get(providerId);

            if (existing) {
                // Update existing settlement
                updates.push(prisma.settlement.update({
                    where: { id: existing.id },
                    data: {
                        grossAmount: Math.round(data.grossAmount * 100) / 100,
                        commissionAmount: Math.round(data.commissionAmount * 100) / 100,
                        netAmount: Math.round(data.netAmount * 100) / 100,
                    },
                }));
            } else {
                // Create new settlement
                creates.push({
                    providerId,
                    periodStart: start,
                    periodEnd: end,
                    grossAmount: Math.round(data.grossAmount * 100) / 100,
                    commissionAmount: Math.round(data.commissionAmount * 100) / 100,
                    netAmount: Math.round(data.netAmount * 100) / 100,
                    status: 'PENDING',
                });
            }
        }

        const txs = [...updates];
        if (creates.length > 0) {
            txs.push(prisma.settlement.createManyAndReturn({ data: creates }));
        }

        const transactionResults = await prisma.$transaction(txs);

        // Flatten results since createManyAndReturn returns an array of records
        const settlements = transactionResults.flat();

        await logAdminAction('GENERATE_SETTLEMENTS', 'FINANCE', null, {
            periodStart: periodStart,
            periodEnd: periodEnd,
            settlementCount: settlements.length,
            totalProviders: Object.keys(providerGroups).length,
        });

        return {
            success: true,
            settlements,
            summary: {
                providers: Object.keys(providerGroups).length,
                transactions: completedTransactions.length,
                totalGross: Math.round(completedTransactions.reduce((s, t) => s + t.amount, 0) * 100) / 100,
                totalCommission: Math.round(completedTransactions.reduce((s, t) => s + t.unizyCommissionAmount, 0) * 100) / 100,
                totalNet: Math.round(completedTransactions.reduce((s, t) => s + t.providerNetAmount, 0) * 100) / 100,
            },
        };
    } catch (error) {
        console.error('Settlement generation error:', error);
        return { error: 'Failed to generate settlements.' };
    }
}

/**
 * Get settlements with filters (admin view).
 */
export async function getSettlements({ status, providerId, limit = 50 } = {}) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
            return { error: 'Unauthorized' };
        }

        const where = {};
        if (status) where.status = status;
        if (providerId) where.providerId = providerId;

        const settlements = await prisma.settlement.findMany({
            where,
            include: {
                provider: { select: { name: true, email: true, role: true } },
                payouts: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return { success: true, settlements };
    } catch (error) {
        console.error('Get settlements error:', error);
        return { error: 'Failed to fetch settlements.' };
    }
}
