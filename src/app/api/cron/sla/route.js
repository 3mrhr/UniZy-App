import { NextResponse } from 'next/server';
import { checkSLABreaches } from '@/app/actions/sla-enforcement';

/**
 * SLA Cron Trigger
 * This endpoint can be pinged by an external cron service (like Vercel Crons)
 * to periodically check for breaches.
 */
export async function GET(request) {
    const authHeader = request.headers.get('authorization');

    // Simple secret check for security (In production, use dynamic environment variables)
    if (process.env.NODE_ENV === 'production') {
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }
    }

    try {
        const result = await checkSLABreaches();
        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            ...result
        });
    } catch (error) {
        console.error('SLA Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
