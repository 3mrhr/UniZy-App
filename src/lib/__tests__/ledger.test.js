import { recordLedgerEntry, LedgerAccount } from '../ledger';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        ledgerEntry: {
            create: jest.fn(),
        },
    },
}));

describe('Ledger Library', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create balanced debit and credit entries', async () => {
        const amount = 100;
        const debitAccount = LedgerAccount.USER_WALLET;
        const creditAccount = LedgerAccount.UNIZY_ESCROW;
        const description = 'Test Transaction';
        const transactionId = 'txn_123';

        prisma.ledgerEntry.create.mockImplementation(({ data }) => Promise.resolve({ id: 'id', ...data }));

        const result = await recordLedgerEntry({
            amount,
            debitAccount,
            creditAccount,
            description,
            transactionId
        });

        expect(prisma.ledgerEntry.create).toHaveBeenCalledTimes(2);

        // Verify Debit
        expect(prisma.ledgerEntry.create).toHaveBeenCalledWith({
            data: {
                amount: -100,
                type: 'DEBIT',
                accountType: debitAccount,
                description,
                transactionId
            }
        });

        // Verify Credit
        expect(prisma.ledgerEntry.create).toHaveBeenCalledWith({
            data: {
                amount: 100,
                type: 'CREDIT',
                accountType: creditAccount,
                description,
                transactionId
            }
        });

        expect(result.debit.amount).toBe(-100);
        expect(result.credit.amount).toBe(100);
    });

    it('should throw error if amount is non-positive', async () => {
        await expect(recordLedgerEntry({
            amount: 0,
            debitAccount: LedgerAccount.USER_WALLET,
            creditAccount: LedgerAccount.UNIZY_ESCROW
        })).rejects.toThrow('Ledger amount must be positive.');

        await expect(recordLedgerEntry({
            amount: -50,
            debitAccount: LedgerAccount.USER_WALLET,
            creditAccount: LedgerAccount.UNIZY_ESCROW
        })).rejects.toThrow('Ledger amount must be positive.');
    });

    it('should use the provided transaction client (atomic)', async () => {
        const mockTx = {
            ledgerEntry: {
                create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'id', ...data }))
            }
        };

        await recordLedgerEntry({
            amount: 50,
            debitAccount: LedgerAccount.USER_WALLET,
            creditAccount: LedgerAccount.UNIZY_ESCROW,
            tx: mockTx
        });

        expect(mockTx.ledgerEntry.create).toHaveBeenCalledTimes(2);
        expect(prisma.ledgerEntry.create).not.toHaveBeenCalled();
    });
});
