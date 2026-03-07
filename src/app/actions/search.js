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

        // Search Hub Posts
        const hubResults = await prisma.hubPost.findMany({
            where: {
                status: 'ACTIVE',
                content: { contains: searchTerm },
            },
            include: { author: { select: { name: true } } },
            take: 10,
        });

        // Search Roommate Requests
        const roommateResults = await prisma.roommateRequest.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { area: { contains: searchTerm } },
                    { notes: { contains: searchTerm } },
                ],
            },
            include: { user: { select: { name: true } } },
            take: 10,
        });

        // Scoring helper: Title matches are weighted higher than description matches
        const calculateRelevance = (item, term) => {
            let score = 0;
            const title = (item.title || item.name || item.content || item.area || '').toLowerCase();
            const desc = (item.description || item.notes || '').toLowerCase();

            if (title === term) score += 100;
            if (title.startsWith(term)) score += 50;
            if (title.includes(term)) score += 20;
            if (desc.includes(term)) score += 5;

            return score;
        };

        // Normalize and combine results with scores
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
            score: calculateRelevance(h, searchTerm)
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
            score: calculateRelevance(d, searchTerm)
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
            score: calculateRelevance(m, searchTerm)
        }));

        const normalizedHub = hubResults.map((p) => ({
            id: p.id,
            type: 'hub_post',
            title: p.content.substring(0, 50) + (p.content.length > 50 ? '...' : ''),
            subtitle: `Post by ${p.author.name}`,
            image: p.imageUrl,
            url: `/hub`,
            score: calculateRelevance(p, searchTerm)
        }));

        const normalizedRoommates = roommateResults.map((r) => ({
            id: r.id,
            type: 'roommate',
            title: `Roommate in ${r.area}`,
            subtitle: `${r.budget} EGP/mo • ${r.user.name}`,
            url: `/hub/roommate`,
            score: calculateRelevance(r, searchTerm)
        }));

        let allResults = [
            ...normalizedHousing,
            ...normalizedDeals,
            ...normalizedMeals,
            ...normalizedHub,
            ...normalizedRoommates
        ];

        // Sort by Score (Relevance) first, then Price if specified
        allResults.sort((a, b) => b.score - a.score);

        // Category filter
        if (category && category !== 'all') {
            allResults = allResults.filter((r) => r.type === category);
        }

        // Secondary Sort (Price)
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
