import { performance } from 'perf_hooks';

// Mock Prisma
const mockOrders = [];
const now = new Date();
for (let i = 0; i < 10000; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    mockOrders.push({
        userId: `user-${Math.floor(Math.random() * 1000)}`,
        createdAt: d
    });
}

const prisma = {
    order: {
        findMany: async (args) => {
            const { where, distinct } = args;
            await new Promise(r => setTimeout(r, 10)); // simulated DB latency
            if (where.createdAt.gte && where.createdAt.lt) {
                // If distinct is used:
                if (distinct) {
                    const filtered = mockOrders.filter(o => o.createdAt >= where.createdAt.gte && o.createdAt < where.createdAt.lt);
                    const distinctIds = [...new Set(filtered.map(o => o.userId))].map(id => ({userId: id}));
                    return distinctIds;
                }
                return mockOrders.filter(o => o.createdAt >= where.createdAt.gte && o.createdAt < where.createdAt.lt);
            }
            return [];
        }
    }
};

async function testSequential(weeks) {
    const cohorts = [];
    for (let i = 0; i < weeks; i++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);

        const activeUsers = await prisma.order.findMany({
            where: {
                createdAt: { gte: weekStart, lt: weekEnd },
            },
            select: { userId: true },
            distinct: ['userId'],
        });

        cohorts.push({
            week: `Week -${i + 1}`,
            activeUsers: activeUsers.length,
        });
    }
    return cohorts;
}

async function testConcurrent(weeks) {
    const weekRanges = Array.from({ length: weeks }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        return { i, weekStart, weekEnd };
    });

    const queries = weekRanges.map(({ weekStart, weekEnd }) =>
        prisma.order.findMany({
            where: {
                createdAt: { gte: weekStart, lt: weekEnd },
            },
            select: { userId: true },
            distinct: ['userId'],
        })
    );

    // prisma.$transaction simulation
    const results = await Promise.all(queries);

    return weekRanges.map(({ i, weekStart, weekEnd }, idx) => ({
        week: `Week -${i + 1}`,
        activeUsers: results[idx].length,
    }));
}

async function testBroad(weeks) {
    const weekRanges = Array.from({ length: weeks }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        return { i, weekStart, weekEnd };
    });

    const overallStart = new Date();
    overallStart.setDate(overallStart.getDate() - weeks * 7);
    const overallEnd = new Date();

    const allOrders = await prisma.order.findMany({
        where: {
            createdAt: { gte: overallStart, lt: overallEnd },
        },
        select: { userId: true, createdAt: true },
    });

    const cohorts = weekRanges.map(({ i, weekStart, weekEnd }) => {
        const activeUsersInWeek = new Set();
        for (const order of allOrders) {
            if (order.createdAt >= weekStart && order.createdAt < weekEnd) {
                activeUsersInWeek.add(order.userId);
            }
        }
        return {
            week: `Week -${i + 1}`,
            activeUsers: activeUsersInWeek.size,
        };
    });
    return cohorts;
}

async function run() {
    const weeks = 24; // test with more weeks

    const s1 = performance.now();
    await testSequential(weeks);
    const e1 = performance.now();
    console.log(`Sequential (N+1 query): ${e1 - s1} ms`);

    const s2 = performance.now();
    await testConcurrent(weeks);
    const e2 = performance.now();
    console.log(`Concurrent ($transaction/Promise.all): ${e2 - s2} ms`);

    const s3 = performance.now();
    await testBroad(weeks);
    const e3 = performance.now();
    console.log(`Broad (1 query + in-memory): ${e3 - s3} ms`);
}

run();
