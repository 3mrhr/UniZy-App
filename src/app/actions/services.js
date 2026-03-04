'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';
import { validatePromoCode } from './promotions';
import { createNotification } from './notifications';
import { computeCommissionSnapshot, computePricingSnapshot, generateTxnCode } from './financial';

const SERVICE_CATEGORIES = [
    { id: 'PLUMBER', label: 'Plumber', icon: '🔧' },
    { id: 'ELECTRICIAN', label: 'Electrician', icon: '⚡' },
    { id: 'CARPENTER', label: 'Carpenter', icon: '🪚' },
    { id: 'AC_TECH', label: 'AC Technician', icon: '❄️' },
    { id: 'PAINTER', label: 'Painter', icon: '🎨' },
    { id: 'GENERAL', label: 'General', icon: '🛠️' },
];

// Note: SERVICE_CATEGORIES is NOT exported because 'use server' files can only export async functions
// Categories are defined directly in the client component (services/page.js)

export async function listProviders({ category } = {}) {
    const DEMO_PROVIDERS = [
        { id: 'demo-1', name: 'Hassan Ibrahim', phone: '01012345678', category: 'PLUMBER', description: 'Expert in all plumbing repairs. 10+ years experience.', priceRange: '150-400 EGP', rating: 4.8, reviewCount: 32, available: true, verified: true, location: 'Assiut' },
        { id: 'demo-2', name: 'Mohamed Sayed', phone: '01098765432', category: 'ELECTRICIAN', description: 'Certified electrician. Wiring, installations, and repairs.', priceRange: '200-500 EGP', rating: 4.6, reviewCount: 28, available: true, verified: true, location: 'Assiut' },
        { id: 'demo-3', name: 'Ahmed Farouk', phone: '01234567890', category: 'CARPENTER', description: 'Custom furniture, door repairs, and woodwork.', priceRange: '300-800 EGP', rating: 4.9, reviewCount: 45, available: true, verified: true, location: 'Assiut' },
        { id: 'demo-4', name: 'Khaled Nasser', phone: '01112233445', category: 'AC_TECH', description: 'AC installation, maintenance, and gas refill.', priceRange: '250-600 EGP', rating: 4.7, reviewCount: 19, available: true, verified: true, location: 'Assiut' },
        { id: 'demo-5', name: 'Omar Tarek', phone: '01556677889', category: 'PAINTER', description: 'Interior and exterior painting. Clean and professional.', priceRange: '200-500 EGP', rating: 4.5, reviewCount: 22, available: true, verified: true, location: 'Assiut' },
        { id: 'demo-6', name: 'Ali Mostafa', phone: '01009988776', category: 'GENERAL', description: 'General maintenance and handyman services.', priceRange: '100-300 EGP', rating: 4.4, reviewCount: 15, available: true, verified: true, location: 'Assiut' },
    ];

    const filterDemo = (cat) => {
        if (!cat || cat === 'all') return DEMO_PROVIDERS;
        return DEMO_PROVIDERS.filter(p => p.category === cat);
    };

    try {
        const where = { verified: true, available: true };
        if (category && category !== 'all') where.category = category;

        const providers = await prisma.serviceProvider.findMany({
            where,
            orderBy: { rating: 'desc' },
        });

        // If no providers in DB, return filtered demo data
        if (providers.length === 0) {
            return { providers: filterDemo(category) };
        }

        return { providers };
    } catch (error) {
        console.error('List providers error:', error);
        // On any DB error, return demo data so page always works
        return { providers: filterDemo(category) };
    }
}

export async function bookService({ providerId, date, timeSlot, notes, promoCodeStr }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        // Pre-validate promo code outside transaction if present
        let validPromo = null;
        if (promoCodeStr) {
            const promoRes = await validatePromoCode(promoCodeStr, 'SERVICES');
            if (!promoRes.success || !promoRes.promo) {
                return { error: promoRes.error || 'Invalid promo code' };
            }
            validPromo = promoRes.promo;
        }

        // Wrap in a transaction to ensure both records are created
        const result = await prisma.$transaction(async (tx) => {
            const booking = await tx.serviceBooking.create({
                data: {
                    userId: user.id,
                    providerId,
                    date,
                    timeSlot,
                    notes: notes || null,
                }
            });

            // Calculate cost or fetch from package (using 100 for demo to show discount)
            let amount = 100;
            let promoCodeId = null;

            if (validPromo) {
                promoCodeId = validPromo.id;
                if (validPromo.discountType === 'PERCENTAGE') {
                    amount = amount - (amount * (validPromo.discountAmount / 100));
                } else {
                    amount = Math.max(0, amount - validPromo.discountAmount);
                }
                await tx.promoCode.update({
                    where: { id: promoCodeId },
                    data: { currentUses: { increment: 1 } }
                });
            }

            // Compute financial snapshots
            const promoDiscount = validPromo ? (100 - amount) : 0;
            const commSnap = await computeCommissionSnapshot('SERVICE', 'PROVIDER', amount, promoDiscount);
            const priceSnap = await computePricingSnapshot('SERVICES');

            // Create unified transaction record with frozen snapshots
            const txnCode = generateTxnCode();

            const transactionRecord = await tx.transaction.create({
                data: {
                    txnCode,
                    type: 'SERVICE',
                    userId: user.id,
                    providerId: providerId,
                    serviceBookingId: booking.id,
                    amount,
                    promoCodeId,
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

            // Log initial history state
            await tx.transactionHistory.create({
                data: {
                    transactionId: transactionRecord.id,
                    newStatus: 'PENDING',
                    actorId: user.id,
                    reason: 'Initial Booking',
                }
            });

            // Notify user
            await tx.notification.create({
                data: {
                    userId: user.id,
                    title: 'Service Booked',
                    message: `Your booking for ${date} at ${timeSlot} is confirmed.`,
                    type: 'SYSTEM'
                }
            });

            return booking;
        });

        return { success: true, booking: result };
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
        if (!user || !user.role?.startsWith('ADMIN_')) return { error: 'Not authorized' };

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
        const user = await getCurrentUser();
        if (!user || !user.role?.startsWith('ADMIN_')) {
            return { error: 'Not authorized' };
        }

        const provider = await prisma.serviceProvider.update({
            where: { id: providerId },
            data: { verified: true },
        });

        if (provider.userId) {
            await createNotification(provider.userId, 'Provider Verified', 'Your service provider account has been approved!', 'SYSTEM');
        }

        await logAdminAction('VERIFY_PROVIDER', 'SERVICES', providerId, { action: 'Admin verified service provider' });

        return { success: true };
    } catch (error) {
        return { error: 'Failed to approve provider.' };
    }
}

export async function rejectProvider(providerId) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.role?.startsWith('ADMIN_')) {
            return { error: 'Not authorized' };
        }

        // Just delete the provider for now if rejected, or mark as rejected if we add a status field.
        // Currently ServiceProvider only has verified boolean. We will delete it.
        const provider = await prisma.serviceProvider.delete({
            where: { id: providerId }
        });

        if (provider.userId) {
            await createNotification(provider.userId, 'Provider Application Rejected', 'Your service provider application was declined.', 'SYSTEM');
        }

        await logAdminAction('REJECT_PROVIDER', 'SERVICES', providerId, { action: 'Admin rejected service provider' });

        return { success: true };
    } catch (error) {
        console.error('rejectProvider error:', error);
        return { error: 'Failed to reject provider.' };
    }
}

// ADMIN FUNCTION: Fetch all ServiceBookings for dashboard management
export async function getAdminServiceBookings() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.startsWith('ADMIN_')) return { error: 'Not authorized' };

        const bookings = await prisma.serviceBooking.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, phone: true } },
                provider: { select: { name: true, phone: true, category: true } }
            }
        });

        const stats = {
            totalBookings: bookings.length,
            pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
            completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
            activeProviders: await prisma.serviceProvider.count({ where: { verified: true } }),
        };

        return { success: true, recentBookings: bookings, stats };
    } catch (error) {
        console.error('getAdminServiceBookings error:', error);
        return { success: false, error: 'Failed to fetch bookings.' };
    }
}

// ADMIN FUNCTION: Update ServiceBooking Status
export async function updateServiceBookingStatus(bookingId, status) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.startsWith('ADMIN_')) return { error: 'Not authorized' };

        const updated = await prisma.serviceBooking.update({
            where: { id: bookingId },
            data: { status },
            include: { user: { select: { id: true } } }
        });

        await logAdminAction('UPDATE_SERVICE_BOOKING', 'SERVICES', bookingId, { newStatus: status });

        // Notify the student regarding the progression of their request
        if (updated.user?.id) {
            await createNotification(updated.user.id, 'Service Booking Update', `Your service booking is now ${status}.`, 'SYSTEM', `/activity`);
        }

        return { success: true, booking: updated };
    } catch (error) {
        console.error('updateServiceBookingStatus error:', error);
        return { success: false, error: 'Failed to update booking status.' };
    }
}
