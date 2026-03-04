import { getStudentOrders } from '../orders';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('@/lib/authz', () => ({
    requireRole: jest.fn(),
    requireOwnership: jest.fn(),
}));

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

describe('orders action - getStudentOrders', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress console.error during tests to keep output clean
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should return a list of orders when successful', async () => {
        // Arrange
        const mockUser = { id: 'user-123', roles: ['STUDENT'] };
        const mockOrders = [
            { id: 'order-1', userId: 'user-123', total: 100 },
            { id: 'order-2', userId: 'user-123', total: 200 }
        ];

        requireRole.mockResolvedValue(mockUser);
        prisma.order.findMany.mockResolvedValue(mockOrders);

        // Act
        const result = await getStudentOrders();

        // Assert
        expect(requireRole).toHaveBeenCalledWith(['STUDENT']);
        expect(prisma.order.findMany).toHaveBeenCalledWith({
            where: { userId: mockUser.id },
            orderBy: { createdAt: 'desc' }
        });
        expect(result).toEqual(mockOrders);
    });

    it('should return an empty array and log error when requireRole throws', async () => {
        // Arrange
        const error = new Error('Unauthorized');
        requireRole.mockRejectedValue(error);

        // Act
        const result = await getStudentOrders();

        // Assert
        expect(requireRole).toHaveBeenCalledWith(['STUDENT']);
        expect(prisma.order.findMany).not.toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch orders:', error);
        expect(result).toEqual([]);
    });

    it('should return an empty array and log error when prisma.order.findMany throws', async () => {
        // Arrange
        const mockUser = { id: 'user-123', roles: ['STUDENT'] };
        const error = new Error('Database connection failed');

        requireRole.mockResolvedValue(mockUser);
        prisma.order.findMany.mockRejectedValue(error);

        // Act
        const result = await getStudentOrders();

        // Assert
        expect(requireRole).toHaveBeenCalledWith(['STUDENT']);
        expect(prisma.order.findMany).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch orders:', error);
        expect(result).toEqual([]);
    });
});
