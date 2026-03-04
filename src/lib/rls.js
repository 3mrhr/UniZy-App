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
 * Safely sets session variables for RLS.
 * Note: SET LOCAL does not support parameters in Postgres, so we must strictly validate inputs.
 */
async function setRLSVars(client, userId, userRole) {
    // Strict Validation: userId must be a valid UUID, userRole must be a known enum value
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validRoles = [
        'STUDENT', 'MERCHANT', 'DRIVER', 'PROVIDER',
        'ADMIN_SUPER', 'ADMIN_HOUSING', 'ADMIN_TRANSPORT',
        'ADMIN_DELIVERY', 'ADMIN_COMMERCE', 'ADMIN_SERVICES'
    ];

    if (!uuidRegex.test(userId)) {
        throw new Error('Invalid User ID format for RLS context');
    }
    if (!validRoles.includes(userRole)) {
        throw new Error('Invalid User Role for RLS context');
    }

    // Now safe to use in template literal because we've validated against allow-lists/patterns
    await client.$executeRawUnsafe(`SET LOCAL app.current_user_id = '${userId}'`);
    await client.$executeRawUnsafe(`SET LOCAL app.current_user_role = '${userRole}'`);
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
