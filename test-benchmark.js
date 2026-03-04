import { performance } from 'perf_hooks';

// We will mock Prisma and getCurrentUser
const mockPrisma = {
    order: {
        findMany: async (args) => {
            // simulate 20ms network/db latency
            await new Promise(r => setTimeout(r, 20));
            return [{ userId: '1' }, { userId: '2' }];
        }
    }
};

const mockGetCurrentUser = async () => {
    return { id: 'admin', role: 'ADMIN' };
};

// Optimized implementation 1: Promise.all
async function getRetentionCohortsOptimized1(weeks = 4) {
    const admin = await mockGetCurrentUser();
    if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

    const promises = [];
    for (let i = 0; i < weeks; i++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);

        promises.push(
            mockPrisma.order.findMany({
                where: {
                    createdAt: { gte: weekStart, lt: weekEnd },
                },
                select: { userId: true },
                distinct: ['userId'],
            }).then(activeUsers => ({
                week: `Week -${i + 1}`,
                startDate: weekStart.toISOString().split('T')[0],
                endDate: weekEnd.toISOString().split('T')[0],
                activeUsers: activeUsers.length,
            }))
        );
    }

    const cohorts = await Promise.all(promises);
    return { success: true, cohorts };
}

async function run() {
    const weeks = 20;

    const start2 = performance.now();
    await getRetentionCohortsOptimized1(weeks);
    const end2 = performance.now();
    console.log(`Optimized (Promise.all): ${end2 - start2} ms`);
}

run().catch(console.error);
