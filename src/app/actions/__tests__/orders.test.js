import { updateOrderStatus } from '../orders';
import { prisma } from '@/lib/prisma';
import { requireRole, requireOwnership } from '@/lib/authz';
import { revalidatePath } from 'next/cache';
import { createNotification } from '../notifications';
import { logEvent } from '../analytics';
import { logAdminAction } from '../audit';
import { success, failure } from '@/lib/actionResult';

// Mock dependencies
jest.mock('iron-session', () => ({
    getIronSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        $transaction: jest.fn(),
        transaction: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        rewardTransaction: {
            create: jest.fn(),
        },
        rewardAccount: {
            upsert: jest.fn(),
        },
        transactionHistory: {
            create: jest.fn(),
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

jest.mock('../notifications', () => ({
    createNotification: jest.fn(),
}));

jest.mock('../analytics', () => ({
    logEvent: jest.fn(),
}));

jest.mock('../audit', () => ({
    logAdminAction: jest.fn(),
}));

describe('updateOrderStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return failure if order is not found', async () => {
        requireRole.mockResolvedValue({ id: 'driver-1' });
        prisma.order.findUnique.mockResolvedValue(null);

        const result = await updateOrderStatus('order-1', 'IN_TRANSIT');

        expect(result).toEqual(failure('NOT_FOUND', 'Order not found.'));
        expect(requireRole).toHaveBeenCalledWith(['DRIVER']);
        expect(prisma.order.findUnique).toHaveBeenCalledWith({ where: { id: 'order-1' } });
    });

    it('should require ownership of the order', async () => {
        const order = { id: 'order-1', driverId: 'driver-2', status: 'PICKED_UP' };
        requireRole.mockResolvedValue({ id: 'driver-1' });
        prisma.order.findUnique.mockResolvedValue(order);
        requireOwnership.mockImplementation(() => {
            throw new Error('Unauthorized');
        });

        const result = await updateOrderStatus('order-1', 'IN_TRANSIT');

        // Based on the catch block in updateOrderStatus, it will return a failure
        expect(result).toEqual(failure('UPDATE_FAILED', 'Failed to update order status.'));
        expect(requireOwnership).toHaveBeenCalledWith('driver-2', 'driver-1');
    });

    it('should return failure if transition is invalid', async () => {
        const order = { id: 'order-1', driverId: 'driver-1', status: 'IN_TRANSIT' };
        requireRole.mockResolvedValue({ id: 'driver-1' });
        prisma.order.findUnique.mockResolvedValue(order);
        requireOwnership.mockImplementation(() => {});

        const result = await updateOrderStatus('order-1', 'PICKED_UP');

        expect(result).toEqual(failure('INVALID_STATE', 'Cannot transition from IN_TRANSIT to PICKED_UP.'));
    });

    it('should successfully transition status and call analytics/notifications (non-DELIVERED)', async () => {
        const user = { id: 'driver-1' };
        const order = { id: 'order-1', driverId: 'driver-1', status: 'PICKED_UP', userId: 'user-1' };
        const updatedOrder = { ...order, status: 'IN_TRANSIT' };

        requireRole.mockResolvedValue(user);
        prisma.order.findUnique.mockResolvedValue(order);
        requireOwnership.mockImplementation(() => {});
        prisma.$transaction.mockImplementation(async (callback) => {
            return callback(prisma);
        });
        prisma.order.update.mockResolvedValue(updatedOrder);

        const result = await updateOrderStatus('order-1', 'IN_TRANSIT');

        expect(result).toEqual(success({ order: updatedOrder }));
        expect(prisma.order.update).toHaveBeenCalledWith({
            where: { id: 'order-1', driverId: 'driver-1' },
            data: { status: 'IN_TRANSIT' },
        });

        expect(logEvent).toHaveBeenCalledWith('ORDER_STATUS_TRANSITION', 'order-1', { newStatus: 'IN_TRANSIT' });
        expect(logAdminAction).toHaveBeenCalledWith(
            'ORDER_STATUS_IN_TRANSIT',
            'ORDERS',
            'order-1',
            { driverId: 'driver-1', orderId: 'order-1', previousStatus: 'PICKED_UP', newStatus: 'IN_TRANSIT' }
        );
        expect(createNotification).toHaveBeenCalledWith(
            'user-1',
            'Order Update',
            'Your order status changed to IN_TRANSIT.',
            'SYSTEM',
            '/activity/tracking/order-1'
        );
        expect(revalidatePath).toHaveBeenCalledWith('/driver');
    });

    it('should successfully transition status to DELIVERED and calculate rewards correctly', async () => {
        const user = { id: 'driver-1' };
        const order = { id: 'order-1', driverId: 'driver-1', status: 'IN_TRANSIT', userId: 'user-1', total: 100 };
        const updatedOrder = { ...order, status: 'DELIVERED' };
        const txn = { id: 'txn-1', orderId: 'order-1', amount: 100.55, status: 'PENDING' }; // Points should be 10.06

        requireRole.mockResolvedValue(user);
        prisma.order.findUnique.mockResolvedValue(order);
        requireOwnership.mockImplementation(() => {});
        prisma.$transaction.mockImplementation(async (callback) => {
            return callback(prisma);
        });
        prisma.order.update.mockResolvedValue(updatedOrder);
        prisma.transaction.findFirst.mockResolvedValue(txn);

        const result = await updateOrderStatus('order-1', 'DELIVERED');

        expect(result).toEqual(success({ order: updatedOrder }));

        expect(prisma.transaction.findFirst).toHaveBeenCalledWith({ where: { orderId: 'order-1' } });
        expect(prisma.rewardTransaction.create).toHaveBeenCalledWith({
            data: {
                userId: 'user-1',
                transactionId: 'txn-1',
                type: 'EARN',
                points: 10.06, // 100.55 * 0.1 rounded
                description: 'Earned points for order order-1',
            },
        });
        expect(prisma.rewardAccount.upsert).toHaveBeenCalledWith({
            where: { userId: 'user-1' },
            update: { currentBalance: { increment: 10.06 } },
            create: { userId: 'user-1', currentBalance: 10.06 },
        });
        expect(prisma.transaction.update).toHaveBeenCalledWith({
            where: { id: 'txn-1' },
            data: { status: 'COMPLETED' },
        });
        expect(prisma.transactionHistory.create).toHaveBeenCalledWith({
            data: {
                transactionId: 'txn-1',
                oldStatus: 'PENDING',
                newStatus: 'COMPLETED',
                actorId: 'driver-1',
                reason: 'Order delivered',
            },
        });

        expect(logEvent).toHaveBeenCalledWith('PAYMENT_SUCCEEDED', 'order-1', { amount: 100 });
        expect(logEvent).toHaveBeenCalledWith('ORDER_STATUS_TRANSITION', 'order-1', { newStatus: 'DELIVERED' });
        expect(createNotification).toHaveBeenCalledWith(
            'user-1',
            'Order Update',
            'Your order status changed to DELIVERED.',
            'SYSTEM',
            '/activity/tracking/order-1'
        );
    });

    it('should handle failure during update', async () => {
        requireRole.mockResolvedValue({ id: 'driver-1' });
        prisma.order.findUnique.mockRejectedValue(new Error('Database error'));

        const result = await updateOrderStatus('order-1', 'IN_TRANSIT');

        expect(result).toEqual(failure('UPDATE_FAILED', 'Failed to update order status.'));
    });
});
