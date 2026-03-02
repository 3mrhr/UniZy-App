'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

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

        const booking = await prisma.cleaningBooking.create({
            data: {
                userId: user.id,
                packageId,
                date,
                timeSlot,
                address,
                notes: notes || null,
            }
        });

        return { success: true, booking };
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
