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
    if (!user || user.role !== 'PROVIDER') {
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

    return <ProviderClient settlements={settlements} dbListings={listings} dbLeads={leads} />;
}
