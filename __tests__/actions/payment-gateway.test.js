import crypto from 'crypto';
import { confirmPayment } from '@/app/actions/payment-gateway';
import { prisma } from '@/lib/prisma';
import { earnRewardPoints } from '@/app/actions/rewards-engine';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        payment: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        transaction: {
            update: jest.fn(),
        },
        transactionHistory: {
            create: jest.fn(),
        },
    },
}));

jest.mock('@/app/actions/rewards-engine', () => ({
    earnRewardPoints: jest.fn(),
}));

jest.mock('@/app/actions/audit', () => ({
    logAdminAction: jest.fn(),
}));

jest.mock('@/app/actions/auth', () => ({
    getCurrentUser: jest.fn(),
}));

describe('Payment Gateway Webhook Security', () => {
    const originalEnv = process.env;
    const testSecret = 'test-secret-123';
    const paymentId = 'pay-123';
    const gatewayRef = 'ref-abc';
    const success = true;
    const failureReason = null;

    beforeEach(() => {
        jest.resetAllMocks();
        process.env = { ...originalEnv, PAYMENT_WEBHOOK_SECRET: testSecret };

        // Default mock implementation
        prisma.payment.findUnique.mockResolvedValue({
            id: paymentId,
            status: 'PENDING',
            transactionId: 'txn-123',
            amount: 100,
            gatewayProvider: 'PAYMOB',
            transaction: {
                status: 'PENDING',
                userId: 'user-123',
            },
        });
        prisma.payment.update.mockResolvedValue({});
        prisma.transaction.update.mockResolvedValue({});
        prisma.transactionHistory.create.mockResolvedValue({});
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    function generateSignature(id, ref, isSuccess, reason, secretToUse = testSecret) {
        const payload = `${id}:${ref}:${isSuccess}:${reason || ''}`;
        return crypto.createHmac('sha256', secretToUse).update(payload).digest('hex');
    }

    it('should reject requests if PAYMENT_WEBHOOK_SECRET is missing', async () => {
        delete process.env.PAYMENT_WEBHOOK_SECRET;

        const result = await confirmPayment(paymentId, gatewayRef, success, failureReason, 'any-signature');

        expect(result).toEqual({ error: 'Webhook configuration error' });
        expect(prisma.payment.findUnique).not.toHaveBeenCalled();
    });

    it('should reject requests without a signature', async () => {
        const result = await confirmPayment(paymentId, gatewayRef, success, failureReason, null);

        expect(result).toEqual({ error: 'Missing webhook signature' });
        expect(prisma.payment.findUnique).not.toHaveBeenCalled();
    });

    it('should reject requests with an invalid signature', async () => {
        const invalidSignature = 'invalid-signature-1234567890abcdef1234567890abcdef1234567890abcde';

        const result = await confirmPayment(paymentId, gatewayRef, success, failureReason, invalidSignature);

        expect(result).toEqual({ error: 'Invalid webhook signature' });
        expect(prisma.payment.findUnique).not.toHaveBeenCalled();
    });

    it('should reject requests with an invalid signature length', async () => {
        const shortSignature = 'short';

        const result = await confirmPayment(paymentId, gatewayRef, success, failureReason, shortSignature);

        expect(result).toEqual({ error: 'Invalid webhook signature' });
        expect(prisma.payment.findUnique).not.toHaveBeenCalled();
    });

    it('should accept requests with a valid signature', async () => {
        const signature = generateSignature(paymentId, gatewayRef, success, failureReason);

        const result = await confirmPayment(paymentId, gatewayRef, success, failureReason, signature);

        expect(result).toEqual({ success: true, status: 'PAID' });
        expect(prisma.payment.findUnique).toHaveBeenCalledWith({
            where: { id: paymentId },
            include: { transaction: true },
        });
        expect(prisma.payment.update).toHaveBeenCalled();
        expect(prisma.transaction.update).toHaveBeenCalled();
    });

    it('should accept failed payment requests with a valid signature', async () => {
        const isSuccess = false;
        const reason = 'Insufficient funds';
        const signature = generateSignature(paymentId, gatewayRef, isSuccess, reason);

        const result = await confirmPayment(paymentId, gatewayRef, isSuccess, reason, signature);

        expect(result).toEqual({ success: true, status: 'FAILED' });
        expect(prisma.payment.findUnique).toHaveBeenCalledWith({
            where: { id: paymentId },
            include: { transaction: true },
        });
        expect(prisma.payment.update).toHaveBeenCalled();
        expect(prisma.transaction.update).not.toHaveBeenCalled();
    });
});
