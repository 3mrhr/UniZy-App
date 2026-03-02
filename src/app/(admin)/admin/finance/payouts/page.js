import { getSettlements, processPayout } from '@/app/actions/finance';
import { CreditCard, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import PayoutsClient from './PayoutsClient';

export const metadata = {
    title: 'Payout Processing | Admin | UniZy',
    description: 'Process provider payouts.',
};

export default async function AdminPayoutsPage({ searchParams }) {
    const user = await getCurrentUser();
    if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
        redirect('/login');
    }

    const { page } = await searchParams;
    const currentPage = page ? parseInt(page) : 1;

    // Only fetch pending settlements that need payout
    const { settlements, total, totalPages, error } = await getSettlements({
        status: 'PENDING',
        page: currentPage,
        limit: 20
    });

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-2xl border border-red-100">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-800">Access Denied</h2>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-cabinet text-unizy-navy dark:text-gray-100 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-brand-600" />
                        Payout Processing
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Process pending settlements and transfer funds to providers.
                    </p>
                </div>
            </div>

            <PayoutsClient
                initialSettlements={settlements}
                total={total}
                totalPages={totalPages}
                currentPage={currentPage}
            />
        </div>
    );
}
