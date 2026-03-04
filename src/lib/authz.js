import { getCurrentUser } from '@/app/actions/auth';

/**
 * Ensures the user is logged in.
 */
export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Unauthorized: You must be logged in.');
    }
    return user;
}

/**
 * Ensures the user has one of the specified roles.
 */
export async function requireRole(allowedRoles) {
    const user = await requireUser();
    if (!allowedRoles.includes(user.role)) {
        throw new Error(`Forbidden: Requires one of roles: ${allowedRoles.join(', ')}`);
    }
    return user;
}

/**
 * Ensures the user has a specific scope (useful for ADMIN role).
 */
export async function requireScope(requiredScope) {
    const user = await requireUser();
    if (user.role !== 'ADMIN') {
        throw new Error('Forbidden: Admin access required.');
    }

    if (user.scopes === 'ADMIN_SUPER') {
        return user; // Super admin has all scopes
    }

    const scopes = user.scopes ? user.scopes.split(',') : [];
    if (!scopes.includes(requiredScope) && !scopes.includes('ADMIN_SUPER')) {
        throw new Error(`Forbidden: Requires scope ${requiredScope}`);
    }
    return user;
}

/**
 * Ensures ownership of a resource.
 * @param {string} resourceOwnerId - The ID of the user who owns the resource
 * @param {string} currentUserId - The ID of the current user
 */
export function requireOwnership(resourceOwnerId, currentUserId) {
    if (resourceOwnerId !== currentUserId) {
        throw new Error('Forbidden: You do not have permission to access or modify this resource.');
    }
}
