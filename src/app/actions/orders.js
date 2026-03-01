'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';

export async function createOrder(service, details, total) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'STUDENT') {
            return { error: 'Only students can create orders.' };
        }

        const order = await prisma.order.create({
            data: {
                service,
                details: JSON.stringify(details),
                total: parseFloat(total),
                status: 'PENDING',
                userId: user.id
            }
        });

        // Revalidate relevant pages
        if (service === 'TRANSPORT') {
            revalidatePath('/transport');
        } else {
            revalidatePath('/delivery');
        }
        revalidatePath('/activity'); // Revalidate the Activity Center

        return { success: true, order };
    } catch (error) {
        console.error('Failed to create order:', error);
        return { error: 'Failed to create the order.' };
    }
}

export async function getStudentOrders() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'STUDENT') {
            return { error: 'Unauthorized.' };
        }

        const orders = await prisma.order.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return orders;
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return [];
    }
}

export async function getDriverOrders() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'DRIVER') {
            return { error: 'Unauthorized.' };
        }

        // Drivers see pending orders or their accepted orders
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { status: 'PENDING' },
                    { driverId: user.id }
                ]
            },
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return orders;
    } catch (error) {
        console.error('Failed to fetch driver orders:', error);
        return [];
    }
}

export async function acceptOrder(orderId) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'DRIVER') {
            return { error: 'Unauthorized. Only drivers can accept orders.' };
        }

        const order = await prisma.order.update({
            where: {
                id: orderId,
                status: 'PENDING' // Ensure it's not already taken
            },
            data: {
                status: 'ACCEPTED',
                driverId: user.id
            }
        });

        revalidatePath('/driver');
        return { success: true, order };
    } catch (error) {
        console.error('Failed to accept order (possibly already taken):', error);
        return { error: 'Failed to accept order. It might have been taken by someone else.' };
    }
}

export async function updateOrderStatus(orderId, newStatus) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'DRIVER') {
            return { error: 'Unauthorized.' };
        }

        const order = await prisma.order.update({
            where: {
                id: orderId,
                driverId: user.id
            },
            data: {
                status: newStatus
            }
        });

        revalidatePath('/driver');
        return { success: true, order };
    } catch (error) {
        console.error('Failed to update order status:', error);
        return { error: 'Failed to update order status.' };
    }
}
