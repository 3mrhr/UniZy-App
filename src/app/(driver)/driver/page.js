import DriverClient from './DriverClient';
import { getCurrentUser } from '@/app/actions/auth';
import { getDriverOrders } from '@/app/actions/orders';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Driver Hub | UniZy',
    description: 'Manage your rides and track earnings.',
};

export default async function DriverPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'DRIVER') {
        redirect('/login');
    }

    // Fetch the driver's specific settlements
    const settlements = await prisma.settlement.findMany({
        where: { providerId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    // Fetch available + assigned orders
    const dbOrders = await getDriverOrders();
    const orders = Array.isArray(dbOrders) ? dbOrders : [];

    return <DriverClient settlements={settlements} dbOrders={orders} driverName={user.name} />;
}
