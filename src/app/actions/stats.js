"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";

/**
 * Get real admin dashboard stats from the database.
 * Replaces all hardcoded mock numbers with actual queries.
 */
export async function getAdminDashboardStats() {
  try {
    const user = await getCurrentUser();
    if (
      !user ||
      (!user.role?.startsWith("ADMIN_") && user.role !== "ADMIN_SUPER")
    ) {
      return { error: "Unauthorized" };
    }

    // Run all queries grouped by fields to optimize parallel DB load
    const [
      userStats,
      orderStats,
      txStats,
      refundStats,
      ticketStats,
      housingStats,
      activeDealsCount,
      activeMealsCount,
      dispatchStats,
      slaStats,
      verificationStats,
    ] = await Promise.all([
      prisma.user.groupBy({ by: ["role"], _count: true }),
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.transaction.aggregate({
        _count: true,
        _sum: { amount: true, unizyCommissionAmount: true },
      }),
      prisma.refund.groupBy({ by: ["status"], _count: true }),
      prisma.supportTicket.groupBy({ by: ["status"], _count: true }),
      prisma.housingListing.groupBy({ by: ["status"], _count: true }),
      prisma.deal.count({ where: { status: "ACTIVE" } }),
      prisma.meal.count({ where: { status: "ACTIVE" } }),
      prisma.dispatch.groupBy({ by: ["status"], _count: true }),
      prisma.sLABreach.groupBy({ by: ["status"], _count: true }),
      prisma.verificationDocument.groupBy({ by: ["status"], _count: true }),
    ]);

    return {
      success: true,
      stats: {
        // Users
        totalUsers: userStats.reduce((acc, curr) => acc + curr._count, 0),
        totalStudents: userStats.find((s) => s.role === "STUDENT")?._count || 0,
        totalDrivers: userStats.find((s) => s.role === "DRIVER")?._count || 0,
        totalMerchants:
          userStats.find((s) => s.role === "MERCHANT")?._count || 0,
        totalProviders:
          userStats.find((s) => s.role === "PROVIDER")?._count || 0,
        // Orders & Transactions
        totalOrders: orderStats.reduce((acc, curr) => acc + curr._count, 0),
        pendingOrders:
          orderStats.find((s) => s.status === "PENDING")?._count || 0,
        completedOrders:
          orderStats.find((s) => s.status === "COMPLETED")?._count || 0,
        cancelledOrders:
          orderStats.find((s) => s.status === "CANCELLED")?._count || 0,
        totalTransactions: txStats._count,
        // Revenue (from real data)
        totalRevenue: txStats._sum.amount || 0,
        totalCommission: txStats._sum.unizyCommissionAmount || 0,
        // Refunds
        totalRefunds: refundStats.reduce((acc, curr) => acc + curr._count, 0),
        pendingRefunds:
          refundStats.find((s) => s.status === "REQUESTED")?._count || 0,
        // Support
        totalTickets: ticketStats.reduce((acc, curr) => acc + curr._count, 0),
        openTickets: ticketStats
          .filter((s) => s.status === "OPEN" || s.status === "IN_PROGRESS")
          .reduce((acc, curr) => acc + curr._count, 0),
        // Marketplace
        totalHousingListings: housingStats.reduce(
          (acc, curr) => acc + curr._count,
          0,
        ),
        activeHousingListings:
          housingStats.find((s) => s.status === "ACTIVE")?._count || 0,
        totalDeals: activeDealsCount,
        totalMeals: activeMealsCount,
        // Operations
        totalDispatches: dispatchStats.reduce(
          (acc, curr) => acc + curr._count,
          0,
        ),
        pendingDispatches:
          dispatchStats.find((s) => s.status === "PENDING")?._count || 0,
        totalSLABreaches: slaStats.reduce((acc, curr) => acc + curr._count, 0),
        openSLABreaches: slaStats.find((s) => s.status === "OPEN")?._count || 0,
        // Verification
        totalVerifications: verificationStats.reduce(
          (acc, curr) => acc + curr._count,
          0,
        ),
        pendingVerifications:
          verificationStats.find((s) => s.status === "PENDING")?._count || 0,
      },
    };
  } catch (error) {
    console.error("Admin stats error:", error);
    return { error: "Failed to fetch dashboard stats." };
  }
}

/**
 * Get module-specific stats for module admin dashboards.
 * @param {string} module - e.g. "DELIVERY", "TRANSPORT", "HOUSING", "DEALS", "MEALS", "SERVICES"
 */
export async function getModuleStats(module) {
  try {
    const user = await getCurrentUser();
    if (
      !user ||
      (!user.role?.startsWith("ADMIN_") && user.role !== "ADMIN_SUPER")
    ) {
      return { error: "Unauthorized" };
    }

    // Module-specific transaction stats
    const [txStats, txStatusStats] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: module },
        _count: true,
        _sum: { amount: true, unizyCommissionAmount: true },
      }),
      prisma.transaction.groupBy({
        by: ["status"],
        where: { type: module },
        _count: true,
      }),
    ]);

    return {
      success: true,
      stats: {
        totalTransactions: txStats._count,
        totalRevenue: txStats._sum.amount || 0,
        totalCommission: txStats._sum.unizyCommissionAmount || 0,
        completedTransactions:
          txStatusStats.find((s) => s.status === "COMPLETED")?._count || 0,
        pendingTransactions:
          txStatusStats.find((s) => s.status === "PENDING")?._count || 0,
      },
    };
  } catch (error) {
    console.error("Module stats error:", error);
    return { error: "Failed to fetch module stats." };
  }
}
