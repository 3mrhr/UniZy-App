import { pollOrderStatus } from '../orders';
import { prisma } from '@/lib/prisma';
import { requireRole, requireOwnership } from '@/lib/authz';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('@/lib/authz', () => ({
    requireRole: jest.fn(),
    requireOwnership: jest.fn(),
}));

// Mock modules used in the file, not directly in pollOrderStatus, to avoid evaluation errors
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

jest.mock('../referrals', () => ({
    completeReferralIfEligible: jest.fn(),
}));

jest.mock('../notifications', () => ({
    createNotification: jest.fn(),
}));

jest.mock('../financial', () => ({
    generateTxnCode: jest.fn(),
    computeCommissionSnapshot: jest.fn(),
    computePricingSnapshot: jest.fn(),
}));

jest.mock('../analytics', () => ({
    logEvent: jest.fn(),
}));

jest.mock('../audit', () => ({
    logAdminAction: jest.fn(),
}));

describe('pollOrderStatus', () => {
    const mockUser = { id: 'user-1', name: 'Student Test' };
    const mockOrder = {
        id: 'order-1',
        userId: 'user-1',
        status: 'PENDING',
        driver: { name: 'Driver Test', phone: '1234567890' },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return success and the order when user is student, order exists and user owns the order', async () => {
        requireRole.mockResolvedValue(mockUser);
        prisma.order.findUnique.mockResolvedValue(mockOrder);
        requireOwnership.mockImplementation(() => {});

        const result = await pollOrderStatus('order-1');

        expect(requireRole).toHaveBeenCalledWith(['STUDENT']);
        expect(prisma.order.findUnique).toHaveBeenCalledWith({
            where: { id: 'order-1' },
            include: {
                driver: {
                    select: { name: true, phone: true },
                },
            },
        });
        expect(requireOwnership).toHaveBeenCalledWith(mockOrder.userId, mockUser.id);
        expect(result).toEqual({ success: true, order: mockOrder });
    });

    it('should return an error when requireRole throws an error (unauthorized)', async () => {
        requireRole.mockRejectedValue(new Error('Unauthorized'));

        const result = await pollOrderStatus('order-1');

        expect(result).toEqual({ error: 'Failed to fetch order status.' });
    });

    it('should return an error when the order is not found', async () => {
        requireRole.mockResolvedValue(mockUser);
        prisma.order.findUnique.mockResolvedValue(null);

        const result = await pollOrderStatus('order-1');

        expect(result).toEqual({ error: 'Order not found.' });
    });

    it('should return an error when the user does not own the order', async () => {
        requireRole.mockResolvedValue(mockUser);
        prisma.order.findUnique.mockResolvedValue(mockOrder);
        requireOwnership.mockImplementation(() => {
            throw new Error('Forbidden');
        });

        const result = await pollOrderStatus('order-1');

        expect(result).toEqual({ error: 'Failed to fetch order status.' });
    });

    it('should return an error when a database error occurs during findUnique', async () => {
        requireRole.mockResolvedValue(mockUser);
        prisma.order.findUnique.mockRejectedValue(new Error('DB Error'));

        const result = await pollOrderStatus('order-1');

        expect(result).toEqual({ error: 'Failed to fetch order status.' });
    });
});
