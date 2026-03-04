import { createOrder } from '../orders';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { generateTxnCode, computeCommissionSnapshot, computePricingSnapshot } from '../financial';
import { logEvent } from '../analytics';
import { createNotification } from '../notifications';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
        $transaction: jest.fn(),
    }
}));

jest.mock('@/lib/authz', () => ({
    requireRole: jest.fn(),
}));

jest.mock('../financial', () => ({
    generateTxnCode: jest.fn(),
    computeCommissionSnapshot: jest.fn(),
    computePricingSnapshot: jest.fn(),
}));

jest.mock('../analytics', () => ({
    logEvent: jest.fn(),
}));

jest.mock('../notifications', () => ({
    createNotification: jest.fn(),
}));

describe('createOrder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return failure if user does not have STUDENT role', async () => {
        requireRole.mockRejectedValue(new Error('Unauthorized'));

        const result = await createOrder('TRANSPORT', {}, 50);

        expect(result).toEqual({
            ok: false,
            error: {
                code: 'CREATE_FAILED',
                message: 'Unauthorized',
            }
        });
    });

    it('should return failure if there is a recent duplicate order', async () => {
        requireRole.mockResolvedValue({ id: 'user-1' });
        prisma.order.findFirst.mockResolvedValue({ id: 'order-1' });

        const result = await createOrder('TRANSPORT', {}, 50);

        expect(result).toEqual({
            ok: false,
            error: {
                code: 'DUPLICATE',
                message: 'A similar order was just placed. Please wait a moment before trying again.',
            }
        });
        expect(prisma.order.findFirst).toHaveBeenCalledWith({
            where: {
                userId: 'user-1',
                service: 'TRANSPORT',
                status: 'PENDING',
                createdAt: { gte: expect.any(Date) }
            },
            orderBy: { createdAt: 'desc' }
        });
    });

    it('should successfully create a non-cart-based order (TRANSPORT)', async () => {
        requireRole.mockResolvedValue({ id: 'user-1' });
        prisma.order.findFirst.mockResolvedValue(null);

        computeCommissionSnapshot.mockResolvedValue({
            commissionRuleId: 'comm-1',
            unizyCommissionAmount: 5,
            providerNetAmount: 45,
            promoSubsidyAmount: 0,
        });
        computePricingSnapshot.mockResolvedValue({
            basePriceSnapshot: 50,
            feeComponentsSnapshot: '[]',
            zoneSnapshot: null,
            pricingRuleId: 'rule-1',
        });
        generateTxnCode.mockReturnValue('TXN-123');

        const mockOrder = { id: 'order-1', total: 50 };
        const mockTxn = { id: 'txn-1', amount: 50 };

        prisma.$transaction.mockImplementation(async (cb) => {
            const tx = {
                order: { create: jest.fn().mockResolvedValue(mockOrder) },
                transaction: { create: jest.fn().mockResolvedValue(mockTxn) },
                transactionHistory: { create: jest.fn().mockResolvedValue({}) },
                rewardAccount: { findUnique: jest.fn().mockResolvedValue(null), update: jest.fn() },
                rewardTransaction: { create: jest.fn() },
            };
            return cb(tx);
        });

        // The action expects the transaction to return an object with `{ success: true, ... }` to trigger the logEvent
        // Wait, actionResult returns `{ ok: true, data }` or `{ ok: false, error }`
        // Looking at the code: return success({ order, transaction: txnRecord });
        // And `if (result?.success) {`
        // But `success()` returns `{ ok: true, data: { order, transaction } }`
        // Let's modify the code to check `result?.ok` instead of `result?.success`

        const result = await createOrder('TRANSPORT', { vendorId: 'vendor-1' }, 50);

        expect(result).toEqual({
            ok: true,
            data: {
                order: mockOrder,
                transaction: mockTxn,
            }
        });
        expect(prisma.$transaction).toHaveBeenCalled();
        // Since `result.success` is probably undefined (it's `result.ok`), logEvent won't be called.
        // I'll fix this in the source code as well.
        expect(logEvent).toHaveBeenCalledWith('ORDER_CREATED', 'order-1', { service: 'TRANSPORT', total: 50 });
        expect(logEvent).toHaveBeenCalledWith('PAYMENT_SUCCEEDED', 'order-1', { amount: 50 });
        expect(createNotification).toHaveBeenCalledWith('user-1', 'Order Placed', 'Your transport order has been placed.', 'SYSTEM', '/activity/tracking/order-1');
    });

    it('should handle errors thrown during order creation', async () => {
        requireRole.mockResolvedValue({ id: 'user-1' });
        prisma.order.findFirst.mockRejectedValue(new Error('Database error'));

        const result = await createOrder('TRANSPORT', {}, 50);

        expect(result).toEqual({
            ok: false,
            error: {
                code: 'CREATE_FAILED',
                message: 'Database error',
            }
        });
    });
});
