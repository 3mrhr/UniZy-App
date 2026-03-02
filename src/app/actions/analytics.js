'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';

/**
 * Fetch overall system intelligence & analytics
 */
export async function getDashboardAnalytics() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { success: false, error: 'Unauthorized' };

        // 1. User Metrics
        const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
        const totalDrivers = await prisma.user.count({ where: { role: 'DRIVER' } });

        // 2. Order Metrics
        const orders = await prisma.order.findMany({
            select: { id: true, status: true, total: true, service: true, createdAt: true }
        });

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
        const activeOrders = orders.filter(o => o.status === 'ACCEPTED' || o.status === 'PICKED_UP').length;

        // Modules breakdown
        const deliveryOrders = orders.filter(o => o.service === 'DELIVERY').length;
        const transportOrders = orders.filter(o => o.service === 'TRANSPORT').length;

        // 3. Service Bookings
        const bookings = await prisma.serviceBooking.findMany({
            select: { id: true, status: true }
        });
        const totalServiceBookings = bookings.length;
        const pendingServiceBookings = bookings.filter(b => b.status === 'PENDING').length;

        // 4. Promotions Usage
        const promos = await prisma.promoCode.findMany({
            select: { currentUses: true }
        });
        const totalPromoUses = promos.reduce((sum, p) => sum + p.currentUses, 0);

        return {
            success: true,
            stats: {
                revenue: totalRevenue,
                orders: { total: totalOrders, pending: pendingOrders, active: activeOrders },
                users: { students: totalStudents, drivers: totalDrivers },
                breakdown: { delivery: deliveryOrders, transport: transportOrders, services: totalServiceBookings },
                promos: { totalUses: totalPromoUses }
            }
        };
    } catch (error) {
        console.error('Failed to get analytics', error);
        return { success: false, error: 'Database error' };
    }
}
