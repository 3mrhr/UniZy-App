'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { logAdminAction } from './audit';



export async function getUsers() {
    try {
        await requireRole(['ADMIN_SUPER']);

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                scopes: true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return { success: true, data: users };
    } catch (error) {
        console.error('Failed to get users:', error);
        return { success: false, error: error.message || 'Failed to fetch users' };
    }
}

export async function updateUserRole(userId, newRole, scopes = null) {
    try {
        await requireRole(['ADMIN_SUPER']);

        // Prevent modifying the very first ADMIN_SUPER account as a failsafe
        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (targetUser && targetUser.email === 'admin@unizy.com' && newRole !== 'ADMIN_SUPER') {
            return { success: false, error: 'Cannot demote the primary Super Admin.' };
        }

        const dataUpdate = { role: newRole };
        if (scopes !== null) {
            dataUpdate.scopes = scopes;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataUpdate
        });

        await logAdminAction(
            'UPDATE_ROLE',
            'USERS',
            userId,
            { oldRole: targetUser.role, newRole: newRole, userEmail: targetUser.email, scopes: scopes }
        );

        return { success: true, data: updatedUser };
    } catch (error) {
        console.error('Failed to update user role:', error);
        return { success: false, error: 'Failed to update role' };
    }
}
export async function inviteAdmin(email, name, role, scopes = []) {
    try {
        await requireRole(['ADMIN_SUPER']);

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return { success: false, error: 'User already exists with this email.' };

        // Create the admin user with a temporary password or random string
        // In a real app, this would trigger an email with a setup link
        const tempPassword = Math.random().toString(36).slice(-10);

        const newAdmin = await prisma.user.create({
            data: {
                email,
                name,
                role,
                scopes,
                password: tempPassword, // Placeholder for actual auth flow
                university: 'HQ',
                isVerified: true,
                status: 'ACTIVE'
            }
        });

        await logAdminAction(
            'INVITE_ADMIN',
            'STAFF',
            newAdmin.id,
            { email, role, scopes }
        );

        return { success: true, data: newAdmin };
    } catch (error) {
        console.error('Failed to invite admin:', error);
        return { success: false, error: 'Failed to invite admin' };
    }
}

export async function getStaffLogs(limit = 20) {
    try {
        await requireRole(['ADMIN_SUPER']);
        const logs = await prisma.auditLog.findMany({
            where: { module: 'STAFF' },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { admin: { select: { name: true } } }
        });
        return { success: true, logs };
    } catch (error) {
        return { success: false, error: 'Failed to fetch logs' };
    }
}
