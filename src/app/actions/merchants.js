'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';

export async function getVerifiedMerchants(category = null) {
    try {
        const merchants = await prisma.user.findMany({
            where: {
                role: 'MERCHANT',
                isVerified: true
            },
            select: {
                id: true,
                name: true,
                profileImage: true,
                rating: true,
                meals: {
                    where: { status: 'ACTIVE' },
                    select: { id: true, name: true, price: true, currency: true, image: true, rating: true, isPopular: true, tags: true },
                    take: 5
                },
                deals: {
                    where: { status: 'ACTIVE' },
                    select: { id: true, title: true, discountPrice: true, currency: true, image: true, rating: true },
                    take: 2
                }
            },
            take: 20
        });

        // Add some fallback fields or computed UI properties 
        const formatted = merchants.map(m => ({
            ...m,
            time: '20-30 min',
            tag: m.meals.length > 3 ? 'Bestseller' : 'New',
            rating: m.meals.reduce((sum, meal) => sum + meal.rating, 5.0) / (m.meals.length || 1) // Simple average
        }));

        if (category) {
            // Simplified category matching logic mapping the UI filter to meals' tags
            if (category === 'fastfood') return { success: true, data: formatted.filter(m => m.meals.some(meal => meal.tags.includes('fastfood') || meal.tags.includes('burger'))) };
            if (category === 'healthy') return { success: true, data: formatted.filter(m => m.meals.some(meal => meal.tags.includes('healthy') || meal.tags.includes('salad'))) };
            if (category === 'dessert') return { success: true, data: formatted.filter(m => m.meals.some(meal => meal.tags.includes('dessert') || meal.tags.includes('sweet'))) };
            if (category === 'groceries') return { success: true, data: formatted.filter(m => m.name.toLowerCase().includes('mart') || m.name.toLowerCase().includes('grocery')) };
            if (category === 'drinks') return { success: true, data: formatted.filter(m => m.meals.some(meal => meal.tags.includes('drink') || meal.tags.includes('coffee'))) };
        }

        return { success: true, data: formatted };
    } catch (error) {
        console.error('Failed to get merchants:', error);
        return { success: false, error: 'Failed to fetch verified merchants.' };
    }
}

export async function getMerchantDetails(merchantId) {
    try {
        const merchant = await prisma.user.findUnique({
            where: {
                id: merchantId,
                role: 'MERCHANT'
            },
            select: {
                id: true,
                name: true,
                profileImage: true,
                phone: true,
                meals: {
                    where: { status: 'ACTIVE' }
                },
                deals: {
                    where: { status: 'ACTIVE' }
                }
            }
        });

        if (!merchant) return { success: false, error: 'Merchant not found.' };

        return { success: true, data: merchant };
    } catch (error) {
        console.error('Failed to get merchant details:', error);
        return { success: false, error: 'Failed to fetch merchant details.' };
    }
}
