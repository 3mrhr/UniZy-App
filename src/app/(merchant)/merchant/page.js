import MerchantClient from './MerchantClient';
import { getCurrentUser } from '@/app/actions/auth';
import { getMerchantOrders } from '@/app/actions/orders';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Merchant Hub | UniZy',
    description: 'Manage your restaurant or store on UniZy.',
};

export default async function MerchantPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'MERCHANT') {
        redirect('/login');
    }

    const settlements = await prisma.settlement.findMany({
        where: { providerId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    // Fetch real orders linked to this merchant's meals (ownership enforced)
    const ordersResult = await getMerchantOrders();
    const orders = ordersResult?.orders || [];

    // Fetch merchant's meals for menu management
    const meals = await prisma.meal.findMany({
        where: { merchantId: user.id },
        orderBy: { isPopular: 'desc' },
    });

    // Fetch merchant's deals
    const deals = await prisma.deal.findMany({
        where: { merchantId: user.id },
        orderBy: { createdAt: 'desc' },
    });

    return <MerchantClient
        settlements={settlements}
        dbOrders={orders}
        dbMeals={meals}
        dbDeals={deals}
        merchantName={user.storeName || user.name}
        storeAddress={user.storeAddress || ''}
        storeDescription={user.storeDescription || ''}
        storeOpen={user.storeOpen}
    />;
}
