import { prisma } from './prisma.js';

/**
 * UniZy Background Worker
 * Handles automated cleanup and maintenance tasks.
 */
async function runWorker() {
    console.log('--- Starting UniZy Worker Cycle ---');
    try {
        // 1. Expire unverified OTPs
        const expiredOTPs = await prisma.oTP.updateMany({
            where: {
                expiresAt: { lt: new Date() },
                used: false
            },
            data: { used: true } // Mark as "dead"
        });
        if (expiredOTPs.count > 0) console.log(`[OTP] Expired ${expiredOTPs.count} old codes.`);

        // 2. SLA Breach Detection
        // Find orders that have been PENDING too long (e.g. 15 mins)
        const pendingThreshold = new Date(Date.now() - 15 * 60 * 1000);
        const slowOrders = await prisma.order.findMany({
            where: {
                status: 'PENDING',
                createdAt: { lt: pendingThreshold }
            }
        });

        if (slowOrders.length > 0) {
            console.log(`[SLA] Found ${slowOrders.length} slow orders. Triggering alerts...`);
            // Create SLA breach records if they don't exist
            for (const order of slowOrders) {
                await prisma.sLABreach.upsert({
                    where: { id: `SLA_${order.id}` }, // Deterministic ID for demo
                    update: {},
                    create: {
                        ruleId: 'DEFAULT_RESPONSE_SLA',
                        targetId: order.id,
                        status: 'OPEN',
                        notes: 'Order pending for over 15 minutes'
                    }
                });
            }
        }

        // 3. Cleanup Old Analytics Events
        const oldEventsThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
        const deletedEvents = await prisma.analyticsEvent.deleteMany({
            where: { createdAt: { lt: oldEventsThreshold } }
        });
        if (deletedEvents.count > 0) console.log(`[ANALYTICS] Pruned ${deletedEvents.count} old events.`);

    } catch (error) {
        console.error('[WORKER_ERROR]', error);
    }
    console.log('--- Worker Cycle Complete ---');
}

// In a real production environment, this would be a separate process
// or a cron job. For this demo, we can trigger it every 5 minutes.
if (process.env.RUN_WORKER === 'true') {
    setInterval(runWorker, 5 * 60 * 1000);
    runWorker(); // Initial run
}

export { runWorker };
