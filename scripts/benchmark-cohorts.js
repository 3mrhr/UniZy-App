import { prisma } from '../src/lib/prisma.js';
import { getRetentionCohorts } from '../src/app/actions/advanced-analytics.js';

async function run() {
    console.log("Starting benchmark...");

    // Mock user for the test
    jest.mock('../src/app/actions/auth', () => ({
        getCurrentUser: async () => ({ id: 'admin-1', role: 'ADMIN' }),
    }));

    const start = performance.now();
    await getRetentionCohorts(10);
    const end = performance.now();

    console.log(`Execution time: ${end - start} ms`);
}

run().catch(console.error);
