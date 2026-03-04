'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

/**
 * Fetch all unified transactions for the currently logged-in user.
 * This powers the /activity dashboard.
 */
export async function getUserTransactions({ type = 'ALL', status = 'ALL', limit = 50 } = {}) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const where = { userId: user.id };
        if (type !== 'ALL') where.type = type;
        if (status !== 'ALL') where.status = status;

        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                // Pull related snapshot data so the UI can render specific icons/titles
                deal: { select: { title: true, merchant: { select: { name: true } } } },
                meal: { select: { name: true, merchant: { select: { name: true } } } },
                serviceBooking: { select: { date: true, timeSlot: true, provider: { select: { name: true, category: true } } } },
                cleaningBooking: { select: { date: true, timeSlot: true, package: { select: { name: true } } } },
                housing: { select: { title: true, type: true } },
                order: { select: { status: true, total: true, details: true, orderItems: { select: { nameSnapshot: true, qty: true } }, driver: { select: { name: true, phone: true } } } },
                history: { orderBy: { createdAt: 'asc' } } // Fetch timeline
            }
        });

        return { success: true, transactions };
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        return { success: false, error: 'Failed to fetch activity history' };
    }
}

/**
 * Fetch a specific transaction's full details and timeline history
 */
export async function getTransactionDetails(transactionId) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                deal: { include: { merchant: { select: { name: true, phone: true } } } },
                meal: { include: { merchant: { select: { name: true, phone: true } } } },
                serviceBooking: { include: { provider: true } },
                cleaningBooking: { include: { package: true } },
                housing: { include: { provider: { select: { name: true, phone: true } } } },
                order: { include: { orderItems: true, driver: { select: { name: true, phone: true } } } },
                history: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        // Normally this would join to a User to show who changed the status, 
                        // but actorId is just a string in our model to keep it light.
                    }
                }
            }
        });

        if (!transaction) return { success: false, error: 'Transaction not found' };

        // Security check: only the owner or an admin can view it
        if (transaction.userId !== user.id && !user.role.startsWith('ADMIN_')) {
            return { success: false, error: 'Unauthorized access to transaction record' };
        }

        return { success: true, transaction };
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        return { success: false, error: 'Failed to fetch transaction details' };
    }
}

/**
 * ADMIN ONLY: Fetch all global system transactions
 */
export async function getAdminTransactions({ type = 'ALL', status = 'ALL', limit = 100 } = {}) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) {
            return { success: false, error: 'Unauthorized' };
        }

        const where = {};
        if (type !== 'ALL') where.type = type;
        if (status !== 'ALL') where.status = status;

        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: { select: { name: true, email: true, phone: true } },
                // Optional context
                deal: { select: { title: true } },
                meal: { select: { name: true } },
                serviceBooking: { select: { id: true } },
                cleaningBooking: { select: { id: true } }
            }
        });

        return { success: true, transactions };
    } catch (error) {
        console.error('Error fetching admin transactions:', error);
        return { success: false, error: 'Failed to fetch system transactions' };
    }
}
