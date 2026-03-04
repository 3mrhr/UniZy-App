import { getMerchantOrders } from '../orders';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('@/lib/authz', () => ({
    requireRole: jest.fn(),
}));

describe('getMerchantOrders', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Suppress console.error in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should successfully fetch merchant orders', async () => {
        // Arrange
        const mockUser = { id: 'merchant-123', role: 'MERCHANT' };
        const mockOrders = [
            { id: 'order-1', service: 'DELIVERY', total: 100 },
            { id: 'order-2', service: 'DELIVERY', total: 200 },
        ];

        requireRole.mockResolvedValue(mockUser);
        prisma.order.findMany.mockResolvedValue(mockOrders);

        // Act
        const result = await getMerchantOrders();

        // Assert
        expect(requireRole).toHaveBeenCalledWith(['MERCHANT']);
        expect(prisma.order.findMany).toHaveBeenCalledWith({
            where: {
                service: 'DELIVERY',
                orderItems: {
                    some: {
                        meal: {
                            merchantId: mockUser.id
                        }
                    }
                }
            },
            include: {
                user: { select: { name: true, phone: true } },
                orderItems: {
                    select: {
                        nameSnapshot: true,
                        qty: true,
                        basePriceSnapshot: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        expect(result).toEqual({ success: true, orders: mockOrders });
    });

    it('should handle requireRole authorization failure', async () => {
        // Arrange
        const error = new Error('Unauthorized');
        requireRole.mockRejectedValue(error);

        // Act
        const result = await getMerchantOrders();

        // Assert
        expect(requireRole).toHaveBeenCalledWith(['MERCHANT']);
        expect(prisma.order.findMany).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Failed to fetch merchant orders:', error);
        expect(result).toEqual({ error: 'Failed to fetch orders.' });
    });

    it('should handle prisma.order.findMany database failure', async () => {
        // Arrange
        const mockUser = { id: 'merchant-123', role: 'MERCHANT' };
        const error = new Error('Database connection failed');

        requireRole.mockResolvedValue(mockUser);
        prisma.order.findMany.mockRejectedValue(error);

        // Act
        const result = await getMerchantOrders();

        // Assert
        expect(requireRole).toHaveBeenCalledWith(['MERCHANT']);
        expect(prisma.order.findMany).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Failed to fetch merchant orders:', error);
        expect(result).toEqual({ error: 'Failed to fetch orders.' });
    });
});
