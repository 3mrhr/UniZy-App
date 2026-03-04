import { withRLSContext, withRLSTransaction } from '../rls';
import { prisma } from '../prisma';

jest.mock('../prisma', () => ({
  prisma: {
    $executeRaw: jest.fn(),
    $transaction: jest.fn()
  }
}));

describe('rls module', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('withRLSContext', () => {
        it('should execute set_config for user ID and role on the prisma client', async () => {
            const userId = 'user_123';
            const userRole = 'student';

            const result = await withRLSContext(userId, userRole);

            expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);

            // Note: Since Prisma template strings are processed into an array of strings and values,
            // we can verify the mock was called with an array where the first string matches our expectations.
            expect(prisma.$executeRaw).toHaveBeenNthCalledWith(
              1,
              expect.arrayContaining([expect.stringContaining('SELECT set_config(\'app.current_user_id\'')]),
              userId
            );

            expect(prisma.$executeRaw).toHaveBeenNthCalledWith(
              2,
              expect.arrayContaining([expect.stringContaining('SELECT set_config(\'app.current_user_role\'')]),
              userRole
            );

            expect(result).toBe(prisma);
        });

        it('should handle missing userId or userRole correctly (pass undefined/null to DB driver)', async () => {
            await withRLSContext(null, undefined);

            expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
            expect(prisma.$executeRaw).toHaveBeenNthCalledWith(
              1,
              expect.any(Array),
              null
            );
            expect(prisma.$executeRaw).toHaveBeenNthCalledWith(
              2,
              expect.any(Array),
              undefined
            );
        });

        it('should propagate errors if $executeRaw fails', async () => {
            const error = new Error('Database error');
            prisma.$executeRaw.mockRejectedValueOnce(error);

            await expect(withRLSContext('123', 'admin')).rejects.toThrow('Database error');
        });
    });

    describe('withRLSTransaction', () => {
        it('should set variables and run callback within a transaction', async () => {
            const userId = 'user_456';
            const userRole = 'merchant';
            const mockResult = { success: true };
            const callback = jest.fn().mockResolvedValue(mockResult);

            // Mock $transaction to immediately call its callback with a mock transaction object
            const mockTx = {
                $executeRaw: jest.fn()
            };
            prisma.$transaction.mockImplementation(async (txCallback) => {
                return txCallback(mockTx);
            });

            const result = await withRLSTransaction(userId, userRole, callback);

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);

            // Variables should be set on the transaction object (mockTx), NOT the main prisma client
            expect(mockTx.$executeRaw).toHaveBeenCalledTimes(2);
            expect(prisma.$executeRaw).not.toHaveBeenCalled();

            expect(mockTx.$executeRaw).toHaveBeenNthCalledWith(
              1,
              expect.arrayContaining([expect.stringContaining('SELECT set_config(\'app.current_user_id\'')]),
              userId
            );

            expect(mockTx.$executeRaw).toHaveBeenNthCalledWith(
              2,
              expect.arrayContaining([expect.stringContaining('SELECT set_config(\'app.current_user_role\'')]),
              userRole
            );

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(mockTx);
            expect(result).toBe(mockResult);
        });

        it('should propagate errors if the transaction callback fails', async () => {
            const mockTx = {
                $executeRaw: jest.fn()
            };
            prisma.$transaction.mockImplementation(async (txCallback) => {
                return txCallback(mockTx);
            });

            const error = new Error('Callback failed');
            const callback = jest.fn().mockRejectedValue(error);

            await expect(withRLSTransaction('123', 'student', callback)).rejects.toThrow('Callback failed');
        });

        it('should propagate errors if $executeRaw fails within the transaction', async () => {
            const mockTx = {
                $executeRaw: jest.fn().mockRejectedValue(new Error('Tx Database error'))
            };
            prisma.$transaction.mockImplementation(async (txCallback) => {
                return txCallback(mockTx);
            });

            const callback = jest.fn();

            await expect(withRLSTransaction('123', 'student', callback)).rejects.toThrow('Tx Database error');
            expect(callback).not.toHaveBeenCalled();
        });
    });
});
