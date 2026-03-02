'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

/**
 * Get real admin dashboard stats from the database.
 * Replaces all hardcoded mock numbers with actual queries.
 */
export async function getAdminDashboardStats() {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
            return { error: 'Unauthorized' };
        }

        // Run all count queries in parallel for performance
        const [
            totalUsers,
            totalStudents,
            totalDrivers,
            totalMerchants,
            totalProviders,
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalTransactions,
            totalRevenue,
            totalCommission,
            totalRefunds,
            pendingRefunds,
            totalTickets,
            openTickets,
            totalHousingListings,
            activeHousingListings,
            totalDeals,
            totalMeals,
            totalDispatches,
            pendingDispatches,
            totalSLABreaches,
            openSLABreaches,
            totalVerifications,
            pendingVerifications,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'DRIVER' } }),
            prisma.user.count({ where: { role: 'MERCHANT' } }),
            prisma.user.count({ where: { role: 'PROVIDER' } }),
            prisma.order.count(),
            prisma.order.count({ where: { status: 'PENDING' } }),
            prisma.order.count({ where: { status: 'COMPLETED' } }),
            prisma.order.count({ where: { status: 'CANCELLED' } }),
            prisma.transaction.count(),
            prisma.transaction.aggregate({ _sum: { amount: true } }),
            prisma.transaction.aggregate({ _sum: { unizyCommissionAmount: true } }),
            prisma.refund.count(),
            prisma.refund.count({ where: { status: 'REQUESTED' } }),
            prisma.supportTicket.count(),
            prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
            prisma.housingListing.count(),
            prisma.housingListing.count({ where: { status: 'ACTIVE' } }),
            prisma.deal.count({ where: { status: 'ACTIVE' } }),
            prisma.meal.count({ where: { status: 'ACTIVE' } }),
            prisma.dispatch.count(),
            prisma.dispatch.count({ where: { status: 'PENDING' } }),
            prisma.sLABreach.count(),
            prisma.sLABreach.count({ where: { status: 'OPEN' } }),
            prisma.verificationDocument.count(),
            prisma.verificationDocument.count({ where: { status: 'PENDING' } }),
        ]);

        return {
            success: true,
            stats: {
                // Users
                totalUsers,
                totalStudents,
                totalDrivers,
                totalMerchants,
                totalProviders,
                // Orders & Transactions
                totalOrders,
                pendingOrders,
                completedOrders,
                cancelledOrders,
                totalTransactions,
                // Revenue (from real data)
                totalRevenue: totalRevenue._sum.amount || 0,
                totalCommission: totalCommission._sum.unizyCommissionAmount || 0,
                // Refunds
                totalRefunds,
                pendingRefunds,
                // Support
                totalTickets,
                openTickets,
                // Marketplace
                totalHousingListings,
                activeHousingListings,
                totalDeals,
                totalMeals,
                // Operations
                totalDispatches,
                pendingDispatches,
                totalSLABreaches,
                openSLABreaches,
                // Verification
                totalVerifications,
                pendingVerifications,
            },
        };
    } catch (error) {
        console.error('Admin stats error:', error);
        return { error: 'Failed to fetch dashboard stats.' };
    }
}

/**
 * Get module-specific stats for module admin dashboards.
 * @param {string} module - e.g. "DELIVERY", "TRANSPORT", "HOUSING", "DEALS", "MEALS", "SERVICES"
 */
export async function getModuleStats(module) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
            return { error: 'Unauthorized' };
        }

        // Module-specific transaction stats
        const [
            totalModuleTransactions,
            moduleRevenue,
            moduleCommission,
            completedModuleTransactions,
            pendingModuleTransactions,
        ] = await Promise.all([
            prisma.transaction.count({ where: { type: module } }),
            prisma.transaction.aggregate({ where: { type: module }, _sum: { amount: true } }),
            prisma.transaction.aggregate({ where: { type: module }, _sum: { unizyCommissionAmount: true } }),
            prisma.transaction.count({ where: { type: module, status: 'COMPLETED' } }),
            prisma.transaction.count({ where: { type: module, status: 'PENDING' } }),
        ]);

        return {
            success: true,
            stats: {
                totalTransactions: totalModuleTransactions,
                totalRevenue: moduleRevenue._sum.amount || 0,
                totalCommission: moduleCommission._sum.unizyCommissionAmount || 0,
                completedTransactions: completedModuleTransactions,
                pendingTransactions: pendingModuleTransactions,
            },
        };
    } catch (error) {
        console.error('Module stats error:', error);
        return { error: 'Failed to fetch module stats.' };
    }
}
