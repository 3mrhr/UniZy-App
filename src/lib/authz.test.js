// Mock the getCurrentUser action
jest.mock('@/app/actions/auth', () => ({
  getCurrentUser: jest.fn(),
}));

import { getCurrentUser } from '@/app/actions/auth';
import {
  requireUser,
  requireRole,
  requireScope,
  requireOwnership,
} from './authz';

describe('authz.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireUser', () => {
    it('should return the user if logged in', async () => {
      const mockUser = { id: '1', name: 'John Doe' };
      getCurrentUser.mockResolvedValue(mockUser);

      const result = await requireUser();

      expect(getCurrentUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw an Error if not logged in', async () => {
      getCurrentUser.mockResolvedValue(null);

      await expect(requireUser()).rejects.toThrow('Unauthorized: You must be logged in.');
      expect(getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('requireRole', () => {
    it('should return the user if they have an allowed role', async () => {
      const mockUser = { id: '1', role: 'ADMIN_SUPER' };
      getCurrentUser.mockResolvedValue(mockUser);

      const result = await requireRole(['ADMIN_SUPER', 'USER']);

      expect(result).toEqual(mockUser);
    });

    it('should throw an Error if they do not have an allowed role', async () => {
      const mockUser = { id: '1', role: 'GUEST' };
      getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireRole(['ADMIN_SUPER', 'USER'])).rejects.toThrow(
        'Forbidden: Requires one of roles: ADMIN_SUPER, USER'
      );
    });

    it('should throw an Error if not logged in', async () => {
      getCurrentUser.mockResolvedValue(null);

      await expect(requireRole(['ADMIN_SUPER', 'USER'])).rejects.toThrow(
        'Unauthorized: You must be logged in.'
      );
    });
  });

  describe('requireScope', () => {
    it('should bypass scope check and return user if role is ADMIN_SUPER', async () => {
      const mockUser = { id: '1', role: 'ADMIN_SUPER', scopes: [] };
      getCurrentUser.mockResolvedValue(mockUser);

      const result = await requireScope('some:scope');

      expect(result).toEqual(mockUser);
    });

    it('should throw an Error if role is not an ADMIN role', async () => {
      const mockUser = { id: '1', role: 'USER', scopes: ['some:scope'] };
      getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireScope('some:scope')).rejects.toThrow(
        'Forbidden: Admin access required.'
      );
    });

    it('should return the user if they have the required scope', async () => {
      const mockUser = { id: '1', role: 'ADMIN_LOCAL', scopes: ['read:users', 'write:users'] };
      getCurrentUser.mockResolvedValue(mockUser);

      const result = await requireScope('read:users');

      expect(result).toEqual(mockUser);
    });

    it('should throw an Error if they do not have the required scope', async () => {
      const mockUser = { id: '1', role: 'ADMIN_LOCAL', scopes: ['read:users'] };
      getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireScope('write:users')).rejects.toThrow(
        'Forbidden: Requires scope write:users'
      );
    });

    it('should throw an Error if scopes is not an array and scope is required', async () => {
      const mockUser = { id: '1', role: 'ADMIN_LOCAL', scopes: null };
      getCurrentUser.mockResolvedValue(mockUser);

      await expect(requireScope('read:users')).rejects.toThrow(
        'Forbidden: Requires scope read:users'
      );
    });

    it('should throw an Error if not logged in', async () => {
      getCurrentUser.mockResolvedValue(null);

      await expect(requireScope('read:users')).rejects.toThrow(
        'Unauthorized: You must be logged in.'
      );
    });
  });

  describe('requireOwnership', () => {
    it('should not throw if the user IDs match', () => {
      expect(() => requireOwnership('user123', 'user123')).not.toThrow();
    });

    it('should throw an Error if the user IDs do not match', () => {
      expect(() => requireOwnership('user123', 'user456')).toThrow(
        'Forbidden: You do not have permission to access or modify this resource.'
      );
    });
  });
});
