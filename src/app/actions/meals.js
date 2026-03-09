'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { computeCommissionSnapshot, computePricingSnapshot, generateTxnCode } from './financial';
import { createOrder } from './orders';

import { computeMerchantScore } from './trust-scoring';
import { uploadImage } from './upload';

// Fetch active meals, optionally filtered by category (tags) or search text
export async function getActiveMeals(category = null, searchQuery = '') {
    try {
        let whereClause = {
            status: 'ACTIVE'
        };

        const AND_clauses = [];

        if (category && category !== 'all') {
            AND_clauses.push({
                tags: {
                    contains: category
                }
            });
        }

        if (searchQuery && searchQuery.trim() !== '') {
            AND_clauses.push({
                OR: [
                    { name: { contains: searchQuery } },
                    { arName: { contains: searchQuery } },
                    { description: { contains: searchQuery } },
                    { merchant: { name: { contains: searchQuery } } } // Search by merchant name
                ]
            });
        }

        if (AND_clauses.length > 0) {
            whereClause.AND = AND_clauses;
        }

        // Only show meals from open merchants
        whereClause.merchant = {
            ...whereClause.merchant,
            storeOpen: true
        };

        let rawMeals = await prisma.meal.findMany({
            where: whereClause,
            include: {
                merchant: {
                    select: {
                        id: true,
                        name: true,
                        storeOpen: true
                    }
                },
                variantGroups: {
                    include: { options: true }
                },
                addonGroups: {
                    include: { options: true }
                }
            },
            orderBy: [
                { isPopular: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Inject Trust Scores for Merchants
        const meals = await Promise.all(rawMeals.map(async (meal) => {
            const trustResult = await computeMerchantScore(meal.merchantId);
            return {
                ...meal,
                merchant: {
                    ...meal.merchant,
                    trustScore: trustResult.success ? trustResult.score : 0
                }
            };
        }));

        // Relevance Scoring Logic
        let processedMeals = meals;
        if (searchQuery && searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            processedMeals = meals.map(meal => {
                let score = 0;
                const name = meal.name.toLowerCase();
                const arName = (meal.arName || '').toLowerCase();
                const desc = (meal.description || '').toLowerCase();
                const merchantName = (meal.merchant?.name || '').toLowerCase();

                // Exact title match (highest)
                if (name === query || arName === query) score += 100;
                // Title starts with query
                else if (name.startsWith(query) || arName.startsWith(query)) score += 50;
                // Title contains query
                else if (name.includes(query) || arName.includes(query)) score += 30;

                // Merchant name match
                if (merchantName.includes(query)) score += 20;

                // Description match
                if (desc.includes(query)) score += 10;

                return { ...meal, _score: score };
            });

            // Re-sort by score
            processedMeals.sort((a, b) => b._score - a._score);
            // Filter out zero score matches if meaningful
            processedMeals = processedMeals.filter(m => m._score > 0);
        }

        return { success: true, meals: processedMeals };
    } catch (error) {
        console.error("Error fetching active meals:", error);
        return { success: false, error: "Failed to fetch meals" };
    }
}

// Fetch a single meal by ID
export async function getMealById(id) {
    try {
        const meal = await prisma.meal.findUnique({
            where: { id },
            include: {
                merchant: {
                    select: {
                        name: true,
                        phone: true
                    }
                },
                variantGroups: {
                    include: { options: true }
                },
                addonGroups: {
                    include: { options: true }
                }
            }
        });

        if (!meal) return { success: false, error: "Meal not found" };

        return { success: true, meal };
    } catch (error) {
        console.error("Error fetching meal:", error);
        return { success: false, error: "Failed to fetch meal details" };
    }
}

// Admin/Merchant: Create a new meal (basic scaffold for now, can be expanded)
export async function createMeal(data) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || (!['MERCHANT', 'ADMIN_SUPER'].includes(currentUser.role))) {
            return { success: false, error: 'Unauthorized. Only Merchants and Super Admins can create meals.' };
        }

        let merchantId = data.merchantId;
        if (currentUser.role === 'MERCHANT') {
            merchantId = currentUser.id;
        }

        let imageUrl = data.image || null;
        if (imageUrl && (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:'))) {
            const uploadRes = await uploadImage(imageUrl, { folder: 'unizy/meals' });
            if (uploadRes.success) {
                imageUrl = uploadRes.url;
            }
        }

        const newMeal = await prisma.meal.create({
            data: {
                name: data.name,
                arName: data.arName || null,
                description: data.description || null,
                price: parseFloat(data.price),
                currency: data.currency || 'EGP',
                image: imageUrl,
                calories: data.calories || null,
                prepTime: data.prepTime || null,
                tags: data.tags || 'daily',
                merchantId: merchantId,
            }
        });

        return { success: true, meal: newMeal };
    } catch (error) {
        console.error("Error creating meal:", error);
        return { success: false, error: "Failed to create meal" };
    }
}

// Student: Order a Meal
export async function orderMeal({ mealId, quantity = 1, notes = '', variants = [], addons = [], useCredits = false }) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'STUDENT') {
            return { success: false, error: 'Only students can order meals.' };
        }

        const meal = await prisma.meal.findUnique({
            where: { id: mealId },
            include: { merchant: true }
        });

        if (!meal) return { success: false, error: 'Meal not found.' };
        if (meal.status !== 'ACTIVE') return { success: false, error: 'Meal is currently unavailable.' };

        // Handle Subscription Credit Redemption
        let redemptionResult = null;
        if (useCredits) {
            const sub = await prisma.mealSubscription.findFirst({
                where: {
                    userId: user.id,
                    status: 'ACTIVE',
                    remainingCredits: { gte: quantity },
                    nextBillingDate: { gte: new Date() }
                }
            });

            if (!sub) {
                return { success: false, error: 'No active subscription or insufficient credits.' };
            }

            // Perform atomic decrement
            await prisma.mealSubscription.update({
                where: { id: sub.id },
                data: { remainingCredits: { decrement: quantity } }
            });
            redemptionResult = { usedCredits: true, subId: sub.id };
        }

        // Construct standard order payload exactly as the delivery system expects
        const orderDetails = {
            vendorId: meal.merchantId,
            vendor: meal.merchant?.name || 'Local Kitchen',
            isMealPlan: true,
            notes: notes,
            usedCredits: redemptionResult?.usedCredits || false
        };

        const lineItems = [{
            mealId: meal.id,
            quantity: quantity,
            notes: notes,
            variants: variants,
            addons: addons
        }];

        // If credits were used, clientTotal is 0 (handled securely in createOrder)
        const clientTotal = redemptionResult?.usedCredits ? 0 : 0; // The second 0 is for createOrder to re-calculate

        const result = await createOrder('DELIVERY', orderDetails, clientTotal, null, lineItems);

        if (result && result.success) {
            return { success: true, transaction: result.transaction, order: result.order };
        } else {
            // Revert credits if order fails
            if (redemptionResult?.usedCredits) {
                await prisma.mealSubscription.update({
                    where: { id: redemptionResult.subId },
                    data: { remainingCredits: { increment: quantity } }
                });
            }
            return { success: false, error: result?.error || 'Failed to place meal order.' };
        }
    } catch (error) {
        console.error('Error ordering meal:', error);
        return { success: false, error: 'Failed to place meal order.' };
    }
}

// Subscription Actions
export async function getMealPlans() {
    try {
        const plans = await prisma.mealPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
        return { success: true, plans };
    } catch (error) {
        return { success: false, error: "Failed to fetch plans" };
    }
}

export async function purchaseSubscription(planId) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const plan = await prisma.mealPlan.findUnique({ where: { id: planId } });
        if (!plan) return { success: false, error: "Plan not found" };

        // Create transaction of type SUBSCRIPTION
        const txnCode = generateTxnCode();
        const nextBilling = new Date();
        if (plan.frequency === 'WEEKLY') nextBilling.setDate(nextBilling.getDate() + 7);
        else nextBilling.setDate(nextBilling.getDate() + 30);

        const sub = await prisma.$transaction(async (tx) => {
            // Check for existing active sub to cancel/replace
            await tx.mealSubscription.updateMany({
                where: { userId: user.id, status: 'ACTIVE' },
                data: { status: 'CANCELLED' }
            });

            return await tx.mealSubscription.create({
                data: {
                    userId: user.id,
                    planId: plan.id,
                    status: 'ACTIVE',
                    remainingCredits: plan.credits,
                    nextBillingDate: nextBilling
                }
            });
        });

        return { success: true, subscription: sub };
    } catch (error) {
        console.error("Purchase failed:", error);
        return { success: false, error: "Failed to purchase subscription" };
    }
}

export async function getActiveSubscription() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false };

        const sub = await prisma.mealSubscription.findFirst({
            where: {
                userId: user.id,
                status: 'ACTIVE',
                nextBillingDate: { gte: new Date() }
            },
            include: { plan: true }
        });

        return { success: true, subscription: sub };
    } catch (error) {
        return { success: false };
    }
}
