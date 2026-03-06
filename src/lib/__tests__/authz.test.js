import { requireRole, requireScope, requireOwnership, requireUser } from '@/lib/authz';
import * as auth from '@/app/actions/auth';
import { getSession } from '../session';

jest.mock('../session', () => ({
  getSession: jest.fn(),
}));

describe('authz.js', () => {
  let mockSession;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = {
      user: { id: 1, name: 'Test', role: 'USER', isVerified: true },
      role: 'USER',
      save: jest.fn(),
      destroy: jest.fn(),
    };
    getSession.mockResolvedValue(mockSession);
  });

  describe('requireUser', () => {
    it('should return the session object if a session exists', async () => {
      const result = await requireUser();
      expect(result).toEqual(mockSession);
    });

    it('should throw an Error("Unauthorized") if no session exists', async () => {
      getSession.mockResolvedValue(null);

      await expect(requireUser()).rejects.toThrow('Unauthorized');
    });
  });

  describe('requireRole', () => {
    it('should return user if they have an allowed role', async () => {
      mockSession.role = 'ADMIN';

      const result = await requireRole(['ADMIN', 'SUPER_ADMIN']);
      expect(result).toEqual(mockSession);
    });

    it('should throw Error if user does not have an allowed role', async () => {
      mockSession.role = 'USER';

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
      getSession.mockResolvedValue(null);

      await expect(requireRole(['ADMIN'])).rejects.toThrow('Unauthorized');
    });

    it('should throw Error if allowedRoles array is empty', async () => {
      const mockUser = { id: 1, role: 'ADMIN' };
      auth.getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireRole([])).rejects.toThrow('Forbidden: Requires one of roles: ');
    });
  });

  describe('requireScope', () => {
    it('should return user directly if role is ADMIN_SUPER, bypassing scopes', async () => {
      mockSession.role = 'ADMIN_SUPER';

      const result = await requireScope('some:scope');
      expect(result).toEqual(mockSession);
    });

    it('should throw Error if user role does not start with ADMIN_', async () => {
      mockSession.role = 'USER';
      mockSession.scopes = ['some:scope'];

      await expect(requireScope('some:scope')).rejects.toThrow('Forbidden: Admin access required.');
    });

    it('should return user if they are an admin and have the required scope', async () => {
      mockSession.role = 'ADMIN_SYSTEM';
      mockSession.scopes = ['read:users', 'write:users'];

      const result = await requireScope('read:users');
      expect(result).toEqual(mockSession);
    });

    it('should throw Error if they are an admin but missing the required scope', async () => {
      mockSession.role = 'ADMIN_SYSTEM';
      mockSession.scopes = ['read:users'];

      await expect(requireScope('write:users')).rejects.toThrow('Forbidden: Requires scope write:users');
    });

    it('should handle undefined scopes gracefully and throw Error', async () => {
      mockSession.role = 'ADMIN_SYSTEM';
      delete mockSession.scopes;

      await expect(requireScope('read:users')).rejects.toThrow('Forbidden: Requires scope read:users');
    });

    it('should throw Error if no user is found', async () => {
      getSession.mockResolvedValue(null);

      await expect(requireScope('read:users')).rejects.toThrow('Unauthorized');
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
