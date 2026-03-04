import { prisma } from './src/lib/prisma.js';

// The new optimized function preserving original table query and structure
async function detectReferralAbuseOptimized() {
    // Original queried `prisma.user.findMany` with `where: { referredById: { not: null } }`.
    // The equivalent with correct schema is users who have been referred:
    const selfReferrals = await prisma.user.findMany({
        where: {
            referralsUsed: { some: {} },
        },
        select: {
            id: true,
            name: true,
            email: true,
            referralsUsed: {
                select: {
                    referrerId: true,
                },
                take: 1, // A user should generally only have 1 referral used
            },
        },
    });

    const ringReferrals = [];

    // Map to avoid N+1 queries. We collect all referredByIds.
    const parentReferrerIdsToFetch = [];
    for (const user of selfReferrals) {
        const referredById = user.referralsUsed[0]?.referrerId;
        if (referredById && referredById !== user.id) {
             parentReferrerIdsToFetch.push(referredById);
        }
    }

    // Fetch the referrers' own referrals in one query
    const parentReferrals = await prisma.user.findMany({
        where: {
            id: { in: parentReferrerIdsToFetch },
            referralsUsed: { some: {} },
        },
        select: {
            id: true,
            referralsUsed: {
                select: {
                    referrerId: true,
                },
                take: 1,
            },
        },
    });

    const parentReferrerMap = new Map();
    for (const parent of parentReferrals) {
        parentReferrerMap.set(parent.id, parent.referralsUsed[0]?.referrerId);
    }

    // Now reconstruct the original loop with the fetched map
    for (const user of selfReferrals) {
        const referredById = user.referralsUsed[0]?.referrerId;
        if (!referredById) continue;

        if (referredById === user.id) {
            ringReferrals.push({ type: 'SELF_REFERRAL', userId: user.id, name: user.name });
            continue;
        }

        const parentReferredById = parentReferrerMap.get(referredById);
        if (parentReferredById === user.id) {
            ringReferrals.push({ type: 'RING_REFERRAL', userId: user.id, referrerId: referredById });
        }
    }

    return ringReferrals;
}

async function runBenchmark() {
    await prisma.referral.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Seeding data...');
    // Seed 1000 users
    const usersToCreate = [];
    for (let i = 0; i < 1000; i++) {
        usersToCreate.push({
            id: `user-${i}`,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            password: 'password',
            role: 'STUDENT',
        });
    }
    await prisma.user.createMany({ data: usersToCreate });

    // Seed referrals
    const referralsToCreate = [];
    for (let i = 0; i < 900; i++) {
        let referrerId, referredId;
        referredId = `user-${i}`;
        if (i < 50) {
            referrerId = `user-${i}`; // Self referral
        } else if (i < 100) {
            referrerId = `user-${(i + 1) % 1000}`; // Random chain
        } else {
            referrerId = `user-${Math.floor(Math.random() * 1000)}`;
        }
        referralsToCreate.push({
            id: `ref-${i}`,
            code: `CODE-${i}`,
            referrerId,
            referredId,
        });
    }

    // Creating specific ring referrals
    referralsToCreate.push({ id: 'ref-900', code: 'CODE-900', referrerId: 'user-900', referredId: 'user-901' });
    referralsToCreate.push({ id: 'ref-901', code: 'CODE-901', referrerId: 'user-901', referredId: 'user-900' });

    await prisma.referral.createMany({ data: referralsToCreate });


    console.log('Running optimized...');
    const startOptimized = performance.now();
    const optimizedResult = await detectReferralAbuseOptimized();
    const endOptimized = performance.now();
    console.log(`Optimized time taken: ${endOptimized - startOptimized} ms`);
    console.log(`Optimized found ${optimizedResult.length} suspicious referrals.`);

    // Cleanup
    await prisma.referral.deleteMany({});
    await prisma.user.deleteMany({});
}

runBenchmark().catch(console.error).finally(() => prisma.$disconnect());
