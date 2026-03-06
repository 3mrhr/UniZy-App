import { withRLSContext, withRLSTransaction } from '@/lib/rls';
import { prisma } from '@/lib/prisma';

// Mock the prisma dependency
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $executeRaw: jest.fn(),
    $transaction: jest.fn(),
  }
}));

describe('rls.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('withRLSContext', () => {
    it('should set RLS variables on prisma client and return prisma', async () => {
      // Arrange
      const userId = 'user-123';
      const userRole = 'ADMIN';

      // Act
      const result = await withRLSContext(userId, userRole);

      // Assert
      expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);

      // Check the exact queries
      const firstCallArgs = prisma.$executeRaw.mock.calls[0][0];
      const secondCallArgs = prisma.$executeRaw.mock.calls[1][0];

      expect(firstCallArgs[0]).toContain("SELECT set_config('app.current_user_id'");
      expect(secondCallArgs[0]).toContain("SELECT set_config('app.current_user_role'");

      // The function should return the prisma instance
      expect(result).toBe(prisma);
    });

    it('should handle missing userId and userRole gracefully', async () => {
      // Arrange
      const userId = undefined;
      const userRole = null;

      // Act
      const result = await withRLSContext(userId, userRole);

      // Assert
      expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
      expect(result).toBe(prisma);
    });

    it('should propagate errors from Prisma $executeRaw', async () => {
      // Arrange
      const error = new Error('Database error');
      prisma.$executeRaw.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(withRLSContext('user-123', 'ADMIN')).rejects.toThrow('Database error');
    });
  });

  describe('withRLSTransaction', () => {
    it('should set RLS variables on transaction client and call callback', async () => {
      // Arrange
      const mockTx = {
        $executeRaw: jest.fn()
      };

      // Setup transaction to immediately call the callback with the mockTx
      prisma.$transaction.mockImplementation(async (cb) => {
        return cb(mockTx);
      });

      const callback = jest.fn().mockResolvedValue('callback_result');
      const userId = 'user-456';
      const userRole = 'USER';

      // Act
      const result = await withRLSTransaction(userId, userRole, callback);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(mockTx.$executeRaw).toHaveBeenCalledTimes(2);

      // Verify queries were executed on the transaction object, not global prisma
      expect(prisma.$executeRaw).not.toHaveBeenCalled();

      const firstCallArgs = mockTx.$executeRaw.mock.calls[0][0];
      const secondCallArgs = mockTx.$executeRaw.mock.calls[1][0];

      expect(firstCallArgs[0]).toContain("SELECT set_config('app.current_user_id'");
      expect(secondCallArgs[0]).toContain("SELECT set_config('app.current_user_role'");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(mockTx);
      expect(result).toBe('callback_result');
    });

    it('should propagate errors from the transaction callback', async () => {
      // Arrange
      const mockTx = {
        $executeRaw: jest.fn()
      };

      prisma.$transaction.mockImplementation(async (cb) => {
        return cb(mockTx);
      });

      const error = new Error('Transaction callback error');
      const callback = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(withRLSTransaction('user-123', 'USER', callback)).rejects.toThrow('Transaction callback error');
    });

    it('should propagate errors from setting RLS variables in transaction', async () => {
      // Arrange
      const error = new Error('Failed to set RLS');
      const mockTx = {
        $executeRaw: jest.fn().mockRejectedValue(error)
      };

      prisma.$transaction.mockImplementation(async (cb) => {
        return cb(mockTx);
      });

      const callback = jest.fn();

      // Act & Assert
      await expect(withRLSTransaction('user-123', 'USER', callback)).rejects.toThrow('Failed to set RLS');
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
