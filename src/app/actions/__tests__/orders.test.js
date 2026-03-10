import { createOrder, triggerSOS, getMerchantOrders, updateMerchantOrderStatus, acceptOrder, getStudentOrders, getRideEstimate, getDriverOrders, updateOrderStatus } from '../orders';
import { prisma } from '@/lib/prisma';
import { requireRole, requireOwnership } from '@/lib/authz';
import { generateTxnCode, computeCommissionSnapshot, computePricingSnapshot } from '../financial';
import { logEvent } from '../analytics';
import { createNotification } from '../notifications';
import { logAdminAction } from '../audit';
import { revalidatePath } from 'next/cache';
import { failure, success } from '@/lib/actionResult';
import { authorizePayment, capturePayment } from '../payments';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        order: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
        pricingRule: {
            findFirst: jest.fn(),
        },
        $transaction: jest.fn(),
        supportTicket: {
            create: jest.fn(),
        },
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

jest.mock('iron-session', () => ({
    getIronSession: jest.fn(),
}));

jest.mock('@/lib/authz', () => ({
    requireRole: jest.fn(),
    requireOwnership: jest.fn(),
}));

jest.mock('../financial', () => ({
    generateTxnCode: jest.fn(),
    computeCommissionSnapshot: jest.fn(),
    computePricingSnapshot: jest.fn(),
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
    __esModule: true,
    logAdminAction: jest.fn(),
}));

jest.mock('../referrals', () => ({
    completeReferralIfEligible: jest.fn(),
}));

jest.mock('../payments', () => ({
    __esModule: true,
    authorizePayment: jest.fn().mockResolvedValue({ success: true }),
    capturePayment: jest.fn().mockResolvedValue({ success: true }),
}));

beforeEach(() => {
    jest.resetAllMocks();
    // Set default implementations for common mocks that should succeed by default
    requireRole.mockResolvedValue({ id: 'user-1', role: 'STUDENT' });
    requireOwnership.mockImplementation(() => true);
    authorizePayment.mockResolvedValue({ success: true });
    capturePayment.mockResolvedValue({ success: true });
});

describe('createOrder', () => {

    it('should return failure if user does not have STUDENT role', async () => {
        requireRole.mockRejectedValue(new Error('Unauthorized'));

        const result = await createOrder('TRANSPORT', {}, 50);

        expect(result).toEqual({
            ok: false,
            success: false,
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
            success: false,
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
            success: true,
            data: {
                order: mockOrder,
                transaction: mockTxn,
            }
        });
        expect(prisma.$transaction).toHaveBeenCalled();
        // Since `result.success` is probably undefined (it's `result.ok`), logEvent won't be called.
        // I'll fix this in the source code as well.
        expect(logEvent).toHaveBeenCalledWith('ORDER_CREATED', 'order-1', { service: 'TRANSPORT', total: 50 });
        expect(logEvent).toHaveBeenCalledWith('PAYMENT_AUTHORIZED', 'order-1', { amount: 50 });
        expect(createNotification).toHaveBeenCalledWith('user-1', 'Order Placed', 'Your transport order has been placed.', 'SYSTEM', '/activity/tracking/order-1');
    });

    it('should handle errors thrown during order creation', async () => {
        requireRole.mockResolvedValue({ id: 'user-1' });
        prisma.order.findFirst.mockRejectedValue(new Error('Database error'));

        const result = await createOrder('TRANSPORT', {}, 50);

        expect(result).toEqual({
            ok: false,
            success: false,
            error: {
                code: 'CREATE_FAILED',
                message: 'Database error',
            }
        });
    });
});
describe('triggerSOS', () => {
    const mockOrderId = 'order-123';
    const mockUser = { id: 'user-456' };
    const mockTicket = { id: 'ticket-789', subject: `EMERGENCY ALERT: Order ${mockOrderId}` };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default successful mock responses
        requireRole.mockResolvedValue(mockUser);
        prisma.supportTicket.create.mockResolvedValue(mockTicket);

        // Mock console.error to keep test output clean during expected error tests
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it('should successfully create an SOS ticket and return { success: true, ticket }', async () => {
        const result = await triggerSOS(mockOrderId);

        // Verify requireRole was called with correct roles
        expect(requireRole).toHaveBeenCalledWith(['STUDENT', 'DRIVER']);

        // Verify prisma.supportTicket.create was called with correct data
        expect(prisma.supportTicket.create).toHaveBeenCalledWith({
            data: {
                subject: `EMERGENCY ALERT: Order ${mockOrderId}`,
                category: 'SAFETY',
                priority: 'HIGH',
                status: 'OPEN',
                userId: mockUser.id,
            },
        });

        // Verify successful return value
        expect(result).toEqual({ success: true, ticket: mockTicket });
    });

    it('should return error object when requireRole throws (e.g., unauthorized)', async () => {
        const authError = new Error('Unauthorized');
        requireRole.mockRejectedValue(authError);

        const result = await triggerSOS(mockOrderId);

        // Verify authz was checked
        expect(requireRole).toHaveBeenCalledWith(['STUDENT', 'DRIVER']);

        // Verify prisma was NOT called
        expect(prisma.supportTicket.create).not.toHaveBeenCalled();

        // Verify console.error was called with the caught error
        expect(console.error).toHaveBeenCalledWith('Failed to trigger SOS:', authError);

        // Verify error return value
        expect(result).toEqual({ error: 'Failed to trigger SOS.' });
    });

    it('should return error object when prisma.supportTicket.create throws a database error', async () => {
        const dbError = new Error('Database connection failed');
        prisma.supportTicket.create.mockRejectedValue(dbError);

        const result = await triggerSOS(mockOrderId);

        // Verify requireRole was called
        expect(requireRole).toHaveBeenCalledWith(['STUDENT', 'DRIVER']);

        // Verify prisma was called
        expect(prisma.supportTicket.create).toHaveBeenCalled();

        // Verify console.error was called with the caught error
        expect(console.error).toHaveBeenCalledWith('Failed to trigger SOS:', dbError);

        // Verify error return value
        expect(result).toEqual({ error: 'Failed to trigger SOS.' });
    });
});
describe('getMerchantOrders', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Suppress console.error in tests
        jest.spyOn(console, 'error').mockImplementation(() => { });
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
        expect(createNotification).toHaveBeenCalledWith('user-456', 'Order Update', 'The merchant has accepted your order and is starting to prepare it.', 'SYSTEM', '/activity/tracking/order-123');
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

describe('acceptOrder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully accept an order when status is READY and driver is assigned', async () => {
        const mockDriver = { id: 'driver-123', isOnline: true };
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
        const mockDriver = { id: 'driver-123', isOnline: true };
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
        const mockDriver = { id: 'driver-123', isOnline: true };
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
        const mockDriver = { id: 'driver-123', isOnline: true };
        requireRole.mockResolvedValue(mockDriver);
        prisma.order.updateMany.mockRejectedValue(new Error('DB Error'));

        const result = await acceptOrder('order-123');

        expect(result).toEqual(failure('ACCEPT_FAILED', 'Failed to accept order.'));
    });
});

describe('orders action - getStudentOrders', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress console.error during tests to keep output clean
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
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
        expect(requireRole).toHaveBeenCalledWith(['STUDENT', 'GUEST']);
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
        expect(requireRole).toHaveBeenCalledWith(['STUDENT', 'GUEST']);
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
        expect(requireRole).toHaveBeenCalledWith(['STUDENT', 'GUEST']);
        expect(prisma.order.findMany).toHaveBeenCalled();
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch orders:', error);
        expect(result).toEqual([]);
    });
});

describe('getRideEstimate', () => {
    let mathRandomSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock Math.random() to return 0.5 so multiplier is 1 + (0.5 * 0.5) = 1.25
        mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        mathRandomSpy.mockRestore();
    });

    it('should use fallback pricing for known vehicle when no active pricing rule exists', async () => {
        prisma.pricingRule.findFirst.mockResolvedValue(null);

        const result = await getRideEstimate('A', 'B', 'Standard');

        expect(prisma.pricingRule.findFirst).toHaveBeenCalledWith({
            where: { module: 'TRANSPORT', isActive: true, serviceType: 'Standard' }
        });
        // Base is 45, multiplier is 1.25 -> 45 * 1.25 = 56.25 -> ceil = 57
        expect(result).toEqual({ success: true, price: 57 });
    });

    it('should use 50 as default fallback when unknown vehicle is provided', async () => {
        prisma.pricingRule.findFirst.mockResolvedValue(null);

        const result = await getRideEstimate('A', 'B', 'Spaceship');

        expect(prisma.pricingRule.findFirst).toHaveBeenCalledWith({
            where: { module: 'TRANSPORT', isActive: true, serviceType: 'Spaceship' }
        });
        // Base is 50, multiplier is 1.25 -> 50 * 1.25 = 62.5 -> ceil = 63
        expect(result).toEqual({ success: true, price: 63 });
    });

    it('should use pricing rule basePrice when available', async () => {
        prisma.pricingRule.findFirst.mockResolvedValue({
            id: 'rule_1',
            basePrice: 100
        });

        const result = await getRideEstimate('A', 'B', 'Standard');

        // Base is 100, multiplier is 1.25 -> 100 * 1.25 = 125 -> ceil = 125
        expect(result).toEqual({ success: true, price: 125 });
    });

    it('should fallback to basePrices if pricingRule is found but basePrice is missing', async () => {
        prisma.pricingRule.findFirst.mockResolvedValue({
            id: 'rule_2'
            // basePrice missing
        });

        const result = await getRideEstimate('A', 'B', 'Scooter');

        // Base is 25, multiplier is 1.25 -> 25 * 1.25 = 31.25 -> ceil = 32
        expect(result).toEqual({ success: true, price: 32 });
    });

    it('should catch errors and return a failure object when DB query fails', async () => {
        // Suppress console.error in tests
        jest.spyOn(console, 'error').mockImplementation(() => { });
        prisma.pricingRule.findFirst.mockRejectedValue(new Error('DB connection failed'));

        const result = await getRideEstimate('A', 'B', 'Premium');

        expect(result).toEqual({ success: false, error: 'Failed to get ride estimate.' });
        expect(console.error).toHaveBeenCalledWith('Failed to get ride estimate:', expect.any(Error));
    });
});

describe('getDriverOrders', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully fetch orders for a valid driver', async () => {
        // Arrange
        const mockUser = { id: 'driver-123', isOnline: true };
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
        expect(result).toEqual([]);
    });

    it('should return an empty array and log error when prisma.order.findMany fails (database error)', async () => {
        // Arrange
        const mockUser = { id: 'driver-123', isOnline: true };
        requireRole.mockResolvedValue(mockUser);

        const dbError = new Error('Database connection failed');
        prisma.order.findMany.mockRejectedValue(dbError);

        // Act
        const result = await getDriverOrders();

        // Assert
        expect(requireRole).toHaveBeenCalledWith(['DRIVER']);
        expect(prisma.order.findMany).toHaveBeenCalled();
        expect(result).toEqual([]);
    });
});

describe('updateOrderStatus', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return failure if order is not found', async () => {
        requireRole.mockResolvedValue({ id: 'driver-1' });
        prisma.order.findUnique.mockResolvedValue(null);

        const result = await updateOrderStatus('order-1', 'IN_TRANSIT');

        expect(result).toEqual(failure('NOT_FOUND', 'Order not found.'));
        expect(requireRole).toHaveBeenCalledWith(['DRIVER', 'ADMIN_OPERATIONS', 'ADMIN_SUPER']);
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
        requireOwnership.mockImplementation(() => { });

        const result = await updateOrderStatus('order-1', 'PICKED_UP');

        expect(result).toEqual(failure('INVALID_STATE', 'Cannot transition from IN_TRANSIT to PICKED_UP.'));
    });

    it('should successfully transition status and call analytics/notifications (non-DELIVERED)', async () => {
        const user = { id: 'driver-1' };
        const order = { id: 'order-1', driverId: 'driver-1', status: 'PICKED_UP', userId: 'user-1' };
        const updatedOrder = { ...order, status: 'IN_TRANSIT' };

        requireRole.mockResolvedValue(user);
        prisma.order.findUnique.mockResolvedValue(order);
        requireOwnership.mockImplementation(() => { });
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
        const order = { id: 'order-1', driverId: 'driver-1', status: 'IN_TRANSIT', userId: 'user-1', total: 100, service: 'DELIVERY', deliveryOTP: '123456', failedOtpAttempts: 0 };
        const updatedOrder = { ...order, status: 'DELIVERED' };
        const txn = { id: 'txn-1', orderId: 'order-1', amount: 100.55, status: 'PENDING' }; // Points should be 10.06

        requireRole.mockResolvedValue(user);
        prisma.order.findUnique.mockResolvedValue(order);
        requireOwnership.mockImplementation(() => { });
        prisma.$transaction.mockImplementation(async (callback) => {
            return callback(prisma);
        });
        prisma.order.update.mockResolvedValue(updatedOrder);
        prisma.transaction.findFirst.mockResolvedValue(txn);

        const result = await updateOrderStatus('order-1', 'DELIVERED', '123456');

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
        expect(capturePayment).toHaveBeenCalledWith('txn-1');

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
