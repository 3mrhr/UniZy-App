'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createTransportSOS({ transportOrderId, message, contextData }) {
    try {
        const user = await requireRole(['STUDENT']);

        let descriptionObj = {
            service: 'TRANSPORT',
            message: message || 'Emergency SOS triggered',
            ...contextData
        };

        if (transportOrderId) {
            descriptionObj.transportOrderId = transportOrderId;
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                subject: transportOrderId ? `TRANSPORT SOS: Order ${transportOrderId}` : 'TRANSPORT SOS',
                description: JSON.stringify(descriptionObj),
                category: 'TRANSPORT_SOS',
                priority: 'HIGH',
                status: 'OPEN',
                userId: user.id
            }
        });

        revalidatePath('/admin/transport-sos');

        return { success: true, ticket };
    } catch (error) {
        console.error('Failed to create Transport SOS:', error);
        return { success: false, error: 'Failed to create Transport SOS ticket.' };
    }
}
