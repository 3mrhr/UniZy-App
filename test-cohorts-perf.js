import { performance } from 'perf_hooks';

// Mock Prisma
const mockOrders = Array.from({ length: 10000 }, () => {
    // Random date within the last 8 weeks
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 56));
    return {
        userId: `user-${Math.floor(Math.random() * 500)}`,
        createdAt: date,
    };
});

const prisma = {
    order: {
        async findMany({ where, select, distinct }) {
            // simulate DB delay
            await new Promise(resolve => setTimeout(resolve, 5));
            const { gte, lt } = where.createdAt;
            const filtered = mockOrders.filter(o => o.createdAt >= gte && o.createdAt < lt);
            if (distinct && distinct.includes('userId')) {
                const seen = new Set();
                return filtered.filter(o => {
                    if (seen.has(o.userId)) return false;
                    seen.add(o.userId);
                    return true;
                }).map(o => ({ userId: o.userId, createdAt: o.createdAt }));
            }
            return filtered;
        }
    }
};

async function getRetentionCohortsBaseline(weeks = 12) {
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
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0],
            activeUsers: activeUsers.length,
        });
    }
    return cohorts;
}

// Ensure same time base to avoid mismatch due to new Date() calls at different ms
const MOCK_CURRENT_TIME = new Date().getTime();

async function getRetentionCohortsBaselineStable(weeks = 12) {
    const cohorts = [];
    for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(MOCK_CURRENT_TIME);
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date(MOCK_CURRENT_TIME);
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
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0],
            activeUsers: activeUsers.length,
        });
    }
    return cohorts;
}

async function getRetentionCohortsOptimized(weeks = 12) {
    const cohortsData = [];
    for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(MOCK_CURRENT_TIME);
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date(MOCK_CURRENT_TIME);
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        cohortsData.push({
            week: `Week -${i + 1}`,
            startDate: weekStart,
            endDate: weekEnd,
        });
    }

    if (cohortsData.length === 0) {
        return [];
    }

    const overallStart = cohortsData[cohortsData.length - 1].startDate;
    const overallEnd = cohortsData[0].endDate;

    const allOrders = await prisma.order.findMany({
        where: {
            createdAt: { gte: overallStart, lt: overallEnd },
        },
        select: { userId: true, createdAt: true },
    });

    const cohorts = cohortsData.map((cohort) => {
        const activeUsersForWeek = new Set();
        for (const order of allOrders) {
            if (order.createdAt >= cohort.startDate && order.createdAt < cohort.endDate) {
                activeUsersForWeek.add(order.userId);
            }
        }
        return {
            week: cohort.week,
            startDate: cohort.startDate.toISOString().split('T')[0],
            endDate: cohort.endDate.toISOString().split('T')[0],
            activeUsers: activeUsersForWeek.size,
        };
    });

    return cohorts;
}

async function run() {
    const startBaseline = performance.now();
    const resBase = await getRetentionCohortsBaselineStable();
    const endBaseline = performance.now();
    console.log(`Baseline time: ${endBaseline - startBaseline} ms`);

    const startOpt = performance.now();
    const resOpt = await getRetentionCohortsOptimized();
    const endOpt = performance.now();
    console.log(`Optimized time: ${endOpt - startOpt} ms`);

    // Ensure correctness
    console.log(JSON.stringify(resBase) === JSON.stringify(resOpt) ? "Results match" : "Results DO NOT MATCH");
    if (JSON.stringify(resBase) !== JSON.stringify(resOpt)) {
        console.log("base", resBase);
        console.log("opt", resOpt);
    }
}

run();
