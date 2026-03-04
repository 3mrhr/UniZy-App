import { performance } from 'perf_hooks';

// Simulate database query times based on typical PostgreSQL latencies over the network
// 10ms network/DB overhead + some processing time
const DB_LATENCY_MS = 15;

// Mocking Prisma's behavior
const prisma = {
    order: {
        findMany: async (args) => {
            await new Promise(resolve => setTimeout(resolve, DB_LATENCY_MS));
            return [{ userId: 'user-1' }, { userId: 'user-2' }];
        }
    },
    // Prisma transaction processes multiple queries in one network roundtrip (roughly)
    // We simulate this by having 1 DB_LATENCY_MS plus a tiny bit of processing overhead per query
    $transaction: async (queries) => {
        const queryTimeMs = DB_LATENCY_MS + (queries.length * 1);
        await new Promise(resolve => setTimeout(resolve, queryTimeMs));

        // Return results array for each query
        return queries.map(() => [{ userId: 'user-1' }, { userId: 'user-2' }]);
    }
};

async function runOriginal(weeks) {
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

async function runOptimizedPromiseAll(weeks) {
    const cohorts = [];

    // Create query promises and pre-calculate dates to maintain order
    const queries = Array.from({ length: weeks }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);

        return {
            week: `Week -${i + 1}`,
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0],
            promise: prisma.order.findMany({
                where: {
                    createdAt: { gte: weekStart, lt: weekEnd },
                },
                select: { userId: true },
                distinct: ['userId'],
            })
        };
    });

    // Wait for all queries simultaneously
    const results = await Promise.all(queries.map(q => q.promise));

    // Map results back to cohort format maintaining correct order
    for (let i = 0; i < weeks; i++) {
        cohorts.push({
            week: queries[i].week,
            startDate: queries[i].startDate,
            endDate: queries[i].endDate,
            activeUsers: results[i].length,
        });
    }

    return cohorts;
}

async function runOptimizedTransaction(weeks) {
    const cohorts = [];

    // Create queries and pre-calculate dates to maintain order
    const queriesInfo = Array.from({ length: weeks }, (_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);

        return {
            week: `Week -${i + 1}`,
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0],
            query: prisma.order.findMany({
                where: {
                    createdAt: { gte: weekStart, lt: weekEnd },
                },
                select: { userId: true },
                distinct: ['userId'],
            })
        };
    });

    // Run all queries in a single Prisma transaction (one network roundtrip)
    const results = await prisma.$transaction(queriesInfo.map(q => q.query));

    // Map results back to cohort format maintaining correct order
    for (let i = 0; i < weeks; i++) {
        cohorts.push({
            week: queriesInfo[i].week,
            startDate: queriesInfo[i].startDate,
            endDate: queriesInfo[i].endDate,
            activeUsers: results[i].length,
        });
    }

    return cohorts;
}

async function benchmark() {
    console.log("Benchmarking Active Users Loop: N+1 vs Promise.all vs Transaction (12 weeks, 15ms simulated DB latency)");
    const WEEKS = 12; // A common analytics request (quarterly)

    // Warmup
    await runOriginal(WEEKS);
    await runOptimizedPromiseAll(WEEKS);
    await runOptimizedTransaction(WEEKS);

    console.log("---");

    const start1 = performance.now();
    await runOriginal(WEEKS);
    const end1 = performance.now();
    console.log(`Original (Sequential) time: ${(end1 - start1).toFixed(2)} ms`);

    const start2 = performance.now();
    await runOptimizedPromiseAll(WEEKS);
    const end2 = performance.now();
    console.log(`Optimized (Promise.all) time: ${(end2 - start2).toFixed(2)} ms`);

    const start3 = performance.now();
    await runOptimizedTransaction(WEEKS);
    const end3 = performance.now();
    console.log(`Optimized (Transaction) time: ${(end3 - start3).toFixed(2)} ms`);

    console.log("---");
    console.log(`Promise.all Improvement: ${((end1 - start1) / (end2 - start2)).toFixed(2)}x faster`);
    console.log(`Transaction Improvement: ${((end1 - start1) / (end3 - start3)).toFixed(2)}x faster`);
}

benchmark().catch(console.error);
