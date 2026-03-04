import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function runCheckoutSimulation() {
    console.log("🚀 Starting DB Integrity Checkout Simulation...");
    try {
        // 1. Get the Student
        const student = await prisma.user.findFirst({
            where: { email: '34@outlook.com', role: 'STUDENT' }
        });
        if (!student) throw new Error("Student not found.");
        console.log(`✅ Found Student: ${student.name} (${student.email})`);

        // 2. Get the specific Test Meal
        const meal = await prisma.meal.findFirst({
            where: { name: { contains: 'Smoke Test Supreme Pizza' } },
            include: { merchant: true }
        });
        if (!meal) throw new Error("Smoke Test Meal not found.");
        console.log(`✅ Found Meal: ${meal.name} from Merchant: ${meal.merchant.name}`);

        // 3. Simulate createOrder Logic via Prisma transaction
        const quantity = 1;
        const total = meal.price * quantity;

        const result = await prisma.$transaction(async (tx) => {
            console.log("📦 Creating Order...");
            const order = await tx.order.create({
                data: {
                    service: 'DELIVERY',
                    status: 'PENDING',
                    total: total,
                    details: JSON.stringify({ vendorId: meal.merchant.id, vendor: meal.merchant.name }),
                    userId: student.id,
                    orderItems: {
                        create: [{
                            mealId: meal.id,
                            nameSnapshot: meal.name,
                            basePriceSnapshot: meal.price,
                            qty: quantity
                        }]
                    }
                }
            });

            console.log("💰 Creating Transaction...");
            const txnCode = 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
            const transaction = await tx.transaction.create({
                data: {
                    txnCode,
                    type: 'DELIVERY',
                    status: 'PENDING',
                    userId: student.id,
                    providerId: meal.merchant.id,
                    amount: total,
                    subtotal: total,
                    grandTotal: total,
                    unizyCommissionAmount: total * 0.1, // mock 10%
                    providerNetAmount: total * 0.9,
                }
            });

            await tx.transactionHistory.create({
                data: {
                    transactionId: transaction.id,
                    newStatus: 'PENDING',
                    actorId: student.id,
                    reason: "Simulated Student Checkout"
                }
            });

            return { order, transaction };
        });

        console.log("\n🎉 CHEKOUT SUCCESSFUL!");
        console.log("Order ID:", result.order.id);
        console.log("Transaction ID:", result.transaction.id);
        console.log("Amount:", result.transaction.amount);

    } catch (e) {
        console.error("❌ Simulation Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runCheckoutSimulation();
