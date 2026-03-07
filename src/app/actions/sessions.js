'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

/**
 * Lists all active sessions for the current user.
 */
export async function listUserSessions() {
    const session = await getSession();
    if (!session.user) return { success: false, error: 'Unauthorized' };

    try {
        const sessions = await prisma.session.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                userAgent: true,
                ipAddress: true,
                createdAt: true,
            }
        });
        return { success: true, sessions };
    } catch (error) {
        console.error('Failed to list sessions:', error);
        return { success: false, error: 'Failed to fetch sessions' };
    }
}

/**
 * Revokes a specific session.
 */
export async function revokeSession(sessionId) {
    const session = await getSession();
    if (!session.user) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.session.delete({
            where: {
                id: sessionId,
                userId: session.user.id, // Ensure ownership
            }
        });

        revalidatePath('/profile/security'); // Assuming this page exists or will exist
        return { success: true };
    } catch (error) {
        console.error('Failed to revoke session:', error);
        return { success: false, error: 'Failed to revoke session' };
    }
}

/**
 * Revokes all sessions except the current one.
 */
export async function revokeOtherSessions() {
    const session = await getSession();
    if (!session.user || !session.user.sessionId) return { success: false, error: 'Unauthorized' };

    try {
        await prisma.session.deleteMany({
            where: {
                userId: session.user.id,
                id: { not: session.user.sessionId }
            }
        });

        revalidatePath('/profile/security');
        return { success: true };
    } catch (error) {
        console.error('Failed to revoke other sessions:', error);
        return { success: false, error: 'Failed to revoke sessions' };
    }
}
