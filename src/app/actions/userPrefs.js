'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';

/**
 * Get user notification preferences
 */
export async function getNotificationPrefs() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        // Ensure default prefs if null
        const prefs = user.notificationPrefs || {
            orders: true,
            promos: true,
            system: true,
            marketing: false
        };

        return { success: true, prefs };
    } catch (error) {
        console.error('Failed to get notification prefs', error);
        return { success: false, error: 'Database error' };
    }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPrefs(newPrefs) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        await prisma.user.update({
            where: { id: user.id },
            data: { notificationPrefs: newPrefs }
        });

        revalidatePath('/account/notifications');
        return { success: true };
    } catch (error) {
        console.error('Failed to update notification prefs', error);
        return { success: false, error: 'Database error' };
    }
}
