import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireOwnership, requireUser, requireRole, requireScope } from './authz.js';
import * as authActions from '@/app/actions/auth.js';

vi.mock('@/app/actions/auth.js', () => ({
    getCurrentUser: vi.fn(),
}));

describe('authz.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('requireOwnership', () => {
        it('should throw an error if the user is not the owner', () => {
            expect(() => requireOwnership('1', '2')).toThrow('Forbidden: You do not have permission to access or modify this resource.');
        });

        it('should not throw an error if the user is the owner', () => {
            expect(() => requireOwnership('1', '1')).not.toThrow();
        });
    });

    describe('requireUser', () => {
        it('should throw an error if the user is not logged in', async () => {
            authActions.getCurrentUser.mockResolvedValueOnce(null);
            await expect(requireUser()).rejects.toThrow('Unauthorized: You must be logged in.');
        });

        it('should return the user if logged in', async () => {
            const mockUser = { id: '1', role: 'USER' };
            authActions.getCurrentUser.mockResolvedValueOnce(mockUser);
            const user = await requireUser();
            expect(user).toEqual(mockUser);
        });
    });

    describe('requireRole', () => {
        it('should throw an error if the user does not have the required role', async () => {
            const mockUser = { id: '1', role: 'USER' };
            authActions.getCurrentUser.mockResolvedValueOnce(mockUser);
            await expect(requireRole(['ADMIN'])).rejects.toThrow('Forbidden: Requires one of roles: ADMIN');
        });

        it('should return the user if they have the required role', async () => {
            const mockUser = { id: '1', role: 'ADMIN' };
            authActions.getCurrentUser.mockResolvedValueOnce(mockUser);
            const user = await requireRole(['ADMIN', 'USER']);
            expect(user).toEqual(mockUser);
        });
    });

    describe('requireScope', () => {
        it('should allow ADMIN_SUPER to bypass scope checks', async () => {
            const mockUser = { id: '1', role: 'ADMIN_SUPER' };
            authActions.getCurrentUser.mockResolvedValueOnce(mockUser);
            const user = await requireScope('some_scope');
            expect(user).toEqual(mockUser);
        });

        it('should throw an error if the user is not an admin', async () => {
            const mockUser = { id: '1', role: 'USER' };
            authActions.getCurrentUser.mockResolvedValueOnce(mockUser);
            await expect(requireScope('some_scope')).rejects.toThrow('Forbidden: Admin access required.');
        });

        it('should throw an error if the admin does not have the required scope', async () => {
            const mockUser = { id: '1', role: 'ADMIN_BASIC', scopes: ['other_scope'] };
            authActions.getCurrentUser.mockResolvedValueOnce(mockUser);
            await expect(requireScope('required_scope')).rejects.toThrow('Forbidden: Requires scope required_scope');
        });

        it('should return the user if the admin has the required scope', async () => {
            const mockUser = { id: '1', role: 'ADMIN_BASIC', scopes: ['required_scope', 'other_scope'] };
            authActions.getCurrentUser.mockResolvedValueOnce(mockUser);
            const user = await requireScope('required_scope');
            expect(user).toEqual(mockUser);
        });

        it('should handle undefined or null scopes array', async () => {
            const mockUser = { id: '1', role: 'ADMIN_BASIC', scopes: null };
            authActions.getCurrentUser.mockResolvedValueOnce(mockUser);
            await expect(requireScope('required_scope')).rejects.toThrow('Forbidden: Requires scope required_scope');
        });
    });
});
