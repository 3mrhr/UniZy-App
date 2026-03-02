import DriverClient from './DriverClient';
import { getCurrentUser } from '@/app/actions/auth';
import { getSettlements } from '@/app/actions/finance';
import { getActiveJobsForDriver } from '@/app/actions/dispatch';
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

    // Fetch the driver's specific settlements directly via Prisma (since getSettlements action needs admin perms)
    const settlements = await prisma.settlement.findMany({
        where: { providerId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    const activeJobsResult = await getActiveJobsForDriver();
    const activeJobs = activeJobsResult.jobs || [];

    return <DriverClient settlements={settlements} activeJobs={activeJobs} />;
}
