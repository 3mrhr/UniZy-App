import { requireUser, requireRole, requireScope, requireOwnership } from '../authz';
import { getCurrentUser } from '@/app/actions/auth';

jest.mock('@/app/actions/auth', () => ({
    getCurrentUser: jest.fn()
}));

describe('authz.js', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('requireUser', () => {
        it('should return user if logged in', async () => {
            getCurrentUser.mockResolvedValue({ id: '1' });
            const user = await requireUser();
            expect(user).toEqual({ id: '1' });
        });

        it('should throw if not logged in', async () => {
            getCurrentUser.mockResolvedValue(null);
            await expect(requireUser()).rejects.toThrow('Unauthorized: You must be logged in.');
        });
    });

    describe('requireRole', () => {
        it('should return user if user has one of the allowed roles', async () => {
            getCurrentUser.mockResolvedValue({ id: '1', role: 'STUDENT' });
            const user = await requireRole(['STUDENT', 'MERCHANT']);
            expect(user).toEqual({ id: '1', role: 'STUDENT' });
        });

        it('should throw if user does not have one of the allowed roles', async () => {
            getCurrentUser.mockResolvedValue({ id: '1', role: 'DRIVER' });
            await expect(requireRole(['STUDENT', 'MERCHANT'])).rejects.toThrow('Forbidden: Requires one of roles: STUDENT, MERCHANT');
        });

        it('should throw if user is not logged in', async () => {
            getCurrentUser.mockResolvedValue(null);
            await expect(requireRole(['STUDENT'])).rejects.toThrow('Unauthorized: You must be logged in.');
        });
    });

    describe('requireScope', () => {
        it('should allow ADMIN_SUPER to bypass scope checks', async () => {
            getCurrentUser.mockResolvedValue({ id: '1', role: 'ADMIN_SUPER' });
            const user = await requireScope('any:scope');
            expect(user).toEqual({ id: '1', role: 'ADMIN_SUPER' });
        });

        it('should throw if user is not an admin', async () => {
            getCurrentUser.mockResolvedValue({ id: '1', role: 'STUDENT' });
            await expect(requireScope('any:scope')).rejects.toThrow('Forbidden: Admin access required.');
        });

        it('should throw if admin lacks the required scope', async () => {
            getCurrentUser.mockResolvedValue({ id: '1', role: 'ADMIN_USER', scopes: ['other:scope'] });
            await expect(requireScope('required:scope')).rejects.toThrow('Forbidden: Requires scope required:scope');
        });

        it('should return user if admin has the required scope', async () => {
            getCurrentUser.mockResolvedValue({ id: '1', role: 'ADMIN_USER', scopes: ['required:scope'] });
            const user = await requireScope('required:scope');
            expect(user).toEqual({ id: '1', role: 'ADMIN_USER', scopes: ['required:scope'] });
        });

        it('should throw if user has no scopes defined', async () => {
            getCurrentUser.mockResolvedValue({ id: '1', role: 'ADMIN_USER' }); // missing scopes
            await expect(requireScope('required:scope')).rejects.toThrow('Forbidden: Requires scope required:scope');
        });

        it('should throw if scopes is not an array', async () => {
            getCurrentUser.mockResolvedValue({ id: '1', role: 'ADMIN_USER', scopes: 'not-an-array' });
            await expect(requireScope('required:scope')).rejects.toThrow('Forbidden: Requires scope required:scope');
        });

        it('should throw if user is not logged in', async () => {
            getCurrentUser.mockResolvedValue(null);
            await expect(requireScope('any:scope')).rejects.toThrow('Unauthorized: You must be logged in.');
        });
    });

    describe('requireOwnership', () => {
        it('should not throw if resourceOwnerId matches currentUserId', () => {
            expect(() => requireOwnership('user-123', 'user-123')).not.toThrow();
        });

        it('should throw if resourceOwnerId does not match currentUserId', () => {
            expect(() => requireOwnership('user-123', 'user-456')).toThrow('Forbidden: You do not have permission to access or modify this resource.');
        });
    });
});
