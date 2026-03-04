import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withRLSContext, withRLSTransaction } from '../../src/lib/rls.js';
import { prisma } from '../../src/lib/prisma.js';

vi.mock('../../src/lib/prisma.js', () => ({
    prisma: {
        $executeRaw: vi.fn(),
        $transaction: vi.fn(),
    }
}));

describe('RLS context utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('withRLSContext', () => {
        it('should execute raw queries to set the RLS variables and return prisma client', async () => {
            const userId = 'user-123';
            const userRole = 'admin';

            const result = await withRLSContext(userId, userRole);

            expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
            // $executeRaw uses tagged template literals, so it returns an array of strings as the first arg
            // and the values as the subsequent args. We can just check that it was called correctly with the user inputs.
            const calls = prisma.$executeRaw.mock.calls;

            // Check that $executeRaw was called with the correct parameterized queries
            // Since it's a tagged template, the call signature is [[strings], value]
            expect(calls[0][1]).toBe(userId);
            expect(calls[0][0][0]).toContain("SELECT set_config('app.current_user_id'");

            expect(calls[1][1]).toBe(userRole);
            expect(calls[1][0][0]).toContain("SELECT set_config('app.current_user_role'");

            expect(result).toBe(prisma);
        });

        it('should bubble up errors from $executeRaw', async () => {
            const error = new Error('Database error');
            prisma.$executeRaw.mockRejectedValueOnce(error);

            await expect(withRLSContext('user-1', 'user')).rejects.toThrow('Database error');
        });
    });

    describe('withRLSTransaction', () => {
        it('should open a transaction, set RLS variables, and call the callback', async () => {
            const userId = 'user-123';
            const userRole = 'admin';

            const mockTx = {
                $executeRaw: vi.fn().mockResolvedValue(),
            };
            const mockCallback = vi.fn().mockResolvedValue('callback-result');

            // Mock $transaction to immediately call its callback with our mockTx
            prisma.$transaction.mockImplementationOnce(async (txCallback) => {
                return txCallback(mockTx);
            });

            const result = await withRLSTransaction(userId, userRole, mockCallback);

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);

            // Verify RLS vars were set on the transaction client
            expect(mockTx.$executeRaw).toHaveBeenCalledTimes(2);
            const calls = mockTx.$executeRaw.mock.calls;
            expect(calls[0][1]).toBe(userId);
            expect(calls[1][1]).toBe(userRole);

            // Verify the callback was called with the transaction client
            expect(mockCallback).toHaveBeenCalledTimes(1);
            expect(mockCallback).toHaveBeenCalledWith(mockTx);

            // Verify it returned the result of the callback
            expect(result).toBe('callback-result');
        });

        it('should bubble up errors from the transaction callback', async () => {
            const error = new Error('Callback error');
            const mockTx = {
                $executeRaw: vi.fn().mockResolvedValue(),
            };
            const mockCallback = vi.fn().mockRejectedValue(error);

            prisma.$transaction.mockImplementationOnce(async (txCallback) => {
                return txCallback(mockTx);
            });

            await expect(withRLSTransaction('user-1', 'user', mockCallback)).rejects.toThrow('Callback error');
        });
    });
});
