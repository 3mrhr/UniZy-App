import { getRetentionCohorts } from './src/app/actions/advanced-analytics.js';

// mock auth
import * as auth from './src/app/actions/auth.js';
auth.getCurrentUser = async () => ({ id: 'admin1', role: 'ADMIN' });

// We need to mock prisma imported inside advanced-analytics.js
import * as prismaModule from './src/lib/prisma.js';

prismaModule.prisma.order = {
    findMany: async () => {
         // Simulate DB latency
         await new Promise(resolve => setTimeout(resolve, 50));
         return [{userId: 'user1'}, {userId: 'user2'}];
    }
};

prismaModule.prisma.$transaction = async (queries) => {
    // Simulate a single round trip latency for multiple queries
    await new Promise(resolve => setTimeout(resolve, 60));
    return Promise.all(queries);
};

async function run() {
    console.log("Starting real benchmark...");
    const start = performance.now();
    const result = await getRetentionCohorts(10);
    const end = performance.now();
    // console.log("Result:", result);
    console.log(`Execution time: ${end - start} ms`);
}

run().catch(console.error);
