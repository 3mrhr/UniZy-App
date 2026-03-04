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
/**
 * Safely sets session variables for RLS using standard parameterized queries.
 * PostgreSQL set_config supports safe parameterization via SELECT,
 * removing the need for executeRawUnsafe and strict regex validation.
 */
async function setRLSVars(client, userId, userRole) {
    await client.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true);`;
    await client.$executeRaw`SELECT set_config('app.current_user_role', ${userRole}, true);`;
}

export async function withRLSContext(userId, userRole) {
    await setRLSVars(prisma, userId, userRole);
    return prisma;
}

export async function withRLSTransaction(userId, userRole, callback) {
    return prisma.$transaction(async (tx) => {
        await setRLSVars(tx, userId, userRole);
        return callback(tx);
    });
}
