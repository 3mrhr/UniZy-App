'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

/**
 * Fetch all active deals, optionally filtered by category and search term.
 */
export async function getActiveDeals(category = 'all', searchQuery = '') {
    try {
        const filters = {
            status: 'ACTIVE',
        };

        if (category && category !== 'all') {
            filters.category = category;
        }

        if (searchQuery) {
            filters.OR = [
                { title: { contains: searchQuery } },
                { description: { contains: searchQuery } },
                { merchant: { name: { contains: searchQuery } } }
            ];
        }

        const deals = await prisma.deal.findMany({
            where: filters,
            include: {
                merchant: {
                    select: { name: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, deals };
    } catch (error) {
        console.error('Error fetching deals:', error);
        return { success: false, error: 'Failed to fetch deals' };
    }
}

/**
 * Fetch a specific deal by ID including its merchant details.
 */
export async function getDealById(dealId) {
    if (!dealId) return { success: false, error: 'Deal ID is required' };

    try {
        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: {
                merchant: {
                    select: { name: true, phone: true }
                }
            }
        });

        if (!deal) return { success: false, error: 'Deal not found' };
        return { success: true, deal };
    } catch (error) {
        console.error('Error fetching deal:', error);
        return { success: false, error: 'Failed to fetch deal details' };
    }
}

/**
 * Fetch all deals saved by the currently verified student user.
 */
export async function getSavedDeals() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'STUDENT') {
            return { success: false, error: 'Unauthorized. Only students can save deals.' };
        }

        const savedDeals = await prisma.savedDeal.findMany({
            where: { userId: user.id },
            include: {
                deal: {
                    include: {
                        merchant: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, savedDeals: savedDeals.map(sd => sd.deal) };
    } catch (error) {
        console.error('Error fetching saved deals:', error);
        return { success: false, error: 'Failed to fetch saved deals' };
    }
}

/**
 * Toggle a deal's saved status for the currently logged-in student.
 */
export async function toggleSaveDeal(dealId) {
    if (!dealId) return { success: false, error: 'Deal ID is required' };

    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'STUDENT') {
            return { success: false, error: 'Must be logged in as a student to save deals.' };
        }

        // Check if it's already saved
        const existingSave = await prisma.savedDeal.findUnique({
            where: {
                userId_dealId: {
                    userId: user.id,
                    dealId: dealId
                }
            }
        });

        if (existingSave) {
            // Unsave
            await prisma.savedDeal.delete({
                where: { id: existingSave.id }
            });
            revalidatePath('/deals');
            revalidatePath(`/deals/${dealId}`);
            revalidatePath('/deals/saved');
            return { success: true, saved: false };
        } else {
            // Save
            await prisma.savedDeal.create({
                data: {
                    userId: user.id,
                    dealId: dealId
                }
            });
            revalidatePath('/deals');
            revalidatePath(`/deals/${dealId}`);
            revalidatePath('/deals/saved');
            return { success: true, saved: true };
        }
    } catch (error) {
        console.error('Error toggling saved deal:', error);
        return { success: false, error: 'Failed to update saved deal status' };
    }
}

/**
 * Check if a specific deal is saved by the current user.
 */
export async function checkIsDealSaved(dealId) {
    if (!dealId) return false;
    try {
        const user = await getCurrentUser();
        if (!user) return false;

        const existingSave = await prisma.savedDeal.findUnique({
            where: {
                userId_dealId: {
                    userId: user.id,
                    dealId: dealId
                }
            }
        });
        return !!existingSave;
    } catch (error) {
        return false;
    }
}

/**
 * Create a new deal (Merchant/Admin capability)
 */
export async function createDeal(dealData) {
    try {
        const user = await getCurrentUser();
        // In this MVP, any logged in Merchant or Admin can create a deal
        if (!user || !['MERCHANT', 'ADMIN'].includes(user.role)) {
            return { success: false, error: 'Unauthorized to create deals.' };
        }

        // Use the logged-in merchant's ID by default, or an explicitly provided one if Admin
        const merchantId = user.role === 'ADMIN' && dealData.merchantId ? dealData.merchantId : user.id;

        const newDeal = await prisma.deal.create({
            data: {
                title: dealData.title,
                description: dealData.description,
                discount: dealData.discount,
                category: dealData.category || 'other',
                image: dealData.image || null,
                originalPrice: dealData.originalPrice ? parseFloat(dealData.originalPrice) : null,
                discountPrice: dealData.discountPrice ? parseFloat(dealData.discountPrice) : null,
                currency: dealData.currency || 'EGP',
                expiresIn: dealData.expiresIn || 'Ongoing',
                promoCode: dealData.promoCode || `DEAL${Math.floor(Math.random() * 10000)}`,
                merchantId: merchantId,
            }
        });

        revalidatePath('/deals');
        return { success: true, deal: newDeal };
    } catch (error) {
        console.error('Error creating deal:', error);
        return { success: false, error: 'Failed to create deal' };
    }
}

/**
 * Redeem a deal (Student capability)
 */
export async function redeemDeal(dealId) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'STUDENT') {
            return { success: false, error: 'Only students can redeem deals.' };
        }

        const deal = await prisma.deal.findUnique({
            where: { id: dealId }
        });

        if (!deal) return { success: false, error: 'Deal not found.' };

        // Execute unified transaction logging
        const result = await prisma.$transaction(async (tx) => {
            const txnCode = `TXN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

            const transactionRecord = await tx.transaction.create({
                data: {
                    txnCode,
                    type: 'DEALS',
                    userId: user.id,
                    dealId: deal.id,
                    amount: deal.discountPrice || deal.originalPrice || 0,
                    currency: deal.currency,
                }
            });

            await tx.transactionHistory.create({
                data: {
                    transactionId: transactionRecord.id,
                    newStatus: 'CONFIRMED',
                    actorId: user.id,
                    reason: 'Student redeemed deal',
                }
            });

            return transactionRecord;
        });

        revalidatePath(`/deals/${dealId}`);
        return { success: true, transaction: result };
    } catch (error) {
        console.error('Error redeeming deal:', error);
        return { success: false, error: 'Failed to redeem deal.' };
    }
}
