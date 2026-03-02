'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

const SERVICE_CATEGORIES = [
    { id: 'PLUMBER', label: 'Plumber', icon: '🔧' },
    { id: 'ELECTRICIAN', label: 'Electrician', icon: '⚡' },
    { id: 'CARPENTER', label: 'Carpenter', icon: '🪚' },
    { id: 'AC_TECH', label: 'AC Technician', icon: '❄️' },
    { id: 'PAINTER', label: 'Painter', icon: '🎨' },
    { id: 'GENERAL', label: 'General', icon: '🛠️' },
];

export { SERVICE_CATEGORIES };

export async function listProviders({ category } = {}) {
    try {
        const where = { verified: true, available: true };
        if (category && category !== 'all') where.category = category;

        const providers = await prisma.serviceProvider.findMany({
            where,
            orderBy: { rating: 'desc' },
        });

        // If no providers in DB, return seed data
        if (providers.length === 0) {
            return {
                providers: [
                    { id: 'demo-1', name: 'Hassan Ibrahim', phone: '01012345678', category: 'PLUMBER', description: 'Expert in all plumbing repairs. 10+ years experience.', priceRange: '150-400 EGP', rating: 4.8, reviewCount: 32, available: true, verified: true, location: 'Assiut' },
                    { id: 'demo-2', name: 'Mohamed Sayed', phone: '01098765432', category: 'ELECTRICIAN', description: 'Certified electrician. Wiring, installations, and repairs.', priceRange: '200-500 EGP', rating: 4.6, reviewCount: 28, available: true, verified: true, location: 'Assiut' },
                    { id: 'demo-3', name: 'Ahmed Farouk', phone: '01234567890', category: 'CARPENTER', description: 'Custom furniture, door repairs, and woodwork.', priceRange: '300-800 EGP', rating: 4.9, reviewCount: 45, available: true, verified: true, location: 'Assiut' },
                    { id: 'demo-4', name: 'Khaled Nasser', phone: '01112233445', category: 'AC_TECH', description: 'AC installation, maintenance, and gas refill.', priceRange: '250-600 EGP', rating: 4.7, reviewCount: 19, available: true, verified: true, location: 'Assiut' },
                    { id: 'demo-5', name: 'Omar Tarek', phone: '01556677889', category: 'PAINTER', description: 'Interior and exterior painting. Clean and professional.', priceRange: '200-500 EGP', rating: 4.5, reviewCount: 22, available: true, verified: true, location: 'Assiut' },
                    { id: 'demo-6', name: 'Ali Mostafa', phone: '01009988776', category: 'GENERAL', description: 'General maintenance and handyman services.', priceRange: '100-300 EGP', rating: 4.4, reviewCount: 15, available: true, verified: true, location: 'Assiut' },
                ]
            };
        }

        return { providers };
    } catch (error) {
        console.error('List providers error:', error);
        return { providers: [] };
    }
}

export async function bookService({ providerId, date, timeSlot, notes }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const booking = await prisma.serviceBooking.create({
            data: {
                userId: user.id,
                providerId,
                date,
                timeSlot,
                notes: notes || null,
            }
        });

        return { success: true, booking };
    } catch (error) {
        console.error('Book service error:', error);
        return { error: 'Failed to book service.' };
    }
}

export async function getMyBookings() {
    try {
        const user = await getCurrentUser();
        if (!user) return { bookings: [] };

        const bookings = await prisma.serviceBooking.findMany({
            where: { userId: user.id },
            include: { provider: true },
            orderBy: { createdAt: 'desc' },
        });

        return { bookings };
    } catch (error) {
        console.error('Get bookings error:', error);
        return { bookings: [] };
    }
}

export async function rateProvider(bookingId, rating, review) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const booking = await prisma.serviceBooking.update({
            where: { id: bookingId },
            data: { rating, review, status: 'COMPLETED' },
        });

        // Update provider average rating
        const providerBookings = await prisma.serviceBooking.findMany({
            where: { providerId: booking.providerId, rating: { not: null } },
        });
        const avgRating = providerBookings.reduce((sum, b) => sum + b.rating, 0) / providerBookings.length;
        await prisma.serviceProvider.update({
            where: { id: booking.providerId },
            data: { rating: avgRating, reviewCount: providerBookings.length },
        });

        return { success: true };
    } catch (error) {
        console.error('Rate provider error:', error);
        return { error: 'Failed to rate provider.' };
    }
}

export async function getAdminProviders() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.role?.includes('ADMIN')) return { error: 'Not authorized' };

        const providers = await prisma.serviceProvider.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { bookings: true } } },
        });

        const stats = {
            total: providers.length,
            verified: providers.filter(p => p.verified).length,
            pending: providers.filter(p => !p.verified).length,
        };

        return { providers, stats };
    } catch (error) {
        console.error('Admin providers error:', error);
        return { providers: [], stats: {} };
    }
}

export async function approveProvider(providerId) {
    try {
        await prisma.serviceProvider.update({
            where: { id: providerId },
            data: { verified: true },
        });
        return { success: true };
    } catch (error) {
        return { error: 'Failed to approve provider.' };
    }
}
