'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';
import { revalidatePath } from 'next/cache';

/**
 * Helper to fetch the dynamic commission rule for a module/provider
 */
async function getCommissionRate(module, providerType) {
    try {
        const rule = await prisma.commissionRule.findFirst({
            where: {
                module: module.toUpperCase(),
                providerType: providerType.toUpperCase(),
                isActive: true
            }
        });
        return rule ? rule.unizySharePercent / 100 : 0.15; // Default 15%
    } catch (e) {
        return 0.15;
    }
}

/**
 * Helper to generate settlements for a provider (Admin or System job)
 * This logic usually runs on a CRON job, but here is a manual trigger.
 */
export async function generateSettlements(providerId, periodStart, periodEnd) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { error: 'Unauthorized' };

        // 1. Idempotency Check: Don't allow duplicate settlements for the exact same window and provider
        const existing = await prisma.settlement.findFirst({
            where: {
                providerId,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
                status: { not: 'FAILED' }
            }
        });
        if (existing) return { error: 'A settlement for this provider and period already exists or is pending.' };

        // Fetch the provider to know their type (MERCHANT, DRIVER, etc.)
        const provider = await prisma.user.findUnique({ where: { id: providerId } });
        if (!provider) return { error: 'Provider not found' };

        // Atomic Reconcilliation: Find completed transactions for this provider that aren't settled yet
        const txns = await prisma.transaction.findMany({
            where: {
                providerId,
                status: 'COMPLETED',
                settlementId: null,
                createdAt: { gte: new Date(periodStart), lte: new Date(periodEnd) }
            }
        });

        if (txns.length === 0) return { error: 'No unsettled transactions found for this period.' };

        // Group transactions by type to apply specific rules
        let gross = 0;
        let totalCommission = 0;
        let totalNet = 0;

        for (const t of txns) {
            gross += t.amount;

            // 1. Check if commission was already calculated at time of transaction
            // 2. Otherwise, look up dynamic rule based on module (Transaction.type)
            let rate = 0.15;
            if (t.unizyCommissionAmount) {
                // If we already have a calculated amount, use it to derive net
                totalCommission += t.unizyCommissionAmount;
                totalNet += (t.amount - t.unizyCommissionAmount);
            } else {
                // Look up dynamic rate based on categorization
                rate = await getCommissionRate(t.type || 'GENERAL', provider.role);
                const comm = t.amount * rate;
                totalCommission += comm;
                totalNet += (t.amount - comm);
            }
        }

        // Create Settlement Record
        const settlement = await prisma.settlement.create({
            data: {
                providerId,
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd),
                grossAmount: gross,
                commissionAmount: totalCommission,
                netAmount: totalNet,
                status: 'PENDING',
                currency: 'EGP'
            }
        });

        // Atomic Linkage: Update all transactions to point to this settlement
        await prisma.transaction.updateMany({
            where: {
                id: { in: txns.map(t => t.id) }
            },
            data: {
                settlementId: settlement.id
            }
        });

        await logAdminAction(`Generated Atomic Settlement for Provider ${providerId} (Dynamic Rules)`, 'FINANCE', settlement.id);
        revalidatePath('/admin/finance/settlements');

        return { success: true, settlement };
    } catch (error) {
        console.error('Settlement error:', error);
        return { error: 'An unexpected error occurred' };
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
        console.error('Finance error:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * verifySettlementIntegrity (Dual-Ledger Verification)
 * Re-calculates transaction sums to ensure they match the settlement record.
 */
export async function verifySettlementIntegrity(settlementId) {
    try {
        const settlement = await prisma.settlement.findUnique({
            where: { id: settlementId },
            include: { transactions: true }
        });

        if (!settlement) return { error: 'Settlement not found' };

        // Calculate sum of all linked transactions
        const txns = await prisma.transaction.aggregate({
            where: { settlementId },
            _sum: { amount: true, unizyCommissionAmount: true }
        });

        const grossCalculated = txns._sum.amount || 0;
        const commCalculated = txns._sum.unizyCommissionAmount || 0;
        const netCalculated = grossCalculated - commCalculated;

        const isIntegrityIntact =
            Math.abs(settlement.grossAmount - grossCalculated) < 0.01 &&
            Math.abs(settlement.netAmount - netCalculated) < 0.01;

        if (!isIntegrityIntact) {
            console.error(`[CRITICAL] Integrity failure for Settlement ${settlementId}. Recorded: ${settlement.netAmount}, Calculated: ${netCalculated}`);
            return { error: 'Integrity check failed. Recorded amount does not match transaction sum.', calculations: { recorded: settlement.netAmount, calculated: netCalculated } };
        }

        return { success: true };
    } catch (error) {
        console.error('Integrity verification error:', error);
        return { error: 'System error during integrity check' };
    }
}

/**
 * Mark Settlement as PAID and create Payout record
 */
export async function processPayout(settlementId, method, reference = null) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { error: 'Unauthorized' };

        // 1. Dual-Ledger Integrity Check
        const verification = await verifySettlementIntegrity(settlementId);
        if (verification.error) return { error: `Payout Blocked: ${verification.error}` };

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
        console.error('Finance error:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get Finance Reports overview
 */
/**
 * Get Finance Reports (Enhanced with Module Filtering)
 */
export async function getFinanceReports(module = null) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { error: 'Unauthorized' };

        // Base where clause
        const baseWhere = { status: 'COMPLETED' };
        if (module) baseWhere.type = module.toUpperCase();

        // 1. Calculate GMV (Gross Merchandise Value)
        const gmv = await prisma.transaction.aggregate({
            where: baseWhere,
            _sum: { amount: true }
        });

        // 2. Calculate UniZy Commission Revenue
        const revenue = await prisma.transaction.aggregate({
            where: baseWhere,
            _sum: { unizyCommissionAmount: true }
        });

        // 3. Calculate Pending Payouts (Unsettled provider net amounts)
        const pendingPayoutWhere = { status: 'PENDING' };
        if (module) {
            // This is trickier as settlements are typically per-provider across all their txns,
            // but we can estimate based on unsettled transactions for that module
            const unsettledTxns = await prisma.transaction.aggregate({
                where: {
                    status: 'COMPLETED',
                    settlementId: null,
                    type: module.toUpperCase()
                },
                _sum: { amount: true, unizyCommissionAmount: true }
            });
            const pendingNet = (unsettledTxns._sum.amount || 0) - (unsettledTxns._sum.unizyCommissionAmount || 0);

            return {
                success: true,
                stats: {
                    gmv: gmv._sum.amount || 0,
                    revenue: revenue._sum.unizyCommissionAmount || 0,
                    pendingPayouts: pendingNet,
                    thisMonth: 0 // Simplified for module view
                }
            };
        }

        const pendingPayouts = await prisma.settlement.aggregate({
            where: pendingPayoutWhere,
            _sum: { netAmount: true }
        });

        // 4. Monthly GMV Growth
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthGMV = await prisma.transaction.aggregate({
            where: { ...baseWhere, createdAt: { gte: startOfMonth } },
            _sum: { amount: true }
        });

        return {
            success: true,
            stats: {
                gmv: gmv._sum.amount || 0,
                revenue: revenue._sum.unizyCommissionAmount || 0,
                pendingPayouts: pendingPayouts._sum.netAmount || 0,
                thisMonth: thisMonthGMV._sum.amount || 0
            }
        };
    } catch (error) {
        console.error('Finance error:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get Detailed Stats for a specific Module
 */
export async function getModuleDetailedStats(module) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { error: 'Unauthorized' };

        const targetModule = module.toUpperCase();

        // 1. Volumes
        const totalTxns = await prisma.transaction.count({ where: { type: targetModule } });
        const completedTxns = await prisma.transaction.count({ where: { type: targetModule, status: 'COMPLETED' } });

        // 2. Financials
        const sums = await prisma.transaction.aggregate({
            where: { type: targetModule, status: 'COMPLETED' },
            _sum: { amount: true, unizyCommissionAmount: true },
            _avg: { amount: true }
        });

        // 3. Success Rate
        const successRate = totalTxns > 0 ? (completedTxns / totalTxns) * 100 : 0;

        return {
            success: true,
            details: {
                totalVolume: sums._sum.amount || 0,
                netRevenue: sums._sum.unizyCommissionAmount || 0,
                avgOrderValue: sums._avg.amount || 0,
                transactionCount: completedTxns,
                successRate: successRate.toFixed(1)
            }
        };
    } catch (error) {
        console.error('Module stats error:', error);
        return { error: 'An unexpected error occurred' };
    }
}

/**
 * Get Recent Transactions for Dashboard (Enhanced with Module Filtering)
 */
export async function getRecentTransactions(limit = 10, module = null) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { error: 'Unauthorized' };

        const where = {};
        if (module) where.type = module.toUpperCase();

        const transactions = await prisma.transaction.findMany({
            where,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { user: true, deal: true, order: true }
        });

        return { success: true, transactions };
    } catch (error) {
        console.error('Finance error:', error);
        return { error: 'An unexpected error occurred' };
    }
}
