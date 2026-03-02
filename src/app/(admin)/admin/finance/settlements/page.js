import { getSettlements } from '@/app/actions/finance';
import SettlementsClient from './SettlementsClient';
import { DollarSign, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Settlements | Admin | UniZy',
    description: 'Manage provider settlements.',
};

export default async function AdminSettlementsPage({ searchParams }) {
    const user = await getCurrentUser();
    if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
        redirect('/login');
    }

    const { status, page } = await searchParams;
    const currentPage = page ? parseInt(page) : 1;

    const { settlements, total, totalPages, error } = await getSettlements({
        status: status || undefined,
        page: currentPage,
        limit: 20
    });

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-2xl border border-red-100">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-800">Access Denied</h2>
                <p className="text-red-600 mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-cabinet text-unizy-navy dark:text-gray-100 flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-brand-600" />
                        Settlements & Earnings
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View calculated earnings for merchants and drivers.
                    </p>
                </div>
            </div>

            <SettlementsClient
                initialSettlements={settlements}
                total={total}
                totalPages={totalPages}
                currentPage={currentPage}
                currentStatus={status || ""}
            />
        </div>
    );
}
