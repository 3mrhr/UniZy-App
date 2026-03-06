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

        // Run all queries in parallel for performance, utilizing groupBy and aggregate
        // to minimize database roundtrips.
        const [
            totalUsers,
            usersByRole,
            totalOrders,
            ordersByStatus,
            transactionAgg,
            totalRefunds,
            refundsByStatus,
            totalTickets,
            ticketsByStatus,
            totalHousingListings,
            housingListingsByStatus,
            totalDeals, // Active
            totalMeals, // Active
            totalDispatches,
            dispatchesByStatus,
            totalSLABreaches,
            slaBreachesByStatus,
            totalVerifications,
            verificationsByStatus,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),

            prisma.order.count(),
            prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),

            prisma.transaction.aggregate({ _count: { _all: true }, _sum: { amount: true, unizyCommissionAmount: true } }),

            prisma.refund.count(),
            prisma.refund.groupBy({ by: ['status'], _count: { _all: true } }),

            prisma.supportTicket.count(),
            prisma.supportTicket.groupBy({ by: ['status'], _count: { _all: true } }),

            prisma.housingListing.count(),
            prisma.housingListing.groupBy({ by: ['status'], _count: { _all: true } }),

            prisma.deal.count({ where: { status: 'ACTIVE' } }),
            prisma.meal.count({ where: { status: 'ACTIVE' } }),

            prisma.dispatch.count(),
            prisma.dispatch.groupBy({ by: ['status'], _count: { _all: true } }),

            prisma.sLABreach.count(),
            prisma.sLABreach.groupBy({ by: ['status'], _count: { _all: true } }),

            prisma.verificationDocument.count(),
            prisma.verificationDocument.groupBy({ by: ['status'], _count: { _all: true } }),
        ]);

        const getCountByRole = (role) => usersByRole.find(r => r.role === role)?._count._all || 0;
        const getCountByStatus = (arr, status) => arr.find(s => s.status === status)?._count._all || 0;
        const getCountByStatuses = (arr, statuses) => arr.filter(s => statuses.includes(s.status)).reduce((acc, curr) => acc + curr._count._all, 0);

        return {
            success: true,
            stats: {
                // Users
                totalUsers,
                totalStudents: getCountByRole('STUDENT'),
                totalDrivers: getCountByRole('DRIVER'),
                totalMerchants: getCountByRole('MERCHANT'),
                totalProviders: getCountByRole('PROVIDER'),
                // Orders & Transactions
                totalOrders,
                pendingOrders: getCountByStatus(ordersByStatus, 'PENDING'),
                completedOrders: getCountByStatus(ordersByStatus, 'COMPLETED'),
                cancelledOrders: getCountByStatus(ordersByStatus, 'CANCELLED'),
                totalTransactions: transactionAgg._count._all || 0,
                // Revenue (from real data)
                totalRevenue: transactionAgg._sum.amount || 0,
                totalCommission: transactionAgg._sum.unizyCommissionAmount || 0,
                // Refunds
                totalRefunds,
                pendingRefunds: getCountByStatus(refundsByStatus, 'REQUESTED'),
                // Support
                totalTickets,
                openTickets: getCountByStatuses(ticketsByStatus, ['OPEN', 'IN_PROGRESS']),
                // Marketplace
                totalHousingListings,
                activeHousingListings: getCountByStatus(housingListingsByStatus, 'ACTIVE'),
                totalDeals,
                totalMeals,
                // Operations
                totalDispatches,
                pendingDispatches: getCountByStatus(dispatchesByStatus, 'PENDING'),
                totalSLABreaches,
                openSLABreaches: getCountByStatus(slaBreachesByStatus, 'OPEN'),
                // Verification
                totalVerifications,
                pendingVerifications: getCountByStatus(verificationsByStatus, 'PENDING'),
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
            moduleAgg,
            moduleByStatus
        ] = await Promise.all([
            prisma.transaction.aggregate({ where: { type: module }, _count: { _all: true }, _sum: { amount: true, unizyCommissionAmount: true } }),
            prisma.transaction.groupBy({ by: ['status'], where: { type: module }, _count: { _all: true } }),
        ]);

        const getStatusCount = (status) => moduleByStatus.find(s => s.status === status)?._count._all || 0;

        return {
            success: true,
            stats: {
                totalTransactions: moduleAgg._count._all || 0,
                totalRevenue: moduleAgg._sum.amount || 0,
                totalCommission: moduleAgg._sum.unizyCommissionAmount || 0,
                completedTransactions: getStatusCount('COMPLETED'),
                pendingTransactions: getStatusCount('PENDING'),
            },
        };
    } catch (error) {
        console.error('Module stats error:', error);
        return { error: 'Failed to fetch module stats.' };
    }
}
