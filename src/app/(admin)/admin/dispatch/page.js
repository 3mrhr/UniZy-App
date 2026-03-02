import { getDispatches } from '@/app/actions/dispatch';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { Navigation, AlertCircle } from 'lucide-react';
import DispatchClient from './DispatchClient';

export const metadata = {
    title: 'Dispatch Control | Admin | UniZy',
    description: 'Manage manual overrides for drivers and riders.',
};

export default async function AdminDispatchPage({ searchParams }) {
    const user = await getCurrentUser();
    if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
        redirect('/login');
    }

    const { page, module, status } = await searchParams;
    const currentPage = page ? parseInt(page) : 1;

    const { dispatches, total, totalPages, error } = await getDispatches({
        page: currentPage,
        module: module || undefined,
        status: status || undefined,
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
                        <Navigation className="w-6 h-6 text-brand-600" />
                        Dispatch Control
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor active jobs, handle delays, and perform manual driver assignments.
                    </p>
                </div>
            </div>

            <DispatchClient
                initialDispatches={dispatches}
                totalPages={totalPages}
                currentPage={currentPage}
                currentModule={module || ''}
                currentStatus={status || ''}
            />
        </div>
    );
}
