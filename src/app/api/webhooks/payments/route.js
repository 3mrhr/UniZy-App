import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { capturePayment } from '@/app/actions/payments';

/**
 * POST /api/webhooks/payments
 * Secure gateway for payment provider confirmations (Paymob, Stripe, Cardo, etc.)
 */
export async function POST(req) {
    try {
        const payload = await req.json();
        const signature = req.headers.get('x-payment-signature');

        // 1. Playbook Security: Signature Verification
        // In production, we would use a secret key to verify the HMAC
        if (!signature && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        // 2. Elite Idempotency: Prevent duplicate processing of the same event
        const externalId = payload.id || payload.transaction_id || payload.obj?.id;
        if (!externalId) {
            return NextResponse.json({ error: 'No external ID found in payload' }, { status: 400 });
        }

        const existingEvent = await prisma.webhookEvent.findUnique({
            where: { externalId: String(externalId) }
        });

        if (existingEvent) {
            return NextResponse.json({ status: 'ALREADY_PROCESSED', id: existingEvent.id });
        }

        // 3. Record the event
        const event = await prisma.webhookEvent.create({
            data: {
                provider: payload.provider || 'UNKNOWN',
                externalId: String(externalId),
                eventType: payload.type || 'PAYMENT_SUCCESS',
                payload: payload,
                status: 'PENDING'
            }
        });

        // 4. Handle Logic based on event type
        // This is where we orchestrate the transition to COMPLETED/PAID
        if (event.eventType === 'PAYMENT_SUCCESS' || payload.status === 'SUCCESS') {
            const transactionId = payload.unizy_transaction_id || payload.metadata?.transaction_id;

            if (transactionId) {
                const captureResult = await capturePayment(transactionId);

                if (captureResult.success) {
                    await prisma.webhookEvent.update({
                        where: { id: event.id },
                        data: { status: 'PROCESSED', processedAt: new Date() }
                    });
                } else {
                    await prisma.webhookEvent.update({
                        where: { id: event.id },
                        data: { status: 'FAILED', error: captureResult.error }
                    });
                }
            }
        }

        return NextResponse.json({ success: true, eventId: event.id });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
