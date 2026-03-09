'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';
import { uploadImage } from './upload';

export async function createPost({ content, category, imageUrl }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        let finalImageUrl = imageUrl || null;
        if (finalImageUrl && (finalImageUrl.startsWith('data:') || finalImageUrl.startsWith('blob:'))) {
            const uploadRes = await uploadImage(finalImageUrl, { folder: 'unizy/hub' });
            if (uploadRes.success) {
                finalImageUrl = uploadRes.url;
            }
        }

        const post = await prisma.hubPost.create({
            data: {
                content,
                category: category || 'general',
                imageUrl: finalImageUrl,
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

        // Platinum: Shadow-ban filter
        if (!user || !user.isShadowBanned) {
            where.author = { isShadowBanned: false };
        } else {
            where.OR = [
                { author: { isShadowBanned: false } },
                { authorId: user.id }
            ];
        }

        const posts = await prisma.hubPost.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                author: {
                    select: { id: true, name: true, profileImage: true, university: true, tier: true }
                },
                likes: user ? { where: { userId: user.id } } : false,
                comments: {
                    where: { parentId: null }, // Fetch top-level comments for threading
                    orderBy: { createdAt: 'asc' },
                    take: 3, // Preview first 3
                    include: {
                        author: { select: { name: true, profileImage: true, tier: true } },
                        replies: {
                            include: { author: { select: { name: true, profileImage: true, tier: true } } }
                        }
                    }
                },
                _count: {
                    select: { comments: true, likes: true }
                }
            }
        });

        const formattedPosts = posts.map(post => ({
            ...post,
            likes: post._count.likes,
            commentsCount: post._count.comments,
            isLiked: post.likes?.length > 0
        }));

        const total = await prisma.hubPost.count({ where });

        return { success: true, posts: formattedPosts, total, page, totalPages: Math.ceil(total / limit) };
    } catch (error) {
        console.error('Get posts error:', error);
        return { success: false, posts: [], total: 0 };
    }
}

/**
 * Platinum Alpha: Trending Pulse Algorithm
 * Weighs likes and comments within the last 48 hours.
 */
export async function getTrendingPosts() {
    try {
        const fortyEightHoursAgo = new Date();
        fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

        const posts = await prisma.hubPost.findMany({
            where: {
                status: 'ACTIVE',
                createdAt: { gte: fortyEightHoursAgo }
            },
            orderBy: [
                { likesCount: 'desc' },
                { commentsCount: 'desc' }
            ],
            take: 3,
            include: {
                author: { select: { name: true, profileImage: true } }
            }
        });

        return { success: true, posts };
    } catch (error) {
        console.error('Trending posts error:', error);
        return { success: false, posts: [] };
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

export async function addComment(postId, content, parentId = null) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        // Platinum: Auto-flag toxic content (Basic)
        const toxicWords = ['spam', 'abuse', 'toxic']; // Placeholder for real dictionary
        const isToxic = toxicWords.some(word => content.toLowerCase().includes(word));

        const comment = await prisma.hubComment.create({
            data: {
                content,
                postId,
                authorId: user.id,
                parentId: parentId || null
            },
            include: {
                author: { select: { name: true, tier: true, profileImage: true } }
            }
        });

        if (isToxic) {
            await logAdminAction('AUTO_FLAG_COMMENT', 'HUB', comment.id, { content, authorId: user.id });
        }

        // Increment counter on post
        await prisma.hubPost.update({
            where: { id: postId },
            data: { commentsCount: { increment: 1 } }
        });

        // Platinum Reward: Gain 1 point for commenting (Engagement loop)
        const { earnRewardPoints } = await import('./rewards-engine');
        await earnRewardPoints(user.id, 1, null); // Award small fixed points for social interaction

        return { success: true, comment };
    } catch (error) {
        console.error('Add comment error:', error);
        return { error: 'Failed to add comment.' };
    }
}

/**
 * Platinum Moderation: Shadow Ban a user.
 * Hides their content from others without alerting them.
 */
export async function shadowBanUser(userId) {
    try {
        const admin = await getCurrentUser();
        if (!admin || admin.role !== 'ADMIN_SUPER') {
            return { error: 'Only Super Admin can shadow ban users.' };
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { isShadowBanned: true }
        });

        await logAdminAction('SHADOW_BAN_USER', 'HUB', userId, { adminId: admin.id });

        return { success: true, user };
    } catch (error) {
        console.error('Shadow ban error:', error);
        return { error: 'Failed to shadow ban user.' };
    }
}

export async function createRoommateRequest(data) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { gender: true }
        });

        if (!dbUser?.gender) {
            return { error: 'Profile gender not set. Please update your profile.' };
        }

        const request = await prisma.roommateRequest.create({
            data: {
                userId: user.id,
                budget: parseFloat(data.budget),
                area: data.area,
                gender: dbUser.gender, // Use profile gender
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
        const user = await getCurrentUser();
        const where = { status: 'ACTIVE' };

        // Strictly enforce gender locking if user is authenticated
        if (user) {
            const dbUser = await prisma.user.findUnique({
                where: { id: user.id },
                select: { gender: true }
            });
            if (dbUser?.gender) {
                where.user = { gender: dbUser.gender };
            }
        }

        const requests = await prisma.roommateRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, university: true, profileImage: true, gender: true } }
            }
        });

        return { success: true, requests };
    } catch (error) {
        console.error('Get roommate requests error:', error);
        return { requests: [] };
    }
}

export async function getRoommateMatches() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return { error: 'Not authenticated' };

        // Fetch full user profile to get gender
        const dbUser = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: { gender: true }
        });

        if (!dbUser?.gender) {
            return { error: 'Profile gender not set. Please update your profile.' };
        }

        // Get current user's roommate preference/request to compare
        const myRequest = await prisma.roommateRequest.findFirst({
            where: { userId: currentUser.id },
            orderBy: { updatedAt: 'desc' }
        });

        const allRequests = await prisma.roommateRequest.findMany({
            where: {
                status: 'ACTIVE',
                userId: { not: currentUser.id },
                user: { gender: dbUser.gender } // Strict gender locking
            },
            include: {
                user: { select: { id: true, name: true, university: true, profileImage: true, gender: true } }
            }
        });

        if (!myRequest) {
            // If user hasn't created a request, just return all as neutral
            return {
                success: true,
                requests: allRequests.map(r => ({ ...r, matchScore: 0 }))
            };
        }

        const scoredRequests = allRequests.map(other => {
            let score = 0;
            const weights = {
                habits: 20, // smoking, sleep, cleanliness, study
                budget: 15,
                area: 5
            };

            // Habit Checks (Binary matches for now)
            if (other.smoking === myRequest.smoking) score += weights.habits;
            if (other.sleep === myRequest.sleep) score += weights.habits;
            if (other.cleanliness === myRequest.cleanliness) score += weights.habits;
            if (other.study === myRequest.study) score += weights.habits;

            // Budget Match (Within 15% range)
            const budgetDiff = Math.abs(other.budget - myRequest.budget);
            const budgetTolerance = myRequest.budget * 0.15;
            if (budgetDiff <= budgetTolerance) score += weights.budget;

            // Area Match
            if (other.area.toLowerCase() === myRequest.area.toLowerCase()) score += weights.area;

            // Normalize to 100
            const maxScore = (weights.habits * 4) + weights.budget + weights.area;
            const matchPercentage = Math.round((score / maxScore) * 100);

            return {
                ...other,
                matchScore: matchPercentage
            };
        });

        // Sort by match score descending
        scoredRequests.sort((a, b) => b.matchScore - a.matchScore);

        return { success: true, requests: scoredRequests };
    } catch (error) {
        console.error('Get roommate matches error:', error);
        return { error: 'Failed to find matches' };
    }
}
