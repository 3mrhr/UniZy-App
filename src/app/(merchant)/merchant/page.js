import MerchantClient from './MerchantClient';
import { getCurrentUser } from '@/app/actions/auth';
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

    return <MerchantClient settlements={settlements} />;
}
