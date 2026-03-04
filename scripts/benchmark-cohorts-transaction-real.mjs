import { performance } from 'perf_hooks';
import { prisma } from '../src/lib/prisma.js';
import { getRetentionCohorts } from '../src/app/actions/advanced-analytics.js';

// Mock auth
jest.mock('../src/app/actions/auth', () => ({
    getCurrentUser: async () => ({ id: 'admin-1', role: 'ADMIN' }),
}));

async function benchmark() {
    console.log("Real query benchmark...");
}
benchmark().catch(console.error);
