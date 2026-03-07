'use server';

import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

export async function createMeal(data) {
    try {
        const user = await requireRole(['MERCHANT']);
        const { name, description, price, stockCount, trackInventory, tags } = data;

        if (!name || !price) {
            return { error: 'Name and Price are required.' };
        }

        const meal = await prisma.meal.create({
            data: {
                merchantId: user.id,
                name,
                description: description || null,
                price: parseFloat(price),
                stockCount: trackInventory ? parseInt(stockCount, 10) : null,
                trackInventory: trackInventory || false,
                tags: tags || null,
                isSoldOut: trackInventory && parseInt(stockCount, 10) <= 0
            }
        });

        revalidatePath('/merchant');
        revalidatePath('/merchant/menu');

        return { success: true, meal };
    } catch (error) {
        console.error('Error creating meal:', error);
        return { error: 'Failed to create item in the database.' };
    }
}

export async function updateMerchantSettings(data) {
    try {
        const user = await requireRole(['MERCHANT']);
        const { storeName, storeAddress, storeDescription, storeOpen } = data;

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                storeName: storeName !== undefined ? storeName : undefined,
                storeAddress: storeAddress !== undefined ? storeAddress : undefined,
                storeDescription: storeDescription !== undefined ? storeDescription : undefined,
                storeOpen: storeOpen !== undefined ? Boolean(storeOpen) : undefined,
            }
        });

        // Notification: If merchant CLOSES store, check if there are pending orders
        if (storeOpen === false) {
            try {
                const activeOrders = await prisma.order.findMany({
                    where: {
                        status: { in: ['PENDING', 'ACCEPTED', 'PREPARING'] },
                        orderItems: { some: { meal: { merchantId: user.id } } }
                    },
                    select: { userId: true, id: true }
                });

                for (const order of activeOrders) {
                    await createNotification(
                        order.userId,
                        'Store Closed',
                        'The merchant just closed. Your order might be delayed or cancelled.',
                        'SYSTEM',
                        `/activity/tracking/${order.id}`
                    );
                }
            } catch (_) { }
        }

        revalidatePath('/merchant');
        revalidatePath('/delivery');

        return { success: true, user: updatedUser };
    } catch (error) {
        console.error('Error updating merchant settings:', error);
        return { error: 'Failed to update store settings.' };
    }
}
