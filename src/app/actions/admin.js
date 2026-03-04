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

        // Prevent modifying the very first SUPER_ADMIN account as a failsafe
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
