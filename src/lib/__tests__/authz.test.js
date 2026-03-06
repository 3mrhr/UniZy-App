import { requireRole, requireScope, requireOwnership, requireUser } from '../authz';
import * as auth from '@/app/actions/auth';

jest.mock('@/app/actions/auth', () => ({
  getCurrentUser: jest.fn(),
}));

describe('authz.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireUser', () => {
    it('should return user if logged in', async () => {
      const mockUser = { id: 1, name: 'Test' };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      const result = await requireUser();
      expect(result).toEqual(mockUser);
    });

    it('should throw Error if not logged in', async () => {
      auth.getCurrentUser.mockResolvedValue(null);

      await expect(requireUser()).rejects.toThrow('Unauthorized: You must be logged in.');
    });
  });

  describe('requireRole', () => {
    it('should return user if they have an allowed role', async () => {
      const mockUser = { id: 1, role: 'ADMIN' };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      const result = await requireRole(['ADMIN', 'SUPER_ADMIN']);
      expect(result).toEqual(mockUser);
    });

    it('should throw Error if user does not have an allowed role', async () => {
      const mockUser = { id: 1, role: 'USER' };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireRole(['ADMIN', 'SUPER_ADMIN'])).rejects.toThrow('Forbidden: Requires one of roles: ADMIN, SUPER_ADMIN');
    });

    it('should return user if they have an allowed role that is not the first element', async () => {
      const mockUser = { id: 1, role: 'SUPER_ADMIN' };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      const result = await requireRole(['ADMIN', 'SUPER_ADMIN']);
      expect(result).toEqual(mockUser);
    });

    it('should throw Error if user has no role defined', async () => {
      const mockUser = { id: 1 };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireRole(['ADMIN'])).rejects.toThrow('Forbidden: Requires one of roles: ADMIN');
    });

    it('should throw Error if no user is found', async () => {
      auth.getCurrentUser.mockResolvedValue(null);

      await expect(requireRole(['ADMIN'])).rejects.toThrow('Unauthorized: You must be logged in.');
    });

    it('should throw Error if allowedRoles array is empty', async () => {
      const mockUser = { id: 1, role: 'ADMIN' };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireRole([])).rejects.toThrow('Forbidden: Requires one of roles: ');
    });
  });

  describe('requireScope', () => {
    it('should return user directly if role is ADMIN_SUPER, bypassing scopes', async () => {
      const mockUser = { id: 1, role: 'ADMIN_SUPER' };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      const result = await requireScope('some:scope');
      expect(result).toEqual(mockUser);
    });

    it('should throw Error if user role does not start with ADMIN_', async () => {
      const mockUser = { id: 1, role: 'USER', scopes: ['some:scope'] };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireScope('some:scope')).rejects.toThrow('Forbidden: Admin access required.');
    });

    it('should return user if they are an admin and have the required scope', async () => {
      const mockUser = { id: 1, role: 'ADMIN_SYSTEM', scopes: ['read:users', 'write:users'] };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      const result = await requireScope('read:users');
      expect(result).toEqual(mockUser);
    });

    it('should throw Error if they are an admin but missing the required scope', async () => {
      const mockUser = { id: 1, role: 'ADMIN_SYSTEM', scopes: ['read:users'] };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireScope('write:users')).rejects.toThrow('Forbidden: Requires scope write:users');
    });

    it('should handle undefined scopes gracefully and throw Error', async () => {
      const mockUser = { id: 1, role: 'ADMIN_SYSTEM' };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireScope('read:users')).rejects.toThrow('Forbidden: Requires scope read:users');
    });

    it('should throw Error if no user is found', async () => {
      auth.getCurrentUser.mockResolvedValue(null);

      await expect(requireScope('read:users')).rejects.toThrow('Unauthorized: You must be logged in.');
    });
  });

  describe('requireOwnership', () => {
    it('should not throw if resourceOwnerId matches currentUserId', () => {
      expect(() => requireOwnership('123', '123')).not.toThrow();
    });

    it('should throw Error if resourceOwnerId does not match currentUserId', () => {
      expect(() => requireOwnership('123', '456')).toThrow('Forbidden: You do not have permission to access or modify this resource.');
    });
  });
});
