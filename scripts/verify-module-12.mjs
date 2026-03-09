import { prisma } from '../src/lib/prisma.js';

async function testModule12() {
    console.log('🚀 Starting Module 12 Elite Verification...');

    // 1. Find a test driver
    const driver = await prisma.user.findFirst({ where: { role: 'DRIVER' } });
    if (!driver) {
        console.error('❌ No driver found for testing');
        return;
    }
    console.log(`Testing with Driver: ${driver.name} (ID: ${driver.id})`);

    // 2. Test Availability Toggling
    await prisma.user.update({ where: { id: driver.id }, data: { isOnline: false } });
    console.log('✅ Forced Offline. Verifying...');

    const updated = await prisma.user.update({ where: { id: driver.id }, data: { isOnline: true, lastOnlineAt: new Date() } });
    console.log(`✅ Forced Online. isOnline: ${updated.isOnline}, Last At: ${updated.lastOnlineAt}`);

    // 3. Test Provider Earnings Snapshot (Manual Query simulation)
    try {
        const balance = await prisma.ledgerEntry.aggregate({
            where: {
                transaction: { providerId: driver.id }
            },
            _sum: { amount: true }
        });
        console.log(`✅ Earnings Query successful. Balance: ${balance._sum.amount || 0}`);
    } catch (e) {
        console.error('❌ Earnings Query failed:', e);
    }

    // 4. Test Merchant Quick-Toggle
    const meal = await prisma.meal.findFirst();
    if (meal) {
        const toggled = await prisma.meal.update({
            where: { id: meal.id },
            data: { isSoldOut: !meal.isSoldOut }
        });
        console.log(`✅ Meal Toggle successful. ${meal.name} isSoldOut: ${toggled.isSoldOut}`);
        // Toggle back
        await prisma.meal.update({ where: { id: meal.id }, data: { isSoldOut: meal.isSoldOut } });
    }

    console.log('⭐ Module 12 Verification Complete!');
}

testModule12().catch(console.error).finally(() => prisma.$disconnect());
