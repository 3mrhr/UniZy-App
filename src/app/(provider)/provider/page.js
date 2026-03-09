import ProviderClient from './ProviderClient';
import { getCurrentUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getProviderListings, getProviderLeads } from '@/app/actions/housing';

export const metadata = {
    title: 'Provider Hub | UniZy',
    description: 'Manage your property listings and services.',
};

export default async function ProviderPage() {
    const user = await getCurrentUser();
    const allowedRoles = ['HOUSE_OWNER', 'CLEANER', 'SERVICE_PROVIDER'];
    if (!user || !allowedRoles.includes(user.role)) {
        redirect('/login');
    }

    const settlements = await prisma.settlement.findMany({
        where: { providerId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    const listingsRes = await getProviderListings();
    const leadsRes = await getProviderLeads();

    const listings = listingsRes.success ? listingsRes.listings : [];
    const leads = leadsRes.success ? leadsRes.requests : [];

    return <ProviderClient user={user} settlements={settlements} dbListings={listings} dbLeads={leads} />;
}
