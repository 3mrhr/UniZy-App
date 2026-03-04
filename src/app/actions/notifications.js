'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

/**
 * Core utility to send a notification inline
 */
export async function createNotification(userId, title, message, type = 'SYSTEM', link = null) {
    try {
        // Here we could check user.notificationPrefs but keeping it simple for MVP
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
                isRead: false
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to create notification', error);
        return { success: false };
    }
}

/**
 * Fetch a user's notifications
 */
export async function getMyNotifications() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const unreadCount = await prisma.notification.count({
            where: { userId: user.id, isRead: false }
        });

        return { success: true, notifications, unreadCount };
    } catch (error) {
        console.error('Failed to get notifications', error);
        return { success: false, error: 'Database error' };
    }
}

/**
 * Fetch only the unread count (for lightweight UI polling)
 */
export async function getUnreadNotificationCount() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const unreadCount = await prisma.notification.count({
            where: { userId: user.id, isRead: false }
        });

        return { success: true, unreadCount };
    } catch (error) {
        console.error('Failed to get unread count', error);
        return { success: false, error: 'Database error' };
    }
}

/**
 * Mark notifications as read
 */
export async function markNotificationsAsRead(notificationIds = null) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        if (!notificationIds || notificationIds.length === 0) {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { userId: user.id, isRead: false },
                data: { isRead: true }
            });
        } else {
            await prisma.notification.updateMany({
                where: { userId: user.id, id: { in: notificationIds } },
                data: { isRead: true }
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to mark notifications as read', error);
        return { success: false, error: 'Database error' };
    }
}

/**
 * Admin: Broadcast a notification to all users
 */
export async function broadcastNotification(title, message, type = 'SYSTEM', targetRole = 'ALL') {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { success: false, error: 'Unauthorized' };

        const whereClause = targetRole === 'ALL' ? {} : { role: targetRole };

        const users = await prisma.user.findMany({
            where: whereClause,
            select: { id: true }
        });

        if (users.length === 0) return { success: true, count: 0 };

        const notificationsData = users.map(u => ({
            userId: u.id,
            title,
            message,
            type,
            isRead: false
        }));

        const result = await prisma.notification.createMany({
            data: notificationsData
        });

        return { success: true, count: result.count };
    } catch (error) {
        console.error('Failed to broadcast notification', error);
        return { success: false, error: 'Database error' };
    }
}
