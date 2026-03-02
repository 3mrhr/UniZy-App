'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';
import { revalidatePath } from 'next/cache';

/**
 * Helper to generate settlements for a provider (Admin or System job)
 * This logic usually runs on a CRON job, but here is a manual trigger.
 */
export async function generateSettlements(providerId, periodStart, periodEnd) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { error: 'Unauthorized' };

        // Mock logic: calculate based on completed transactions in that period
        const txns = await prisma.transaction.findMany({
            where: {
                createdAt: { gte: periodStart, lte: periodEnd },
                status: 'COMPLETED'
                // Real logic would filter by provider's jobs/orders
            }
        });

        // 85% goes to provider
        const gross = txns.reduce((sum, t) => sum + t.amount, 0);
        const commission = gross * 0.15;
        const net = gross - commission;

        const settlement = await prisma.settlement.create({
            data: {
                providerId,
                periodStart,
                periodEnd,
                grossAmount: gross,
                commissionAmount: commission,
                netAmount: net,
                status: 'PENDING'
            }
        });

        return { success: true, settlement };
    } catch (error) {
        console.error('Settlement error:', error);
        return { error: error.message };
    }
}

/**
 * Get all Settlements
 */
export async function getSettlements({ page = 1, limit = 20, status = null } = {}) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
            return { error: 'Unauthorized.' };
        }

        const skip = (page - 1) * limit;
        const where = status ? { status } : {};

        const settlements = await prisma.settlement.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { provider: true, payouts: true }
        });

        const total = await prisma.settlement.count({ where });

        return { settlements, total, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * Mark Settlement as PAID and create Payout record
 */
export async function processPayout(settlementId, method, reference = null) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { error: 'Unauthorized' };

        const settlement = await prisma.settlement.findUnique({ where: { id: settlementId } });
        if (!settlement) return { error: 'Not found' };
        if (settlement.status === 'PAID') return { error: 'Already paid' };

        const payout = await prisma.payout.create({
            data: {
                settlementId,
                amount: settlement.netAmount,
                method,
                reference,
                status: 'PAID',
                processedById: admin.id,
                paidAt: new Date()
            }
        });

        await prisma.settlement.update({
            where: { id: settlementId },
            data: { status: 'PAID' }
        });

        await logAdminAction(`Processed Payout for Settlement ${settlementId}`, 'FINANCE', payout.id);
        revalidatePath('/admin/finance/payouts');
        revalidatePath('/admin/finance/settlements');

        return { success: true, payout };
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * Get Finance Reports overview
 */
export async function getFinanceReports() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { error: 'Unauthorized' };

        const totalRevenue = await prisma.transaction.aggregate({
            where: { status: 'COMPLETED' },
            _sum: { amount: true }
        });

        const totalPayouts = await prisma.payout.aggregate({
            where: { status: 'PAID' },
            _sum: { amount: true }
        });

        return {
            success: true,
            stats: {
                revenue: totalRevenue._sum.amount || 0,
                payouts: totalPayouts._sum.amount || 0,
                netProfit: (totalRevenue._sum.amount || 0) - (totalPayouts._sum.amount || 0)
            }
        };
    } catch (error) {
        return { error: error.message };
    }
}
