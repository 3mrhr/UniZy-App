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
    await prisma.user.deleteMany({ where: { email: 'test-sla-user@example.com' } });

    // Create customer to attach orders to (if required by schema)
    const user = await prisma.user.create({
        data: {
            email: 'test-sla-user@example.com',
            role: 'STUDENT',
            name: 'Test User',
            password: 'Test Password',
        }
    });

    for(let r=0; r<10; r++) {
        await prisma.sLARule.create({
            data: {
                module: 'ORDER',
                metric: 'ORDER_ACCEPTANCE_TIME',
                thresholdMinutes: 30,
                breachAction: 'NOTIFY',
                active: true,
            }
        });
    }

    // Create 500 PENDING orders created 40 mins ago
    const ordersData = [];
    for(let i=0; i<500; i++) {
        ordersData.push({
            status: 'PENDING',
            userId: user.id,
            createdAt: new Date(Date.now() - 40 * 60 * 1000),
            total: 10,
            service: 'DELIVERY',
            details: 'Test details',
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

    const rulesWithTargets = [];
    const allTargetIds = new Set();
    const ruleIds = [];

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

        const targetIds = breachableTargets.map(t => t.id);

        if (targetIds.length === 0) continue;

        rulesWithTargets.push({ rule, targetIds, thresholdMinutes });
        ruleIds.push(rule.id);
        targetIds.forEach(id => allTargetIds.add(id));
    }

    if (rulesWithTargets.length > 0) {
        // Bulk check for existing breaches across all rules and targets at once
        const allExistingBreaches = await prisma.sLABreach.findMany({
            where: {
                ruleId: { in: ruleIds },
                targetId: { in: Array.from(allTargetIds) },
            },
            select: { ruleId: true, targetId: true },
        });

        // Pre-index existing breaches in a map for O(1) lookup
        const existingBreachesMap = new Map();
        for (const b of allExistingBreaches) {
            existingBreachesMap.set(`${b.ruleId}_${b.targetId}`, true);
        }

        for (const { rule, targetIds, thresholdMinutes } of rulesWithTargets) {
            const newTargets = targetIds.filter(id => !existingBreachesMap.has(`${rule.id}_${id}`));

            if (newTargets.length > 0) {
                // Bulk create breaches
                await prisma.sLABreach.createMany({
                    data: newTargets.map(targetId => ({
                        ruleId: rule.id,
                        targetId,
                        status: 'OPEN',
                    })),
                });

                // Bulk create notifications
                await prisma.notification.createMany({
                    data: newTargets.map(targetId => ({
                        type: 'SLA_BREACH',
                        title: `SLA Breach: ${rule.name || rule.metric}`,
                        message: `${rule.metric} threshold (${thresholdMinutes} min) exceeded for ${targetId}`,
                        userId: user.id,
                    })),
                });

                breachesCreated += newTargets.length;
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
