'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';

export async function getVerifiedMerchants(category = null) {
    try {
        // First try verified merchants, then fall back to all merchants
        let merchants = await prisma.user.findMany({
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

        // If no verified merchants found, include all merchants
        if (merchants.length === 0) {
            merchants = await prisma.user.findMany({
                where: { role: 'MERCHANT' },
                select: {
                    id: true,
                    name: true,
                    profileImage: true,
                    rating: true,
                    meals: {
                        select: { id: true, name: true, price: true, currency: true, image: true, rating: true, isPopular: true, tags: true },
                        take: 5
                    },
                    deals: {
                        select: { id: true, title: true, discountPrice: true, currency: true, image: true, rating: true },
                        take: 2
                    }
                },
                take: 20
            });
        }

        // Add some fallback fields or computed UI properties 
        const formatted = merchants.map(m => ({
            ...m,
            time: '20-30 min',
            tag: m.meals.length > 3 ? 'Bestseller' : 'New',
            rating: m.meals.length > 0 ? m.meals.reduce((sum, meal) => sum + meal.rating, 0) / m.meals.length : 5.0
        }));

        if (category) {
            // Simplified category matching logic mapping the UI filter to meals' tags
            const tagMap = {
                fastfood: ['fastfood', 'burger', 'pizza', 'fries'],
                healthy: ['healthy', 'salad', 'vegan', 'organic'],
                dessert: ['dessert', 'sweet', 'cake', 'chocolate'],
                groceries: ['grocery', 'mart', 'store'],
                drinks: ['drink', 'coffee', 'tea', 'juice', 'beverage']
            };
            const tags = tagMap[category] || [];
            const filtered = formatted.filter(m =>
                m.meals.some(meal => tags.some(t => (meal.tags || '').toLowerCase().includes(t))) ||
                tags.some(t => m.name.toLowerCase().includes(t))
            );
            return { success: true, data: filtered };
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
