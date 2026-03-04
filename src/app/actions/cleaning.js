'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { computeCommissionSnapshot, computePricingSnapshot, generateTxnCode } from './financial';

export async function listPackages() {
    try {
        const packages = await prisma.cleaningPackage.findMany({
            where: { active: true },
            orderBy: { price: 'asc' },
        });

        if (packages.length === 0) {
            return {
                packages: [
                    { id: 'demo-1', name: 'Standard Clean', description: 'Basic cleaning of all rooms, bathroom, and kitchen.', price: 200, duration: '2-3 hours', frequency: 'ONE_TIME', includes: '["Sweeping & mopping","Bathroom cleaning","Kitchen wipe-down","Trash removal"]' },
                    { id: 'demo-2', name: 'Deep Clean', description: 'Thorough deep cleaning including behind furniture, windows, and appliances.', price: 400, duration: '4-5 hours', frequency: 'ONE_TIME', includes: '["Everything in Standard","Window cleaning","Behind furniture","Appliance cleaning","Carpet deep clean"]' },
                    { id: 'demo-3', name: 'Weekly Standard', description: 'Weekly standard cleaning subscription. Best value for ongoing maintenance.', price: 150, duration: '2 hours', frequency: 'WEEKLY', includes: '["Sweeping & mopping","Bathroom cleaning","Kitchen wipe-down","Trash removal","Bed making"]' },
                    { id: 'demo-4', name: 'Move-in / Move-out', description: 'Complete cleaning for when you move in or leave your apartment.', price: 500, duration: '5-6 hours', frequency: 'ONE_TIME', includes: '["Full deep clean","Wall washing","Cabinet interiors","Oven & fridge cleaning","Window tracks"]' },
                ]
            };
        }

        return { packages };
    } catch (error) {
        console.error('List packages error:', error);
        return { packages: [] };
    }
}

export async function bookCleaning({ packageId, date, timeSlot, address, notes }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        // Fetch package to get the correct price
        const pkg = await prisma.cleaningPackage.findUnique({ where: { id: packageId } });
        if (!pkg) return { error: 'Cleaning package not found' };

        const result = await prisma.$transaction(async (tx) => {
            const booking = await tx.cleaningBooking.create({
                data: {
                    userId: user.id,
                    packageId,
                    date,
                    timeSlot,
                    address,
                    notes: notes || null,
                }
            });

            // Compute financial snapshots
            const commSnap = await computeCommissionSnapshot('CLEANING', 'CLEANER', pkg.price);
            const priceSnap = await computePricingSnapshot('CLEANING');

            // Create unified transaction record with frozen snapshots
            const txnCode = generateTxnCode();

            const transactionRecord = await tx.transaction.create({
                data: {
                    txnCode,
                    type: 'CLEANING',
                    userId: user.id,
                    cleaningBookingId: booking.id,
                    amount: pkg.price,
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
                    reason: 'Initial Cleaning Booking',
                }
            });

            return booking;
        });

        return { success: true, booking: result };
    } catch (error) {
        console.error('Book cleaning error:', error);
        return { error: 'Failed to book cleaning.' };
    }
}

export async function getCleaningBookings() {
    try {
        const user = await getCurrentUser();
        if (!user) return { bookings: [] };

        const bookings = await prisma.cleaningBooking.findMany({
            where: { userId: user.id },
            include: { package: true },
            orderBy: { createdAt: 'desc' },
        });

        return { bookings };
    } catch (error) {
        return { bookings: [] };
    }
}

export async function getAdminCleaningStats() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.role?.includes('ADMIN')) return { error: 'Not authorized' };

        const stats = {
            totalBookings: await prisma.cleaningBooking.count(),
            pendingBookings: await prisma.cleaningBooking.count({ where: { status: 'PENDING' } }),
            completedBookings: await prisma.cleaningBooking.count({ where: { status: 'COMPLETED' } }),
            activePackages: await prisma.cleaningPackage.count({ where: { active: true } }),
        };

        const recentBookings = await prisma.cleaningBooking.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { user: { select: { name: true, email: true } }, package: true },
        });

        return { stats, recentBookings };
    } catch (error) {
        return { stats: {}, recentBookings: [] };
    }
}

export async function updateCleaningBookingStatus(bookingId, status) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.role?.includes('ADMIN') && user.role !== 'SUPER_ADMIN')) {
            return { error: 'Not authorized' };
        }

        const booking = await prisma.cleaningBooking.update({
            where: { id: bookingId },
            data: { status }
        });

        return { success: true, booking };
    } catch (e) {
        console.error(e);
        return { error: 'Failed to update booking status' };
    }
}
