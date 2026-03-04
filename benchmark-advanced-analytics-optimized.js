
// mock prisma
const prisma = {
    order: {
        findMany: async () => {
             // Simulate DB latency
             await new Promise(resolve => setTimeout(resolve, 50));
             return [{userId: 'user1'}, {userId: 'user2'}];
        },
        groupBy: async () => {
             await new Promise(resolve => setTimeout(resolve, 50));
             return [];
        }
    }
};

const getCurrentUser = async () => ({ id: 'admin1', role: 'ADMIN' });

async function getRetentionCohorts(weeks = 4) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        // Optimized version using Promise.all
        // This executes the database queries concurrently instead of sequentially.
        const weekPromises = Array.from({ length: weeks }).map(async (_, i) => {
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

            return {
                week: `Week -${i + 1}`,
                startDate: weekStart.toISOString().split('T')[0],
                endDate: weekEnd.toISOString().split('T')[0],
                activeUsers: activeUsers.length,
            };
        });

        const cohorts = await Promise.all(weekPromises);

        return { success: true, cohorts };
    } catch (error) {
        console.error('Retention cohorts error:', error);
        return { error: 'Failed to compute retention.' };
    }
}


async function run() {
    console.log("Starting benchmark optimized...");

    const start = performance.now();
    const result = await getRetentionCohorts(10);
    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
}

run().catch(console.error);
