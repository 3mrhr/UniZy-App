"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

/**
 * Fetches all data needed for the Student Home screen in one go.
 */
export async function getHomeOverview() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const userId = user.id;

        // Fetch user data including Wallet, Rewards, and Streak
        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallet: true,
                rewardAccount: true,
                dailyStreaks: true,
                _count: {
                    select: {
                        orders: { where: { status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'IN_TRANSIT'] } } },
                        serviceBookings: { where: { status: 'PENDING' } }
                    }
                }
            }
        });

        if (!dbUser) return { success: false, error: "User not found" };

        // Fetch the single most relevant "Live" activity
        const latestOrder = await prisma.order.findFirst({
            where: { userId, status: { notIn: ['DELIVERED', 'COMPLETED', 'CANCELLED'] } },
            orderBy: { updatedAt: 'desc' }
        });

        const latestBooking = await prisma.serviceBooking.findFirst({
            where: { userId, status: 'PENDING' },
            include: { provider: true },
            orderBy: { updatedAt: 'desc' }
        });

        return {
            success: true,
            data: {
                name: dbUser.name.split(' ')[0],
                walletBalance: dbUser.wallet?.balance || 0,
                rewardPoints: dbUser.rewardAccount?.currentBalance || 0,
                streak: dbUser.dailyStreaks?.[0]?.currentCount || 0,
                activeActivity: latestOrder ? {
                    type: 'ORDER',
                    title: `Order #${latestOrder.id.slice(0, 5)}`,
                    status: latestOrder.status,
                    time: 'Approaching'
                } : latestBooking ? {
                    type: 'BOOKING',
                    title: latestBooking.provider.name,
                    status: 'Confirmed',
                    time: `${latestBooking.date} ${latestBooking.timeSlot}`
                } : null
            }
        };

    } catch (error) {
        console.error("Failed to fetch home overview:", error);
        return { success: false, error: "Internal server error" };
    }
}
