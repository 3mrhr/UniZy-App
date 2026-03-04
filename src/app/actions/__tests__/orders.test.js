import { acceptOrder } from '../orders';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { createNotification } from '../notifications';
import { revalidatePath } from 'next/cache';
import { success, failure } from '@/lib/actionResult';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            updateMany: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('@/lib/authz', () => ({
    requireRole: jest.fn(),
}));

jest.mock('../notifications', () => ({
    createNotification: jest.fn(),
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

describe('orders action - acceptOrder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully accept an order when status is READY and driver is assigned', async () => {
        const mockDriver = { id: 'driver-123' };
        const mockOrder = { id: 'order-123', userId: 'user-123', status: 'PICKED_UP', driverId: 'driver-123' };

        requireRole.mockResolvedValue(mockDriver);
        prisma.order.updateMany.mockResolvedValue({ count: 1 });
        prisma.order.findUnique.mockResolvedValue(mockOrder);
        createNotification.mockResolvedValue();

        const result = await acceptOrder('order-123');

        expect(requireRole).toHaveBeenCalledWith(['DRIVER']);
        expect(prisma.order.updateMany).toHaveBeenCalledWith({
            where: {
                id: 'order-123',
                status: 'READY',
                driverId: null,
            },
            data: {
                status: 'PICKED_UP',
                driverId: 'driver-123',
            },
        });
        expect(prisma.order.findUnique).toHaveBeenCalledWith({ where: { id: 'order-123' } });
        expect(createNotification).toHaveBeenCalledWith('user-123', 'Driver Assigned', 'A driver has picked up your order!', 'SYSTEM', '/activity/tracking/order-123');
        expect(revalidatePath).toHaveBeenCalledWith('/driver');
        expect(revalidatePath).toHaveBeenCalledWith('/merchant');
        expect(result).toEqual(success({ order: mockOrder }));
    });

    it('should return failure if order is already taken or does not exist', async () => {
        const mockDriver = { id: 'driver-123' };
        requireRole.mockResolvedValue(mockDriver);
        prisma.order.updateMany.mockResolvedValue({ count: 0 });

        const result = await acceptOrder('order-123');

        expect(result).toEqual(failure('UNAVAILABLE', 'Order is no longer available. It may have been taken by another driver.'));
        expect(prisma.order.findUnique).not.toHaveBeenCalled();
        expect(createNotification).not.toHaveBeenCalled();
    });

    it('should return failure if user does not have DRIVER role', async () => {
        requireRole.mockRejectedValue(new Error('Forbidden'));

        const result = await acceptOrder('order-123');

        expect(result).toEqual(failure('ACCEPT_FAILED', 'Failed to accept order.'));
        expect(prisma.order.updateMany).not.toHaveBeenCalled();
    });

    it('should handle notification failure gracefully', async () => {
        const mockDriver = { id: 'driver-123' };
        const mockOrder = { id: 'order-123', userId: 'user-123', status: 'PICKED_UP', driverId: 'driver-123' };

        requireRole.mockResolvedValue(mockDriver);
        prisma.order.updateMany.mockResolvedValue({ count: 1 });
        prisma.order.findUnique.mockResolvedValue(mockOrder);
        createNotification.mockRejectedValue(new Error('Notification failed'));

        const result = await acceptOrder('order-123');

        expect(result).toEqual(success({ order: mockOrder }));
        expect(createNotification).toHaveBeenCalled();
        expect(revalidatePath).toHaveBeenCalledWith('/driver');
        expect(revalidatePath).toHaveBeenCalledWith('/merchant');
    });

    it('should return failure on unexpected database error', async () => {
        const mockDriver = { id: 'driver-123' };
        requireRole.mockResolvedValue(mockDriver);
        prisma.order.updateMany.mockRejectedValue(new Error('DB Error'));

        const result = await acceptOrder('order-123');

        expect(result).toEqual(failure('ACCEPT_FAILED', 'Failed to accept order.'));
    });
});
