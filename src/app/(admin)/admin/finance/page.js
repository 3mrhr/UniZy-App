import { getFinanceReports, getRecentTransactions } from '@/app/actions/finance';
import FinanceDashboardClient from './FinanceDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Finance & Payouts | Admin | UniZy',
    description: 'Manage platform revenue and vendor settlements.',
};

export default async function FinancePage() {
    const { stats, error: statsError } = await getFinanceReports();
    const { transactions, error: txError } = await getRecentTransactions(8);

    if (statsError || txError) {
        return (
            <div className="p-8 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl text-red-600 dark:text-red-400">
                <p className="font-black uppercase tracking-widest text-xs">System Alert</p>
                <p className="font-bold">Failed to load financial intelligence: {statsError || txError}</p>
            </div>
        );
    }

    return <FinanceDashboardClient stats={stats} recentTransactions={transactions} />;
}