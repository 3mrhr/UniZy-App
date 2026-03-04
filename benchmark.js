// Mock prisma client for benchmarking
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const mockPrisma = {
    transaction: {
        count: async () => {
            await delay(10); // Simulated DB latency
            return 100;
        },
        groupBy: async () => {
            await delay(10); // Simulated DB latency
            return [
                { type: 'HOUSING', status: 'COMPLETED', _count: { _all: 80 } },
                { type: 'HOUSING', status: 'REFUNDED', _count: { _all: 20 } },
                { type: 'TRANSPORT', status: 'COMPLETED', _count: { _all: 80 } },
                { type: 'TRANSPORT', status: 'REFUNDED', _count: { _all: 20 } },
                { type: 'DELIVERY', status: 'COMPLETED', _count: { _all: 80 } },
                { type: 'DELIVERY', status: 'REFUNDED', _count: { _all: 20 } },
                { type: 'DEALS', status: 'COMPLETED', _count: { _all: 80 } },
                { type: 'DEALS', status: 'REFUNDED', _count: { _all: 20 } },
                { type: 'MEALS', status: 'COMPLETED', _count: { _all: 80 } },
                { type: 'MEALS', status: 'REFUNDED', _count: { _all: 20 } },
                { type: 'SERVICES', status: 'COMPLETED', _count: { _all: 80 } },
                { type: 'SERVICES', status: 'REFUNDED', _count: { _all: 20 } },
                { type: 'CLEANING', status: 'COMPLETED', _count: { _all: 80 } },
                { type: 'CLEANING', status: 'REFUNDED', _count: { _all: 20 } }
            ];
        }
    }
};

const modules = ['HOUSING', 'TRANSPORT', 'DELIVERY', 'DEALS', 'MEALS', 'SERVICES', 'CLEANING'];

async function runBaseline() {
    const start = performance.now();
    const byModule = await Promise.all(
        modules.map(async (mod) => {
            const [total, refunded] = await Promise.all([
                mockPrisma.transaction.count({ where: { type: mod } }),
                mockPrisma.transaction.count({ where: { type: mod, status: 'REFUNDED' } }),
            ]);
            return {
                module: mod,
                totalTransactions: total,
                refundedTransactions: refunded,
                refundRate: total > 0 ? Math.round((refunded / total) * 100) : 0,
            };
        })
    );
    const end = performance.now();
    console.log(`Baseline (N+1): ${(end - start).toFixed(2)}ms`);
    return byModule;
}

async function runOptimized() {
    const start = performance.now();
    const stats = await mockPrisma.transaction.groupBy({
        by: ['type', 'status'],
        _count: { _all: true },
        where: { type: { in: modules } }
    });

    const statsMap = modules.reduce((acc, mod) => {
        acc[mod] = { total: 0, refunded: 0 };
        return acc;
    }, {});

    for (const stat of stats) {
        if (!statsMap[stat.type]) continue;
        statsMap[stat.type].total += stat._count._all;
        if (stat.status === 'REFUNDED') {
            statsMap[stat.type].refunded += stat._count._all;
        }
    }

    const byModule = modules.map(mod => {
        const total = statsMap[mod].total;
        const refunded = statsMap[mod].refunded;
        return {
            module: mod,
            totalTransactions: total,
            refundedTransactions: refunded,
            refundRate: total > 0 ? Math.round((refunded / total) * 100) : 0,
        };
    });
    const end = performance.now();
    console.log(`Optimized (groupBy): ${(end - start).toFixed(2)}ms`);
    return byModule;
}

async function run() {
    console.log("Running benchmarks with mock 10ms DB latency per query...");
    await runBaseline();
    await runOptimized();
}

run();
