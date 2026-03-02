import { prisma } from './prisma';

/**
 * Set PostgreSQL session variables for Row-Level Security (RLS).
 * Call this before any Prisma query that touches RLS-protected tables.
 * 
 * These variables are used by RLS policies to filter rows:
 * - app.current_user_id: The authenticated user's ID
 * - app.current_user_role: The authenticated user's role
 * 
 * @param {string} userId - The current user's ID
 * @param {string} userRole - The current user's role
 * @returns {import('@prisma/client').PrismaClient} A Prisma client with RLS context set
 */
export async function withRLSContext(userId, userRole) {
    // Set session-level variables for RLS policies
    await prisma.$executeRawUnsafe(
        `SET LOCAL app.current_user_id = '${userId}'`
    );
    await prisma.$executeRawUnsafe(
        `SET LOCAL app.current_user_role = '${userRole}'`
    );
    return prisma;
}

/**
 * Execute a callback within a transaction that has RLS context set.
 * This ensures all queries within the callback are filtered by RLS.
 * 
 * @param {string} userId - The current user's ID
 * @param {string} userRole - The current user's role
 * @param {Function} callback - Async function receiving the transaction client
 */
export async function withRLSTransaction(userId, userRole, callback) {
    return prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(
            `SET LOCAL app.current_user_id = '${userId}'`
        );
        await tx.$executeRawUnsafe(
            `SET LOCAL app.current_user_role = '${userRole}'`
        );
        return callback(tx);
    });
}
