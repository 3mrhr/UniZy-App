'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { computeCommissionSnapshot, computePricingSnapshot, generateTxnCode } from './financial';

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

        const meals = await prisma.meal.findMany({
            where: whereClause,
            include: {
                merchant: {
                    select: {
                        name: true,
                    }
                }
            },
            orderBy: [
                { isPopular: 'desc' },
                { createdAt: 'desc' }
            ]
        });

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
        const user = await getCurrentUser(); // Assumes auth.js exists
        if (!user || user.role !== 'STUDENT') {
            return { success: false, error: 'Only students can order meals.' };
        }

        const meal = await prisma.meal.findUnique({
            where: { id: mealId }
        });

        if (!meal) return { success: false, error: 'Meal not found.' };
        if (meal.status !== 'ACTIVE') return { success: false, error: 'Meal is currently unavailable.' };

        // Calculate total 
        const totalAmount = meal.price * quantity;

        // Compute financial snapshots before transaction
        const commSnap = await computeCommissionSnapshot('MEALS', 'MERCHANT', totalAmount);
        const priceSnap = await computePricingSnapshot('MEALS');

        // Execute unified transaction logging with frozen snapshots
        const result = await prisma.$transaction(async (tx) => {
            const txnCode = generateTxnCode();

            const transactionRecord = await tx.transaction.create({
                data: {
                    txnCode,
                    type: 'MEALS',
                    userId: user.id,
                    providerId: meal.merchantId,
                    mealId: meal.id,
                    amount: totalAmount,
                    currency: meal.currency,
                    notes: `Qty: ${quantity}. ${notes}`.trim(),
                    // Frozen pricing snapshot
                    basePriceSnapshot: priceSnap.basePriceSnapshot,
                    feeComponentsSnapshot: priceSnap.feeComponentsSnapshot,
                    zoneSnapshot: priceSnap.zoneSnapshot,
                    pricingRuleId: priceSnap.pricingRuleId,
                    // Frozen commission snapshot
                    commissionRuleId: commSnap.commissionRuleId,
                    unizyCommissionAmount: commSnap.unizyCommissionAmount,
                    providerNetAmount: commSnap.providerNetAmount,
                    promoSubsidyAmount: commSnap.promoSubsidyAmount,
                }
            });

            await tx.transactionHistory.create({
                data: {
                    transactionId: transactionRecord.id,
                    newStatus: 'PENDING',
                    actorId: user.id,
                    reason: 'Student placed meal order',
                }
            });

            return transactionRecord;
        });

        return { success: true, transaction: result };
    } catch (error) {
        console.error('Error ordering meal:', error);
        return { success: false, error: 'Failed to place meal order.' };
    }
}
