'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';

/**
 * Fetch overall system intelligence & analytics.
 * All numbers are from real database queries — zero hardcoded values.
 */
export async function getDashboardAnalytics() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { success: false, error: 'Unauthorized' };

        // Run all queries in parallel for performance
        const [
            totalStudents,
            totalDrivers,
            totalMerchants,
            totalProviders,
            orders,
            totalTransactions,
            txnRevenue,
            txnCommission,
            bookings,
            promos,
            totalTickets,
            openTickets,
            activeListings,
            activeDeals,
            activeMeals,
            pendingVerifications,
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'DRIVER' } }),
            prisma.user.count({ where: { role: 'MERCHANT' } }),
            prisma.user.count({ where: { role: 'PROVIDER' } }),
            prisma.order.findMany({
                select: { id: true, status: true, total: true, service: true, createdAt: true }
            }),
            prisma.transaction.count(),
            prisma.transaction.aggregate({ _sum: { amount: true } }),
            prisma.transaction.aggregate({ _sum: { unizyCommissionAmount: true } }),
            prisma.serviceBooking.findMany({ select: { id: true, status: true } }),
            prisma.promoCode.findMany({ select: { currentUses: true } }),
            prisma.supportTicket.count(),
            prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
            prisma.housingListing.count({ where: { status: 'ACTIVE' } }),
            prisma.deal.count({ where: { status: 'ACTIVE' } }),
            prisma.meal.count({ where: { status: 'ACTIVE' } }),
            prisma.verificationDocument.count({ where: { status: 'PENDING' } }),
        ]);

        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
        const activeOrders = orders.filter(o => o.status === 'ACCEPTED' || o.status === 'PICKED_UP').length;
        const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
        const deliveryOrders = orders.filter(o => o.service === 'DELIVERY').length;
        const transportOrders = orders.filter(o => o.service === 'TRANSPORT').length;

        const totalServiceBookings = bookings.length;
        const totalPromoUses = promos.reduce((sum, p) => sum + p.currentUses, 0);

        // Revenue = SUM(Transaction.amount), not Order.total
        const revenue = txnRevenue._sum.amount || 0;
        const commission = txnCommission._sum.unizyCommissionAmount || 0;

        return {
            success: true,
            stats: {
                // Revenue from Transaction snapshots (real, not mock)
                revenue,
                commission,
                orders: { total: totalOrders, pending: pendingOrders, active: activeOrders, completed: completedOrders },
                users: { students: totalStudents, drivers: totalDrivers, merchants: totalMerchants, providers: totalProviders },
                breakdown: { delivery: deliveryOrders, transport: transportOrders, services: totalServiceBookings },
                promos: { totalUses: totalPromoUses },
                tickets: { total: totalTickets, open: openTickets },
                marketplace: { listings: activeListings, deals: activeDeals, meals: activeMeals },
                transactions: totalTransactions,
                pendingVerifications,
            }
        };
    } catch (error) {
        console.error('Failed to get analytics', error);
        return { success: false, error: 'Database error' };
    }
}

/**
 * Helper to record system events globally for analytics.
 * Reuses the AuditLog table but bypasses the "Admin Only" requirement 
 * since students and guests can trigger analytics events.
 * 
 * @param {string} eventName - The action taken (e.g., "SIGNUP", "ORDER_CREATED")
 * @param {string} targetId - ID of the affected entity (e.g., UserId, OrderId)
 * @param {object} details - Additional optional JSON details
 */
export async function logEvent(eventName, targetId = null, details = null) {
    try {
        const user = await getCurrentUser();

        await prisma.auditLog.create({
            data: {
                action: eventName.toUpperCase(),
                module: 'ANALYTICS',
                targetId: targetId,
                details: details ? JSON.stringify(details) : null,
                adminId: user ? user.id : null, // Uses adminId column historically, but stores any userId for analytics
            }
        });

        return true;
    } catch (error) {
        console.error('[ANALYTICS_ERROR] Failed to save event log:', error);
        return false;
    }
}
