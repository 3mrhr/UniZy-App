import { performance } from 'perf_hooks';

const mockPrismaFindMany = async (args) => {
    // Simulate database latency
    await new Promise(resolve => setTimeout(resolve, 10));
    return [{ userId: 'user-1' }, { userId: 'user-2' }];
};

// We will simulate the implementation since we just want to measure the N+1 vs parallel/batching
async function runOriginal(weeks) {
    let cohorts = [];
    for (let i = 0; i < weeks; i++) {
        const activeUsers = await mockPrismaFindMany({
            /* args */
        });
        cohorts.push({
            activeUsers: activeUsers.length,
        });
    }
    return cohorts;
}

async function runOptimized(weeks) {
    let cohorts = [];
    // Promise.all approach to run them concurrently instead of sequentially
    const promises = [];
    for (let i = 0; i < weeks; i++) {
        promises.push((async () => {
            const activeUsers = await mockPrismaFindMany({
                /* args */
            });
            return {
                index: i,
                activeUsers: activeUsers.length,
            };
        })());
    }

    const results = await Promise.all(promises);

    // Maintain order
    for (let i = 0; i < weeks; i++) {
        const result = results.find(r => r.index === i);
        cohorts.push({
            activeUsers: result.activeUsers,
        });
    }

    return cohorts;
}

async function benchmark() {
    console.log("Benchmarking N+1 Query vs Promise.all (10 weeks, 10ms simulated latency)");

    const start1 = performance.now();
    await runOriginal(10);
    const end1 = performance.now();
    console.log(`Original (Sequential) time: ${(end1 - start1).toFixed(2)} ms`);

    const start2 = performance.now();
    await runOptimized(10);
    const end2 = performance.now();
    console.log(`Optimized (Promise.all) time: ${(end2 - start2).toFixed(2)} ms`);

    console.log(`Improvement: ${((end1 - start1) / (end2 - start2)).toFixed(2)}x faster`);
}

benchmark().catch(console.error);
