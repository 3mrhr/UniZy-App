'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';

export async function createPost({ content, category, imageUrl }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const post = await prisma.hubPost.create({
            data: {
                content,
                category: category || 'general',
                imageUrl: imageUrl || null,
                authorId: user.id,
            }
        });

        return { success: true, post };
    } catch (error) {
        console.error('Create post error:', error);
        return { error: 'Failed to create post.' };
    }
}

export async function getPosts({ category, page = 1, limit = 20 } = {}) {
    try {
        const where = { status: 'ACTIVE' };
        if (category && category !== 'all') {
            where.category = category;
        }

        const posts = await prisma.hubPost.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                author: {
                    select: { id: true, name: true, profileImage: true, university: true }
                }
            }
        });

        const total = await prisma.hubPost.count({ where });

        return { posts, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error('Get posts error:', error);
        return { posts: [], total: 0 };
    }
}

export async function flagPost(postId, reason) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        await prisma.hubPost.update({
            where: { id: postId },
            data: {
                isFlagged: true,
                flagReason: reason || 'Reported by user',
                status: 'FLAGGED',
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Flag post error:', error);
        return { error: 'Failed to flag post.' };
    }
}

export async function deletePost(postId) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.role?.includes('ADMIN')) {
            return { error: 'Not authorized — admin only' };
        }

        await prisma.hubPost.update({
            where: { id: postId },
            data: { status: 'REMOVED' }
        });

        await logAdminAction('REMOVE_POST', 'HUB', postId, { action: 'Admin removed flagged post' });

        return { success: true };
    } catch (error) {
        console.error('Delete post error:', error);
        return { error: 'Failed to delete post.' };
    }
}

export async function getModQueue() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.role?.includes('ADMIN')) {
            return { error: 'Not authorized' };
        }

        const flagged = await prisma.hubPost.findMany({
            where: { status: 'FLAGGED' },
            orderBy: { updatedAt: 'desc' },
            include: {
                author: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        const stats = {
            totalPosts: await prisma.hubPost.count(),
            activePosts: await prisma.hubPost.count({ where: { status: 'ACTIVE' } }),
            flaggedPosts: await prisma.hubPost.count({ where: { status: 'FLAGGED' } }),
            removedPosts: await prisma.hubPost.count({ where: { status: 'REMOVED' } }),
        };

        return { flagged, stats };
    } catch (error) {
        console.error('Mod queue error:', error);
        return { flagged: [], stats: {} };
    }
}

export async function approvePost(postId) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.role?.includes('ADMIN')) {
            return { error: 'Not authorized' };
        }

        await prisma.hubPost.update({
            where: { id: postId },
            data: { status: 'ACTIVE', isFlagged: false, flagReason: null }
        });

        await logAdminAction('APPROVE_POST', 'HUB', postId, { action: 'Admin restored flagged post' });

        return { success: true };
    } catch (error) {
        console.error('Approve post error:', error);
        return { error: 'Failed to approve post.' };
    }
}
