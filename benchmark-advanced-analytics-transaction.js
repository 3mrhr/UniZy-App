
// mock prisma
const prisma = {
    order: {
        findMany: async () => {
             // Simulate DB latency
             await new Promise(resolve => setTimeout(resolve, 50));
             return [{userId: 'user1'}, {userId: 'user2'}];
        }
    },
    $transaction: async (queries) => {
        // Simulate a single round trip latency for multiple queries
        await new Promise(resolve => setTimeout(resolve, 60));
        return Promise.all(queries);
    }
};

const getCurrentUser = async () => ({ id: 'admin1', role: 'ADMIN' });

async function getRetentionCohorts(weeks = 4) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role?.startsWith('ADMIN')) return { error: 'Unauthorized' };

        const weekData = Array.from({ length: weeks }).map((_, i) => {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() - i * 7);

            return { i, weekStart, weekEnd };
        });

        // Run all queries in a single transaction round-trip
        const results = await prisma.$transaction(
            weekData.map(({ weekStart, weekEnd }) =>
                prisma.order.findMany({
                    where: {
                        createdAt: { gte: weekStart, lt: weekEnd },
                    },
                    select: { userId: true },
                    distinct: ['userId'],
                })
            )
        );

        const cohorts = weekData.map(({ i, weekStart, weekEnd }, index) => ({
            week: `Week -${i + 1}`,
            startDate: weekStart.toISOString().split('T')[0],
            endDate: weekEnd.toISOString().split('T')[0],
            activeUsers: results[index].length,
        }));

        return { success: true, cohorts };
    } catch (error) {
        console.error('Retention cohorts error:', error);
        return { error: 'Failed to compute retention.' };
    }
}


async function run() {
    console.log("Starting benchmark transaction...");

    const start = performance.now();
    const result = await getRetentionCohorts(10);
    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
}

run().catch(console.error);
