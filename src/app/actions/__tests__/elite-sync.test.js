import { authorizePayment, capturePayment } from '../payments';
import { getGlobalFinancialStats } from '../fin-ops';
import { getRewardBalance } from '../rewards-engine';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        transaction: {
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            aggregate: jest.fn(),
        },
        payment: {
            update: jest.fn(),
        },
        ledgerEntry: {
            create: jest.fn(),
            aggregate: jest.fn(),
            groupBy: jest.fn(),
        },
        rewardTransaction: {
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        transactionHistory: {
            create: jest.fn(),
        },
        $transaction: jest.fn(cb => cb(require('@/lib/prisma').prisma)),
    },
}));

jest.mock('../auth', () => ({
    getCurrentUser: jest.fn().mockResolvedValue({ id: 'admin1', role: 'ADMIN_SUPER' }),
}));

describe('Elite Sync Integration', () => {
    const mockTxn = {
        id: 'txn1',
        txnCode: 'TXN-A+',
        userId: 'user1',
        providerId: 'merchant1',
        amount: 1000,
        status: 'AUTHORIZED',
        payments: [{ id: 'pay1' }],
        unizyCommissionAmount: 100,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should split gross amount into Tax, Fee, Net and Revenue on capture', async () => {
        prisma.transaction.findUnique.mockResolvedValue(mockTxn);
        prisma.user.findUnique.mockResolvedValue({ id: 'user1', tier: 'BRONZE' });
        prisma.rewardTransaction.findFirst.mockResolvedValue({ id: 'rew1', points: 100 });

        const result = await capturePayment('txn1');

        expect(result.success).toBe(true);

        // Verification of Ledger Splits (recordSplitEntry)
        // 1 Master Debit (Escrow) + 3 Splits (Tax, Fee, Profit) + 1 Net (Merchant) = 5 entries
        expect(prisma.ledgerEntry.create).toHaveBeenCalledTimes(5);

        // Verify Specific Splits
        const createdEntries = prisma.ledgerEntry.create.mock.calls.map(call => call[0].data);

        // Master Debit
        expect(createdEntries).toContainEqual(expect.objectContaining({ accountType: 'UNIZY_ESCROW', amount: -1000 }));

        // Tax (14%)
        expect(createdEntries).toContainEqual(expect.objectContaining({ accountType: 'TAX_VAT', amount: 140 }));

        // Platform Fee (5%)
        expect(createdEntries).toContainEqual(expect.objectContaining({ accountType: 'PLATFORM_FEE', amount: 50 }));

        // Revenue (Calculated or Set)
        expect(createdEntries).toContainEqual(expect.objectContaining({ accountType: 'UNIZY_REVENUE', amount: 100 }));

        // Merchant Net (1000 - 140 - 50 - 100 = 710)
        expect(createdEntries).toContainEqual(expect.objectContaining({ accountType: 'MERCHANT_PAYABLE', amount: 710 }));
    });

    it('should finalize rewards and trigger tier promotion check', async () => {
        prisma.transaction.findUnique.mockResolvedValue(mockTxn);
        prisma.user.findUnique.mockResolvedValue({ id: 'user1', tier: 'BRONZE' });
        prisma.rewardTransaction.findFirst.mockResolvedValue({ id: 'rew1', points: 100 });
        prisma.transaction.aggregate.mockResolvedValue({ _sum: { amount: 6000 } }); // Triggers Platinum threshold

        await capturePayment('txn1');

        // Check if rewards were finalized (updated from Provisioned)
        expect(prisma.rewardTransaction.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'rew1' },
            data: expect.objectContaining({ expired: false })
        }));

        // Check for dynamic promotion to PLATINUM
        expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'user1' },
            data: { tier: 'PLATINUM' }
        }));
    });
});
