import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// In Next.js the checkSLABreaches requires the server context, but let's just copy the logic to measure

async function measure() {
    console.log("Setting up data...");

    // Clear existing data to be safe
    await prisma.sLABreach.deleteMany({});
    await prisma.notification.deleteMany({ where: { type: 'SLA_BREACH' } });
    await prisma.sLARule.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.user.deleteMany({ where: { role: 'CUSTOMER' } });

    // Create customer to attach orders to (if required by schema)
    const user = await prisma.user.create({
        data: {
            email: 'test-sla-user@example.com',
            role: 'CUSTOMER',
        }
    });

    const rule = await prisma.sLARule.create({
        data: {
            module: 'ORDER',
            metric: 'ORDER_ACCEPTANCE_TIME',
            thresholdMinutes: 30,
            breachAction: 'NOTIFY',
            active: true,
        }
    });

    // Create 500 PENDING orders created 40 mins ago
    const ordersData = [];
    for(let i=0; i<500; i++) {
        ordersData.push({
            status: 'PENDING',
            userId: user.id,
            createdAt: new Date(Date.now() - 40 * 60 * 1000),
            totalAmount: 10,
        });
    }

    // Some might fail depending on schema so we will try createMany
    try {
        await prisma.order.createMany({ data: ordersData });
    } catch(e) {
        console.error("Failed to seed orders:", e.message);
        return;
    }

    console.log("Data setup complete. Running SLA check...");

    // Copying checkSLABreaches logic
    const activeRules = await prisma.sLARule.findMany({
        where: { active: true },
    });

    let breachesCreated = 0;
    const startTime = performance.now();

    for (const rule of activeRules) {
        const thresholdMinutes = rule.thresholdMinutes || 30;
        const cutoff = new Date(Date.now() - thresholdMinutes * 60 * 1000);

        let breachableTargets = [];

        if (rule.metric === 'ORDER_ACCEPTANCE_TIME') {
            breachableTargets = await prisma.order.findMany({
                where: {
                    status: 'PENDING',
                    createdAt: { lte: cutoff },
                },
                select: { id: true },
            });
        }

        for (const target of breachableTargets) {
            const existing = await prisma.sLABreach.findFirst({
                where: { ruleId: rule.id, targetId: target.id },
            });

            if (!existing) {
                await prisma.sLABreach.create({
                    data: {
                        ruleId: rule.id,
                        targetId: target.id,
                        status: 'OPEN',
                    },
                });

                await prisma.notification.create({
                    data: {
                        type: 'SLA_BREACH',
                        title: `SLA Breach: ${rule.name || rule.metric}`,
                        message: `${rule.metric} threshold (${thresholdMinutes} min) exceeded for ${target.id}`,
                        userId: 'SYSTEM',
                    },
                });

                breachesCreated++;
            }
        }
    }

    const endTime = performance.now();
    console.log(`Execution time: ${(endTime - startTime).toFixed(2)} ms`);
    console.log(`Breaches created: ${breachesCreated}`);

    // Clean up
    await prisma.sLABreach.deleteMany({});
    await prisma.notification.deleteMany({ where: { type: 'SLA_BREACH' } });
    await prisma.sLARule.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.user.deleteMany({ where: { email: 'test-sla-user@example.com' } });
}

measure().catch(console.error).finally(() => prisma.$disconnect());
