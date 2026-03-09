const { authorizePayment, capturePayment } = require('./src/app/actions/payments');
const { getGlobalFinancialStats } = require('./src/app/actions/fin-ops');
const { getRewardBalance } = require('./src/app/actions/rewards-engine');
const { prisma } = require('./src/lib/prisma');

async function testEliteSync() {
    console.log('🚀 Starting Elite Sync Verification...');

    // 1. Setup Mock Data
    const user = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!user) {
        console.error('❌ No student user found for test.');
        return;
    }

    const provider = await prisma.user.findFirst({ where: { role: 'MERCHANT' } });

    // Create a mock transaction for 1000 EGP
    const txn = await prisma.transaction.create({
        data: {
            userId: user.id,
            providerId: provider?.id,
            amount: 1000,
            txnCode: `ELITE-TEST-${Date.now()}`,
            module: 'MEALS',
            status: 'PENDING',
            unizyCommissionAmount: 100 // 10% profit
        }
    });

    console.log(`✅ Created Test Txn: ${txn.txnCode} for 1000 EGP`);

    // 2. Authorize
    console.log('--- Phase 1: Authorization ---');
    const authRes = await authorizePayment(txn.id);
    if (authRes.success) {
        console.log('✅ Payment Authorized.');
        const rewards = await prisma.rewardTransaction.findFirst({
            where: { transactionId: txn.id, type: 'EARN' }
        });
        console.log(`🎁 Rewards Provisioned: ${rewards?.points} PTS (Status: Provisioned)`);
    } else {
        console.error('❌ Auth Failed:', authRes.error);
    }

    // 3. Capture
    console.log('--- Phase 2: Capture & Split ---');
    const captureRes = await capturePayment(txn.id);
    if (captureRes.success) {
        console.log('✅ Payment Captured & Ledger Splits Recorded.');

        const ledger = await prisma.ledgerEntry.findMany({ where: { transactionId: txn.id } });
        console.log(`📊 Ledger Splits Created: ${ledger.length} entries`);
        ledger.forEach(e => console.log(`   - ${e.accountType}: ${e.amount} EGP (${e.type})`));

        const finalizedRewards = await prisma.rewardTransaction.findFirst({
            where: { transactionId: txn.id, type: 'EARN' }
        });
        console.log(`🎁 Rewards Finalized: ${finalizedRewards?.points} PTS (Active)`);
    } else {
        console.error('❌ Capture Failed:', captureRes.error);
    }

    // 4. Fin-Ops Analytics
    console.log('--- Phase 3: Fin-Ops Verification ---');
    const statsRes = await getGlobalFinancialStats();
    if (statsRes.success) {
        console.log('💹 Global Financial Snapshot:');
        console.log(`   - Gross Volume: ${statsRes.stats.grossVolume}`);
        console.log(`   - Net Profit:   ${statsRes.stats.totalProfit}`);
        console.log(`   - Tax Liability: ${statsRes.stats.taxLiabilities}`);
    }

    console.log('🚀 Elite Sync Verification Complete.');
}

// Note: This script is designed for architectural verification. 
// In a real environment, it would be run via a secure runner or test suite.
testEliteSync().catch(console.error);
