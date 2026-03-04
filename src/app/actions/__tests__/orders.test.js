import { getDriverOrders } from '../orders';
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
}));

// Mock console.error to keep test output clean
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

describe('getDriverOrders', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully fetch orders for a valid driver', async () => {
        // Arrange
        const mockUser = { id: 'driver-123' };
        requireRole.mockResolvedValue(mockUser);

        const mockOrders = [
            { id: 'order-1', service: 'DELIVERY', status: 'READY', driverId: null },
            { id: 'order-2', service: 'DELIVERY', status: 'PICKED_UP', driverId: 'driver-123' }
        ];
        prisma.order.findMany.mockResolvedValue(mockOrders);

        // Act
        const result = await getDriverOrders();

        // Assert
        expect(requireRole).toHaveBeenCalledWith(['DRIVER']);
        expect(prisma.order.findMany).toHaveBeenCalledWith({
            where: {
                service: 'DELIVERY',
                OR: [
                    { status: 'READY', driverId: null },
                    { driverId: mockUser.id }
                ]
            },
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                    }
                },
                orderItems: {
                    select: {
                        nameSnapshot: true,
                        qty: true,
                        basePriceSnapshot: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        expect(result).toEqual(mockOrders);
    });

    it('should return an empty array and log error when requireRole fails (authz error)', async () => {
        // Arrange
        const authError = new Error('Unauthorized');
        requireRole.mockRejectedValue(authError);

        // Act
        const result = await getDriverOrders();

        // Assert
        expect(requireRole).toHaveBeenCalledWith(['DRIVER']);
        expect(prisma.order.findMany).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Failed to fetch driver orders:', authError);
        expect(result).toEqual([]);
    });

    it('should return an empty array and log error when prisma.order.findMany fails (database error)', async () => {
        // Arrange
        const mockUser = { id: 'driver-123' };
        requireRole.mockResolvedValue(mockUser);

        const dbError = new Error('Database connection failed');
        prisma.order.findMany.mockRejectedValue(dbError);

        // Act
        const result = await getDriverOrders();

        // Assert
        expect(requireRole).toHaveBeenCalledWith(['DRIVER']);
        expect(prisma.order.findMany).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Failed to fetch driver orders:', dbError);
        expect(result).toEqual([]);
    });
});
