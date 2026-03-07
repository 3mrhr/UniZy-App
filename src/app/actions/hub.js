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
        const user = await getCurrentUser();
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
                },
                likes: user ? { where: { userId: user.id } } : false,
                _count: {
                    select: { comments: true, likes: true }
                }
            }
        });

        const formattedPosts = posts.map(post => ({
            ...post,
            likes: post._count.likes,
            comments: post._count.comments,
            isLiked: post.likes?.length > 0
        }));

        const total = await prisma.hubPost.count({ where });

        return { posts: formattedPosts, total, page, totalPages: Math.ceil(total / limit) };
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
        if (!user || !user.role?.startsWith('ADMIN_')) {
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
        if (!user || !user.role?.startsWith('ADMIN_')) {
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
        if (!user || !user.role?.startsWith('ADMIN_')) {
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

export async function getNotices() {
    try {
        const user = await getCurrentUser();
        const university = user?.university || 'Assiut University';

        const notices = await prisma.campusNotice.findMany({
            where: {
                status: 'ACTIVE',
                university,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, notices };
    } catch (error) {
        console.error('Get notices error:', error);
        return { notices: [] };
    }
}

export async function toggleLike(postId) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const existingLike = await prisma.hubLike.findUnique({
            where: {
                postId_userId: { postId, userId: user.id }
            }
        });

        if (existingLike) {
            await prisma.hubLike.delete({
                where: { id: existingLike.id }
            });
            // Decrement counter
            await prisma.hubPost.update({
                where: { id: postId },
                data: { likesCount: { decrement: 1 } }
            });
            return { success: true, liked: false };
        } else {
            await prisma.hubLike.create({
                data: { postId, userId: user.id }
            });
            // Increment counter
            await prisma.hubPost.update({
                where: { id: postId },
                data: { likesCount: { increment: 1 } }
            });
            return { success: true, liked: true };
        }
    } catch (error) {
        console.error('Toggle like error:', error);
        return { error: 'Failed to update like status.' };
    }
}

export async function addComment(postId, content) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const comment = await prisma.hubComment.create({
            data: {
                content,
                postId,
                authorId: user.id
            },
            include: {
                author: { select: { name: true } }
            }
        });

        // Increment counter
        await prisma.hubPost.update({
            where: { id: postId },
            data: { commentsCount: { increment: 1 } }
        });

        return { success: true, comment };
    } catch (error) {
        console.error('Add comment error:', error);
        return { error: 'Failed to add comment.' };
    }
}

export async function createRoommateRequest(data) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const request = await prisma.roommateRequest.create({
            data: {
                userId: user.id,
                budget: parseFloat(data.budget),
                area: data.area,
                gender: data.gender,
                moveInDate: new Date(data.moveInDate),
                notes: data.notes,
                smoking: data.smoking,
                sleep: data.sleep,
                cleanliness: data.cleanliness,
                study: data.study
            }
        });

        return { success: true, request };
    } catch (error) {
        console.error('Create roommate request error:', error);
        return { error: 'Failed to post roommate request.' };
    }
}

export async function getRoommateRequests() {
    try {
        const requests = await prisma.roommateRequest.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, university: true, profileImage: true } }
            }
        });

        return { success: true, requests };
    } catch (error) {
        console.error('Get roommate requests error:', error);
        return { requests: [] };
    }
}
