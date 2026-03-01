'use server';

import { prisma } from '@/lib/prisma';

export async function globalSearch(query, filters = {}) {
    try {
        if (!query || query.trim().length < 2) {
            return { results: [], total: 0 };
        }

        const searchTerm = query.trim().toLowerCase();
        const { category, minPrice, maxPrice, sortBy } = filters;

        // Search Housing Listings
        const housingResults = await prisma.housingListing.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { title: { contains: searchTerm } },
                    { description: { contains: searchTerm } },
                    { location: { contains: searchTerm } },
                ],
                ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
                ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
            },
            include: { provider: { select: { name: true } } },
            take: 10,
        });

        // Search Deals
        const dealResults = await prisma.deal.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { title: { contains: searchTerm } },
                    { description: { contains: searchTerm } },
                    { category: { contains: searchTerm } },
                ],
            },
            include: { merchant: { select: { name: true } } },
            take: 10,
        });

        // Search Meals
        const mealResults = await prisma.meal.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { name: { contains: searchTerm } },
                    { description: { contains: searchTerm } },
                    { tags: { contains: searchTerm } },
                ],
            },
            include: { merchant: { select: { name: true } } },
            take: 10,
        });

        // Normalize and combine results
        const normalizedHousing = housingResults.map((h) => ({
            id: h.id,
            type: 'housing',
            title: h.title,
            subtitle: h.location,
            price: h.price,
            currency: 'EGP',
            image: JSON.parse(h.images || '[]')[0] || null,
            provider: h.provider?.name,
            url: `/housing/${h.id}`,
        }));

        const normalizedDeals = dealResults.map((d) => ({
            id: d.id,
            type: 'deal',
            title: d.title,
            subtitle: d.category,
            price: d.discountPrice || null,
            originalPrice: d.originalPrice || null,
            currency: d.currency,
            image: d.image,
            provider: d.merchant?.name,
            url: `/deals/${d.id}`,
        }));

        const normalizedMeals = mealResults.map((m) => ({
            id: m.id,
            type: 'meal',
            title: m.name,
            subtitle: m.tags,
            price: m.price,
            currency: m.currency,
            image: m.image,
            provider: m.merchant?.name,
            url: `/meals/${m.id}`,
        }));

        let allResults = [...normalizedHousing, ...normalizedDeals, ...normalizedMeals];

        // Category filter
        if (category && category !== 'all') {
            allResults = allResults.filter((r) => r.type === category);
        }

        // Sort
        if (sortBy === 'price_low') {
            allResults.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortBy === 'price_high') {
            allResults.sort((a, b) => (b.price || 0) - (a.price || 0));
        }

        return { results: allResults, total: allResults.length };
    } catch (error) {
        console.error('Search error:', error);
        return { results: [], total: 0, error: 'Search failed' };
    }
}
