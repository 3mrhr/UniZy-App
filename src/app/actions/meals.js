'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
                        phone: true,
                        merchantDetails: true // Assuming merchantDetails exists or handle gracefully
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
    // Basic validation and user checks would go here
    try {
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
                merchantId: data.merchantId, // Requires a valid merchant ID
            }
        });

        return { success: true, meal: newMeal };
    } catch (error) {
        console.error("Error creating meal:", error);
        return { success: false, error: "Failed to create meal" };
    }
}
