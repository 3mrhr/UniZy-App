import { getRefunds } from '@/app/actions/refunds';
import RefundsClient from './RefundsClient';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Refunds Management | Admin | UniZy',
    description: 'Manage and approve refund requests.',
};

export default async function AdminRefundsPage({ searchParams }) {
    const user = await getCurrentUser();
    if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
        redirect('/login');
    }

    const { status, page } = await searchParams;
    const currentPage = page ? parseInt(page) : 1;

    const { refunds, total, totalPages, error } = await getRefunds({
        status: status || undefined,
        page: currentPage,
        limit: 20
    });

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50/50 rounded-2xl border border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-800 dark:text-red-400">Access Denied</h2>
                <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-cabinet text-unizy-navy dark:text-gray-100 flex items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-brand-600" />
                        Refunds Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Review, approve, and process user refund requests.
                    </p>
                </div>
            </div>

            <RefundsClient
                initialRefunds={refunds}
                total={total}
                totalPages={totalPages}
                currentPage={currentPage}
                currentStatus={status || ""}
            />
        </div>
    );
}
