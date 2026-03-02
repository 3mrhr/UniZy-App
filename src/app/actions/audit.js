'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

/**
 * Helper to record administrative actions globally.
 * 
 * @param {string} action - The action taken (e.g., "UPDATE_ROLE", "DELETE_POST")
 * @param {string} module - The system module (e.g., "USERS", "HUB", "HOUSING")
 * @param {string} targetId - ID of the affected entity
 * @param {object} details - Additional optional JSON details
 */
export async function logAdminAction(action, module, targetId = null, details = null) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) {
            console.warn(`[AUDIT] Blocked unauthorized log attempt from non-admin user ${admin?.id || 'Unknown'}`);
            return false; // Fail silently so it doesn't break parent transactions
        }

        await prisma.auditLog.create({
            data: {
                action: action.toUpperCase(),
                module: module.toUpperCase(),
                targetId: targetId,
                details: details ? JSON.stringify(details) : null,
                adminId: admin.id,
            }
        });

        return true;
    } catch (error) {
        console.error('[AUDIT_ERROR] Failed to save audit log:', error);
        return false;
    }
}

/**
 * Fetches all audit logs for the central admin viewer dashboard.
 */
export async function getAuditLogs(filters = {}) {
    try {
        const admin = await getCurrentUser();
        if (!admin || admin.role !== 'ADMIN_SUPER') {
            return { error: 'Unauthorized. Super Admin access required to view global audit logs.' };
        }

        // Build where clause based on filters if any
        const where = {};
        if (filters.module && filters.module !== 'ALL') where.module = filters.module;
        if (filters.adminId) where.adminId = filters.adminId;

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 100, // Limit for performance
            include: {
                admin: {
                    select: { name: true, role: true, email: true }
                }
            }
        });

        return { success: true, data: logs };
    } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        return { error: 'Failed to retrieve logs' };
    }
}
