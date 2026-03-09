import { prisma } from './prisma';

/**
 * Account Types for the Elite Ledger
 */
export const LedgerAccount = {
    USER_WALLET: 'USER_WALLET',
    UNIZY_ESCROW: 'UNIZY_ESCROW',
    UNIZY_REVENUE: 'UNIZY_REVENUE',
    MERCHANT_PAYABLE: 'MERCHANT_PAYABLE',
    DRIVER_PAYABLE: 'DRIVER_PAYABLE',
    COURIER_PAYABLE: 'COURIER_PAYABLE',
    SYSTEM_CASH: 'SYSTEM_CASH', // For cash/COD payments
    TAX_VAT: 'TAX_VAT', // For tax collection
    PLATFORM_FEE: 'PLATFORM_FEE' // For specialized platform fees
};

/**
 * recordLedgerEntry (Double-Entry Logic)
 * 
 * Every financial movement must have a DEBIT and a CREDIT.
 */
export async function recordLedgerEntry({
    amount,
    debitAccount,
    creditAccount,
    description,
    transactionId,
    tx = prisma
}) {
    if (amount <= 0) throw new Error('Ledger amount must be positive.');

    // Use transaction if provided, otherwise default to prisma
    const ledgerDebit = await tx.ledgerEntry.create({
        data: {
            amount: -amount,
            type: 'DEBIT',
            accountType: debitAccount,
            description,
            transactionId
        }
    });

    const ledgerCredit = await tx.ledgerEntry.create({
        data: {
            amount: amount,
            type: 'CREDIT',
            accountType: creditAccount,
            description,
            transactionId
        }
    });

    return { debit: ledgerDebit, credit: ledgerCredit };
}

/**
 * recordSplitEntry (Elite Multi-Account Logic)
 * 
 * Handles one DEBIT against multiple CREDITS (e.g., Gross -> Net + Tax + Fee).
 * Ensures mathematical balance (Sum of Debits == Sum of Credits).
 * 
 * @param {object} params
 * @param {string} params.debitAccount
 * @param {Array<{account: string, amount: number}>} params.credits - Array of credit splits
 */
export async function recordSplitEntry({
    debitAccount,
    credits,
    description,
    transactionId,
    tx = prisma
}) {
    const totalCredit = credits.reduce((sum, c) => sum + c.amount, 0);
    if (totalCredit <= 0) throw new Error('Total split amount must be positive.');

    const entries = [];

    // 1. Create the single master DEBIT
    entries.push(await tx.ledgerEntry.create({
        data: {
            amount: -totalCredit,
            type: 'DEBIT',
            accountType: debitAccount,
            description: `${description} (Master Debit)`,
            transactionId
        }
    }));

    // 2. Create the multiple CREDITS
    for (const split of credits) {
        entries.push(await tx.ledgerEntry.create({
            data: {
                amount: split.amount,
                type: 'CREDIT',
                accountType: split.account,
                description: `${description} (Split: ${split.account})`,
                transactionId
            }
        }));
    }

    return entries;
}
