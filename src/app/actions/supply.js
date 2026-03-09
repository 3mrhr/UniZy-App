'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

/**
 * Toggle Online/Offline Status for Supply-Side Actors
 * Informs the dispatch engine of active availability.
 */
export async function toggleSupplyOnlineStatus() {
    try {
        const user = await getCurrentUser();
        if (!user || !['MERCHANT', 'DRIVER', 'CLEANER', 'SERVICE_PROVIDER', 'HOUSE_OWNER'].includes(user.role)) {
            return { error: 'Unauthorized. Supplier role required.' };
        }

        const newStatus = !user.isOnline;

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                isOnline: newStatus,
                lastOnlineAt: new Date()
            }
        });

        revalidatePath('/merchant');
        revalidatePath('/courier');
        revalidatePath('/driver');

        return { success: true, isOnline: updated.isOnline };
    } catch (error) {
        console.error('Toggle availability error:', error);
        return { error: 'Failed to update availability status.' };
    }
}

/**
 * Get Provider Availability Stats (Admin/Dispatcher)
 * Returns counts of online providers by role for logistical planning.
 */
export async function getProviderAvailabilityStats() {
    try {
        const admin = await getCurrentUser();
        if (!admin || (!admin.role?.startsWith('ADMIN') && admin.role !== 'ADMIN_SUPER')) {
            return { error: 'Unauthorized.' };
        }

        const stats = await prisma.user.groupBy({
            by: ['role', 'isOnline'],
            where: {
                role: { in: ['MERCHANT', 'DRIVER', 'CLEANER', 'SERVICE_PROVIDER', 'HOUSE_OWNER'] }
            },
            _count: { _all: true }
        });

        // Format into a readable object
        const formatted = {
            MERCHANT: { online: 0, offline: 0 },
            DRIVER: { online: 0, offline: 0 },
            CLEANER: { online: 0, offline: 0 },
            SERVICE_PROVIDER: { online: 0, offline: 0 },
            HOUSE_OWNER: { online: 0, offline: 0 }
        };

        stats.forEach(s => {
            const status = s.isOnline ? 'online' : 'offline';
            if (formatted[s.role]) {
                formatted[s.role][status] = s._count._all;
            }
        });

        return { success: true, stats: formatted };
    } catch (error) {
        console.error('Fetch availability stats error:', error);
        return { error: 'Failed to fetch supply stats.' };
    }
}

/**
 * Force Offline (Admin Tool)
 * Used to kill ghost sessions or during terminal platform maintenance.
 */
export async function forceProviderOffline(userId) {
    try {
        const admin = await getCurrentUser();
        if (admin?.role !== 'ADMIN_SUPER') return { error: 'Unauthorized' };

        await prisma.user.update({
            where: { id: userId },
            data: { isOnline: false }
        });

        return { success: true };
    } catch (error) {
        return { error: 'Failed to force offline.' };
    }
}
