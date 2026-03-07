'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { computeCommissionSnapshot, computePricingSnapshot, generateTxnCode } from './financial';
import { createOrder } from './orders';

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

        let meals = await prisma.meal.findMany({
            where: whereClause,
            include: {
                merchant: {
                    select: {
                        name: true,
                        storeOpen: true
                    }
                }
            },
            orderBy: [
                { isPopular: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Relevance Scoring Logic
        if (searchQuery && searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase().trim();
            meals = meals.map(meal => {
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
            meals.sort((a, b) => b._score - a._score);
            // Filter out zero score matches if meaningful
            meals = meals.filter(m => m._score > 0);
        }

        return { success: true, meals };
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

        const newMeal = await prisma.meal.create({
            data: {
                name: data.name,
                arName: data.arName || null,
                description: data.description || null,
                price: parseFloat(data.price),
                currency: data.currency || 'EGP',
                image: data.image || null,
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
export async function orderMeal({ mealId, quantity = 1, notes = '' }) {
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

        // Construct standard order payload exactly as the delivery system expects
        const orderDetails = {
            vendorId: meal.merchantId,
            vendor: meal.merchant?.name || 'Local Kitchen',
            isMealPlan: true,
            notes: notes
        };

        const lineItems = [{
            mealId: meal.id,
            quantity: quantity,
            notes: notes
        }];

        // Delegate to the unified unified order creation pipeline to generate Order, OrderItem, and Transaction accurately
        const result = await createOrder('DELIVERY', orderDetails, 0, null, lineItems);

        if (result && result.success) {
            return { success: true, transaction: result.transaction, order: result.order };
        } else {
            return { success: false, error: result?.error || 'Failed to place meal order.' };
        }
    } catch (error) {
        console.error('Error ordering meal:', error);
        return { success: false, error: 'Failed to place meal order.' };
    }
}
