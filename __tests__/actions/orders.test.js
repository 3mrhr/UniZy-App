jest.mock("iron-session", () => ({ getIronSession: jest.fn() }));
import { acceptOrder } from '@/app/actions/orders';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { revalidatePath } from 'next/cache';
import { createNotification } from '@/app/actions/notifications';
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

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

jest.mock('@/app/actions/notifications', () => ({
    createNotification: jest.fn(),
}));

describe('acceptOrder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully accept an order (Happy Path)', async () => {
        const orderId = 'order-123';
        const driverId = 'driver-456';
        const mockOrder = { id: orderId, userId: 'user-789' };

        requireRole.mockResolvedValue({ id: driverId });
        prisma.order.updateMany.mockResolvedValue({ count: 1 });
        prisma.order.findUnique.mockResolvedValue(mockOrder);

        const result = await acceptOrder(orderId);

        expect(requireRole).toHaveBeenCalledWith(['DRIVER']);
        expect(prisma.order.updateMany).toHaveBeenCalledWith({
            where: {
                id: orderId,
                status: 'READY',
                driverId: null,
            },
            data: {
                status: 'PICKED_UP',
                driverId: driverId,
            },
        });
        expect(prisma.order.findUnique).toHaveBeenCalledWith({
            where: { id: orderId },
        });
        expect(createNotification).toHaveBeenCalledWith(
            mockOrder.userId,
            'Driver Assigned',
            'A driver has picked up your order!',
            'SYSTEM',
            `/activity/tracking/${mockOrder.id}`
        );
        expect(revalidatePath).toHaveBeenCalledWith('/driver');
        expect(revalidatePath).toHaveBeenCalledWith('/merchant');
        expect(result).toEqual(success({ order: mockOrder }));
    });

    it('should return failure if user is not authorized (Error Path: Unauthorized)', async () => {
        const error = new Error('Unauthorized');
        requireRole.mockRejectedValue(error);

        const result = await acceptOrder('order-123');

        expect(requireRole).toHaveBeenCalledWith(['DRIVER']);
        expect(prisma.order.updateMany).not.toHaveBeenCalled();
        expect(result).toEqual(failure('ACCEPT_FAILED', 'Failed to accept order.'));
    });

    it('should return failure if order is unavailable (Error Path: Unavailable)', async () => {
        const orderId = 'order-123';
        const driverId = 'driver-456';

        requireRole.mockResolvedValue({ id: driverId });
        prisma.order.updateMany.mockResolvedValue({ count: 0 });

        const result = await acceptOrder(orderId);

        expect(prisma.order.updateMany).toHaveBeenCalled();
        expect(prisma.order.findUnique).not.toHaveBeenCalled();
        expect(result).toEqual(failure('UNAVAILABLE', 'Order is no longer available. It may have been taken by another driver.'));
    });

    it('should return failure if a database error occurs (Error Path: Exception)', async () => {
        const orderId = 'order-123';
        const driverId = 'driver-456';

        requireRole.mockResolvedValue({ id: driverId });
        prisma.order.updateMany.mockRejectedValue(new Error('DB Error'));

        const result = await acceptOrder(orderId);

        expect(prisma.order.updateMany).toHaveBeenCalled();
        expect(result).toEqual(failure('ACCEPT_FAILED', 'Failed to accept order.'));
    });
});
