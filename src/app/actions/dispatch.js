'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';
import { revalidatePath } from 'next/cache';

/**
 * Get all Dispatches (Admin specific)
 */
export async function getDispatches({ page = 1, limit = 20, status = null, module = null } = {}) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
            return { error: 'Unauthorized.' };
        }

        const skip = (page - 1) * limit;
        const where = {};

        if (status) where.status = status;
        if (module) where.order = { module: module };

        const dispatches = await prisma.dispatch.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    include: {
                        user: { select: { name: true, phone: true } },
                    }
                },
                driver: { select: { name: true, phone: true, role: true } },
                transaction: true
            }
        });

        const total = await prisma.dispatch.count({ where });

        return { dispatches, total, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error('Error fetching dispatches:', error);
        return { error: error.message };
    }
}

/**
 * Assign or Reassign a Driver Manually (Admin Override)
 */
export async function assignDriver(dispatchId, driverId) {
    try {
        const admin = await getCurrentUser();
        if (!admin || (!admin.role?.startsWith('ADMIN_') && admin.role !== 'ADMIN_SUPER')) {
            return { error: 'Unauthorized.' };
        }

        const currentDispatch = await prisma.dispatch.findUnique({ where: { id: dispatchId } });
        if (!currentDispatch) return { error: 'Dispatch not found.' };

        // Verify driver role
        const driver = await prisma.user.findUnique({ where: { id: driverId } });
        if (!driver || driver.role !== 'DRIVER') return { error: 'Invalid Driver ID' };

        const updated = await prisma.dispatch.update({
            where: { id: dispatchId },
            data: {
                driverId,
                status: 'ASSIGNED',
                isOverride: true,
                assignedById: admin.id
            }
        });

        await logAdminAction(
            `Manually reassigned Dispatch ${dispatchId} to Driver ${driverId}`,
            'DISPATCH',
            dispatchId,
            { previousDriver: currentDispatch.driverId, newDriver: driverId }
        );

        revalidatePath('/admin/dispatch');
        return { success: true, dispatch: updated };
    } catch (error) {
        return { error: error.message };
    }
}

/**
 * Cancel or Fail a dispatch manually
 */
export async function updateDispatchStatus(dispatchId, newStatus, delayReason = null) {
    try {
        const admin = await getCurrentUser();
        if (!admin || (!admin.role?.startsWith('ADMIN_') && admin.role !== 'ADMIN_SUPER')) {
            return { error: 'Unauthorized.' };
        }

        if (!['COMPLETED', 'FAILED', 'CANCELLED', 'PENDING'].includes(newStatus)) {
            return { error: 'Invalid status' };
        }

        const updated = await prisma.dispatch.update({
            where: { id: dispatchId },
            data: {
                status: newStatus,
                delayReason
            }
        });

        await logAdminAction(`Update Dispatch ${dispatchId} to ${newStatus}`, 'DISPATCH', dispatchId);

        revalidatePath('/admin/dispatch');
        return { success: true, dispatch: updated };
    } catch (err) {
        return { error: err.message };
    }
}

/**
 * Used to get active jobs for the logged in driver
 */
export async function getActiveJobsForDriver() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'DRIVER') return { error: 'Unauthorized' };

        const jobs = await prisma.dispatch.findMany({
            where: {
                driverId: user.id,
                status: { in: ['ASSIGNED', 'ACCEPTED'] }
            },
            include: {
                order: {
                    include: {
                        user: { select: { name: true, phone: true } }
                    }
                }
            }
        });

        return { jobs };
    } catch (err) {
        return { error: err.message };
    }
}
