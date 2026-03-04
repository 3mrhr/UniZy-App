'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { revalidatePath } from 'next/cache';

export async function createMeal(data) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'MERCHANT') {
            return { error: 'Unauthorized: Only merchants can create items.' };
        }

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
