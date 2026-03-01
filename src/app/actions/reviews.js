'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';

export async function createReview(data) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { error: 'You must be logged in to leave a review.' };
        }

        const review = await prisma.review.create({
            data: {
                rating: data.rating,
                comment: data.comment,
                userId: user.id,
                targetUserId: data.targetUserId,
                housingListingId: data.housingListingId,
                orderId: data.orderId,
            }
        });

        // Revalidate the path where the review was submitted
        if (data.housingListingId) {
            revalidatePath(`/housing/${data.housingListingId}`);
        }
        revalidatePath('/activity'); // If it was from an order

        return { success: true, review };
    } catch (error) {
        console.error('Failed to create review:', error);
        return { error: 'Failed to submit review.' };
    }
}

export async function getReviewsForHousing(housingListingId) {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                housingListingId
            },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate average
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const average = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        return { reviews, average, count: reviews.length };
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
        return { reviews: [], average: 0, count: 0 };
    }
}

export async function getReviewsForUser(targetUserId) {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                targetUserId
            },
            include: {
                user: {
                    select: {
                        name: true,
                        role: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate average
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const average = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

        return { reviews, average, count: reviews.length };
    } catch (error) {
        return { reviews: [], average: 0, count: 0 };
    }
}
