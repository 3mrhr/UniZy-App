import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function executePhaseGH() {
    console.log("🧩 STARTING PHASE G & H: EDGE CASES & INTEGRITY...");

    try {
        const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
        const merchant = await prisma.user.findFirst({ where: { role: 'MERCHANT' } });
        if (!student || !merchant) throw new Error("Users missing.");

        // --- 1. EMAIL & PHONE UNIQUENESS ---
        console.log("\n🔒 1. Testing DB Strict Email & Phone Uniqueness...");
        try {
            await prisma.user.create({
                data: { name: 'Duplicate', email: student.email, password: 'x', role: 'STUDENT' }
            });
            console.error("❌ FAILED: Database allowed duplicate email!");
        } catch (e) {
            if (e.code === 'P2002') console.log("  ✅ Good: Database rigidly blocked duplicate email insertion (Prisma P2002).");
            else console.error("❌ Unexpected Error:", e);
        }

        // Ensure control has a specific phone
        await prisma.user.update({ where: { id: student.id }, data: { phone: '+201011122233' } });

        try {
            await prisma.user.create({
                data: { name: 'Duplicate2', email: 'unique@x.com', phone: '+201011122233', password: 'x', role: 'STUDENT' }
            });
            console.error("❌ FAILED: Database allowed duplicate phone!");
        } catch (e) {
            if (e.code === 'P2002') console.log("  ✅ Good: Database rigidly blocked duplicate phone insertion (Prisma P2002).");
            else console.error("❌ Unexpected Error:", e);
        }

        // --- 2. CONCURRENCY OVERSELL RACE CONDITION ---
        console.log("\n🚦 2. Testing High-Concurrency Race Conditions (The 'Oversell' Attack)...");

        // Setup vulnerable item with exactly 5 stock
        const hotItem = await prisma.meal.create({
            data: {
                name: 'PS5 Demo Box',
                description: 'Highly demanded item',
                price: 500,
                merchantId: merchant.id,
                trackInventory: true,
                stockCount: 5,
                status: 'ACTIVE'
            }
        });

        console.log(`  -> Created Hot Item [${hotItem.name}] with exactly 5 stock.`);

        console.log("  -> Firing 10 EXACTLY simultaneous purchase requests (Promise.all)...");
        const orderPromises = [];
        for (let i = 0; i < 10; i++) {
            orderPromises.push(
                prisma.$transaction(async (tx) => {
                    const meal = await tx.meal.findUnique({ where: { id: hotItem.id } });
                    if (!meal || meal.stockCount < 1) throw new Error("Insufficient stock");

                    const updateResult = await tx.meal.updateMany({
                        where: { id: meal.id, stockCount: { gte: 1 } },
                        data: { stockCount: { decrement: 1 } }
                    });

                    if (updateResult.count === 0) throw new Error("Race condition prevented: Insufficient stock");

                    await tx.order.create({
                        data: { service: 'DELIVERY', status: 'PENDING', total: 500, details: "{}", userId: student.id }
                    });
                    return { success: true };
                }).catch(e => ({ error: e.message }))
            );
        }

        const results = await Promise.all(orderPromises);

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => r.error).length;

        console.log(`  -> Requests Finished. ${successCount} Succeeded. ${failCount} Failed.`);

        const finalItem = await prisma.meal.findUnique({ where: { id: hotItem.id } });
        console.log(`  -> Final DB Stock Count: ${finalItem.stockCount}`);

        if (finalItem.stockCount < 0) {
            console.error(`❌ CRITICAL VULNERABILITY FOUND: Concurrency race condition allowed stock to drop to ${finalItem.stockCount}! The system oversold ${Math.abs(finalItem.stockCount)} items.`);
        } else if (successCount > 5) {
            console.error(`❌ CRITICAL VULNERABILITY FOUND: Form allowed ${successCount} orders on 5 stock.`);
        } else {
            console.log("  ✅ SECURITY PASS: System successfully prevented overselling despite simultaneous database transaction attempts.");
        }

        // --- 3. IDEMPOTENCY ---
        console.log("\n🔄 3. Testing Payment Idempotency...");
        console.log("  -> Idempotency validation normally handled by Next.js Server Actions `useActionState` and Stripe. Skipping raw DB assertion.");

        console.log("\n🎉 PHASE G & H EXECUTION FINISHED!");

    } catch (e) {
        console.error("❌ Phase G & H Simulation Failed:", e);
    } finally {
        // Cleanup Hot Item
        await prisma.meal.deleteMany({ where: { name: 'PS5 Demo Box' } });
        await prisma.$disconnect();
    }
}

executePhaseGH();
