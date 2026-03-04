'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';
import { revalidatePath } from 'next/cache';

/**
 * STUDENT ACTIONS
 */

/**
 * Submit a report (for any target content/user)
 */
export async function submitReport({ type, targetId, reason, details, targetUserId }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized.' };

        const report = await prisma.report.create({
            data: {
                type,
                targetId,
                reason,
                details,
                targetUserId,
                reporterId: user.id,
                status: 'PENDING'
            }
        });

        // Auto-Suspension for Housing Listings
        if (type === 'HOUSING') {
            const reportCount = await prisma.report.count({
                where: { targetId, type: 'HOUSING', status: 'PENDING' }
            });

            if (reportCount >= 3) {
                await prisma.housingListing.update({
                    where: { id: targetId },
                    data: { status: 'SUSPENDED' }
                });

                // Fire an alert or log it
                await logAdminAction('AUTO_SUSPEND_LISTING', 'SAFETY', targetId, { reportCount });
            }
        }

        return { success: true, report };
    } catch (error) {
        console.error('Error submitting report:', error);
        return { success: false, error: 'Failed to submit report. Please try again later.' };
    }
}

/**
 * ADMIN ACTIONS
 */

/**
 * Fetch reports for the admin dashboard
 */
export async function getReports(filters = {}) {
    try {
        const user = await getCurrentUser();
        const allowedRoles = ['ADMIN', 'SUPPORT', 'SUPERADMIN'];
        if (!user || (!allowedRoles.includes(user.role) && !user.scopes?.includes('SAFETY'))) {
            return { success: false, error: 'Unauthorized.' };
        }

        const where = {};
        if (filters.status) where.status = filters.status;
        if (filters.type) where.type = filters.type;

        const reports = await prisma.report.findMany({
            where,
            include: {
                reporter: {
                    select: { name: true, email: true }
                },
                targetUser: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, reports };
    } catch (error) {
        console.error('Error fetching reports:', error);
        return { success: false, error: 'Failed to fetch reports.' };
    }
}

/**
 * Resolve or update the status of a report
 */
export async function resolveReport(reportId, { status, actionTaken }) {
    try {
        const user = await getCurrentUser();
        const allowedRoles = ['ADMIN', 'SUPPORT', 'SUPERADMIN'];
        if (!user || (!allowedRoles.includes(user.role) && !user.scopes?.includes('SAFETY'))) {
            return { success: false, error: 'Unauthorized.' };
        }

        const report = await prisma.report.update({
            where: { id: reportId },
            data: {
                status,
                actionTaken,
                updatedAt: new Date()
            }
        });

        await logAdminAction('RESOLVE_REPORT', 'SAFETY', { reportId, status, actionTaken });

        revalidatePath('/admin/reports');
        return { success: true, report };
    } catch (error) {
        console.error('Error resolving report:', error);
        return { success: false, error: 'Failed to resolve report.' };
    }
}

/**
 * Ban a user (Safety Action)
 */
export async function banUser(userId, reason) {
    try {
        const user = await getCurrentUser();
        if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
            return { success: false, error: 'Unauthorized.' };
        }

        await prisma.user.update({
            where: { id: userId },
            data: { status: 'BANNED' }
        });

        await logAdminAction('BAN_USER', 'SAFETY', { userId, reason });

        return { success: true };
    } catch (error) {
        console.error('Error banning user:', error);
        return { success: false, error: 'Failed to ban user.' };
    }
}
