import { updateMerchantOrderStatus } from '../orders';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { revalidatePath } from 'next/cache';
import { createNotification } from '../notifications';
import { logEvent } from '../analytics';
import { failure, success } from '@/lib/actionResult';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock('@/lib/authz', () => ({
    requireRole: jest.fn(),
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

jest.mock('../notifications', () => ({
    createNotification: jest.fn(),
}));

jest.mock('../analytics', () => ({
    logEvent: jest.fn(),
}));

jest.mock('../referrals', () => ({
    completeReferralIfEligible: jest.fn(),
}));

jest.mock('../financial', () => ({
    generateTxnCode: jest.fn(),
    computeCommissionSnapshot: jest.fn(),
    computePricingSnapshot: jest.fn(),
}));

jest.mock('../audit', () => ({
    logAdminAction: jest.fn(),
}));

describe('updateMerchantOrderStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update order status successfully for valid transitions', async () => {
        const mockUser = { id: 'merchant-123' };
        requireRole.mockResolvedValue(mockUser);

        const mockOrder = { id: 'order-123', status: 'PENDING', userId: 'user-456' };
        prisma.order.findFirst.mockResolvedValue(mockOrder);

        const updatedOrder = { ...mockOrder, status: 'ACCEPTED' };
        prisma.order.update.mockResolvedValue(updatedOrder);

        const result = await updateMerchantOrderStatus('order-123', 'ACCEPTED');

        expect(requireRole).toHaveBeenCalledWith(['MERCHANT']);
        expect(prisma.order.findFirst).toHaveBeenCalledWith({
            where: {
                id: 'order-123',
                orderItems: {
                    some: {
                        meal: {
                            merchantId: 'merchant-123'
                        }
                    }
                }
            }
        });
        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { id: 'order-123' },
            data: { status: 'ACCEPTED' }
        });
        expect(createNotification).toHaveBeenCalledWith('user-456', 'Order Update', 'Your order is now ACCEPTED.', 'SYSTEM', '/activity/tracking/order-123');
        expect(logEvent).toHaveBeenCalledWith('ORDER_STATUS_TRANSITION', 'order-123', { newStatus: 'ACCEPTED', actor: 'MERCHANT' });
        expect(revalidatePath).toHaveBeenCalledWith('/merchant');
        expect(result).toEqual(success({ order: updatedOrder }));
    });

    it('should return failure if user is not a MERCHANT', async () => {
        requireRole.mockRejectedValue(new Error('Forbidden'));

        const result = await updateMerchantOrderStatus('order-123', 'ACCEPTED');

        expect(result).toEqual(failure('UPDATE_FAILED', 'Failed to update order status.'));
    });

    it('should return failure if order does not exist or does not belong to merchant', async () => {
        const mockUser = { id: 'merchant-123' };
        requireRole.mockResolvedValue(mockUser);

        prisma.order.findFirst.mockResolvedValue(null);

        const result = await updateMerchantOrderStatus('order-123', 'ACCEPTED');

        expect(result).toEqual(failure('NOT_FOUND', 'Order not found or does not belong to you.'));
        expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('should return failure for invalid state transitions', async () => {
        const mockUser = { id: 'merchant-123' };
        requireRole.mockResolvedValue(mockUser);

        const mockOrder = { id: 'order-123', status: 'PENDING', userId: 'user-456' };
        prisma.order.findFirst.mockResolvedValue(mockOrder);

        const result = await updateMerchantOrderStatus('order-123', 'READY');

        expect(result).toEqual(failure('INVALID_STATE', 'Cannot transition from PENDING to READY.'));
        expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('should return failure on database error', async () => {
        const mockUser = { id: 'merchant-123' };
        requireRole.mockResolvedValue(mockUser);

        prisma.order.findFirst.mockRejectedValue(new Error('Database error'));

        const result = await updateMerchantOrderStatus('order-123', 'ACCEPTED');

        expect(result).toEqual(failure('UPDATE_FAILED', 'Failed to update order status.'));
    });
});
