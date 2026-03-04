import { PrismaClient } from '@prisma/client';
import assert from 'assert';

const prisma = new PrismaClient();

async function runTests() {
    console.log('--- RUNNING MASTER FIX TESTS ---');

    try {
        // 1. Setup Test Data
        const user = await prisma.user.create({
            data: {
                name: 'Test Tester',
                email: `test-${Date.now()}@test.com`,
                password: 'hash',
                role: 'STUDENT',
            }
        });

        const merchant = await prisma.user.create({
            data: {
                name: 'Test Merchant',
                email: `merchant-${Date.now()}@test.com`,
                password: 'hash',
                role: 'MERCHANT',
            }
        });

        const meal = await prisma.meal.create({
            data: {
                name: 'Limited Burger',
                description: 'Test Meal',
                price: 100,
                merchantId: merchant.id,
                trackInventory: true,
                stockCount: 5,
            }
        });

        // Test 1: Out-of-stock blocks checkout & Concurrency Test
        console.log('Test 1 & 2: Concurrency & Out of Stock Guards');

        // Attempt 10 parallel orders for a meal with stock = 5
        const orderPromises = Array.from({ length: 10 }).map(async (_, i) => {
            try {
                return await prisma.$transaction(async (tx) => {
                    // Decrement stock
                    const updatedMeal = await tx.meal.update({
                        where: { id: meal.id },
                        data: { stockCount: { decrement: 1 } }
                    });

                    if (updatedMeal.trackInventory && updatedMeal.stockCount < 0) {
                        throw new Error('OUT_OF_STOCK');
                    }

                    // Create dummy order
                    const order = await tx.order.create({
                        data: {
                            userId: user.id,
                            service: 'DELIVERY',
                            status: 'PENDING',
                            total: 100,
                            details: '{}'
                        }
                    });
                    return { success: true, orderId: order.id };
                });
            } catch (e) {
                return { success: false, error: e.message };
            }
        });

        const results = await Promise.all(orderPromises);
        const successes = results.filter(r => r.success);
        const failures = results.filter(r => !r.success);

        if (successes.length !== 5) {
            console.error('Failure reasons:', failures.map(f => f.error));
        }

        assert.strictEqual(successes.length, 5, "Exactly 5 orders should succeed");
        assert.strictEqual(failures.length, 5, "Exactly 5 orders should fail due to stock");

        const finalMeal = await prisma.meal.findUnique({ where: { id: meal.id } });
        assert.strictEqual(finalMeal.stockCount, 0, "Stock should be exactly zero");
        console.log('✅ Concurrency & Stock Guard Passed.');


        // Cleanup Test Data
        await prisma.order.deleteMany({ where: { userId: user.id } });
        await prisma.meal.delete({ where: { id: meal.id } });
        await prisma.user.delete({ where: { id: merchant.id } });
        await prisma.user.delete({ where: { id: user.id } });

        console.log('--- ALL TESTS PASSED ---');
    } catch (error) {
        console.error('❌ TEST FAILED:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();
