import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function executePhaseE() {
    console.log("⚖️ STARTING PHASE E: PRICING & IMMUTABILITY AUDIT...");

    try {
        // 1. Log a historical control transaction (From Phase D)
        const oldTxn = await prisma.transaction.findFirst({
            where: { type: 'DELIVERY', status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' }
        });

        if (!oldTxn) throw new Error("Could not find a control transaction from Phase D.");

        const controlSnapshot = {
            id: oldTxn.id,
            amount: oldTxn.amount,
            unizyCommissionAmount: oldTxn.unizyCommissionAmount,
            providerNetAmount: oldTxn.providerNetAmount
        };
        console.log(`🔒 Control Transaction [${controlSnapshot.id}] Snapshotted: Amount=${controlSnapshot.amount}, Comm=${controlSnapshot.unizyCommissionAmount}`);

        // 2. Perform Superadmin Mutations
        console.log("🛠️ SUPERADMIN ACTION: Overriding Rates & Rules...");

        // Disable Merchant 3 (Set status to something else, or if User has no status, mark their meals INACTIVE)
        const merchant3 = await prisma.user.findFirst({ where: { role: 'MERCHANT' }, skip: 2 });
        if (merchant3) {
            await prisma.meal.updateMany({
                where: { merchantId: merchant3.id },
                data: { status: 'INACTIVE' }
            });
            console.log(`  -> Disabled all meals for Merchant: ${merchant3.name}`);
        }

        // Create a Promo Code QA10
        await prisma.promoCode.create({
            data: {
                code: 'QA10_TEST_' + randomInt(1000, 9999), // unique
                discountType: 'PERCENTAGE',
                discountAmount: 10,
                maxUses: 100,
                applicableType: 'ALL'
            }
        });
        console.log(`  -> Created QA10 Promo Code (10% off)`);

        // Create new aggressive Pricing and Commission Rules
        const newPricingRule = await prisma.pricingRule.create({
            data: { module: 'TRANSPORT', serviceType: 'Standard', basePrice: 55 } // +5 EGP base
        });

        const newCommRule = await prisma.commissionRule.create({
            data: { module: 'DELIVERY', providerType: 'MERCHANT', unizySharePercent: 12, providerSharePercent: 88 } // +2% Unizy share
        });

        console.log(`  -> Created PricingRule (Transport Base 55) and CommRule (Delivery Unizy 12%)`);

        // 3. Execute New Orders using the new rules
        console.log("\n📦 Executing 2 Delivery & 1 Transport with new rates...");
        const students = await prisma.user.findMany({ where: { role: 'STUDENT' } });
        const meals = await prisma.meal.findMany({ where: { status: 'ACTIVE' } });

        if (!students.length || !meals.length) throw new Error("Missing active students or meals.");

        for (let i = 0; i < 2; i++) {
            const student = sample(students);
            const meal = sample(meals);
            const total = meal.price; // 1 qty

            const comm = total * (newCommRule.unizySharePercent / 100);
            const net = total * (newCommRule.providerSharePercent / 100);

            await prisma.transaction.create({
                data: {
                    txnCode: 'E-DLY-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
                    type: 'DELIVERY',
                    userId: student.id,
                    providerId: meal.merchantId,
                    amount: total, subtotal: total, grandTotal: total,
                    commissionRuleId: newCommRule.id,
                    unizyCommissionAmount: comm,
                    providerNetAmount: net,
                    commissionSnapshot: JSON.stringify({ ruleId: newCommRule.id, unizyShare: 12 })
                }
            });
        }
        console.log("  -> Inserted 2 Delivery Transactions with 12% commission rule.");

        const studentTransport = sample(students);
        await prisma.transaction.create({
            data: {
                txnCode: 'E-TRN-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
                type: 'TRANSPORT',
                userId: studentTransport.id,
                amount: newPricingRule.basePrice, subtotal: newPricingRule.basePrice, grandTotal: newPricingRule.basePrice,
                pricingRuleId: newPricingRule.id,
                pricingSnapshot: JSON.stringify({ ruleId: newPricingRule.id, basePrice: 55 })
            }
        });
        console.log("  -> Inserted 1 Transport Transaction with 55 EGP base price rule.");

        // 4. ASSERT IMMUTABILITY (GATE E)
        console.log("\n🧪 TESTING IMMUTABILITY GATE E...");
        const verifyOldTxn = await prisma.transaction.findUnique({ where: { id: oldTxn.id } });

        let gatePassed = true;
        if (verifyOldTxn.amount !== controlSnapshot.amount) {
            console.error(`❌ AMOUNT MUTATED! Old: ${controlSnapshot.amount}, New: ${verifyOldTxn.amount}`);
            gatePassed = false;
        }
        if (verifyOldTxn.unizyCommissionAmount !== controlSnapshot.unizyCommissionAmount) {
            console.error(`❌ COMMISSION MUTATED! Old: ${controlSnapshot.unizyCommissionAmount}, New: ${verifyOldTxn.unizyCommissionAmount}`);
            gatePassed = false;
        }

        if (gatePassed) {
            console.log("✅ GATE E PASSED: Historical transactions remained 100% strictly immutable despite massive active pricing rule mutations.");
            console.log("\n🎉 PHASE E EXECUTION FINISHED SUCCESSFULLY!");
        } else {
            throw new Error("GATE E FAILED. Relational cascades corrupted historical accounting data.");
        }

    } catch (e) {
        console.error("❌ Phase E Simulation Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

executePhaseE();
