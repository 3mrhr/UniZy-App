import { getFinanceReports, getRecentTransactions, getModuleDetailedStats } from '@/app/actions/finance';
import ModuleFinanceClient from './ModuleFinanceClient';

export default async function ModuleFinancePage({ params }) {
    const { slug } = await params;

    // Fetch Data for this specific module
    const { stats, error: statsError } = await getFinanceReports(slug);
    const { transactions, error: txError } = await getRecentTransactions(20, slug);
    const { details, error: detailError } = await getModuleDetailedStats(slug);

    if (statsError || txError || detailError) {
        return (
            <div className="p-12 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[3rem] text-red-600 dark:text-red-400">
                <p className="font-black uppercase tracking-widest text-[10px] mb-2">Security & Data Alert</p>
                <p className="font-bold text-lg leading-tight">We encountered a protocol error while aggregating {slug} financial data.</p>
                <p className="text-sm mt-4 opacity-70">Error Details: {statsError || txError || detailError}</p>
            </div>
        );
    }

    return (
        <ModuleFinanceClient
            module={slug}
            stats={stats}
            transactions={transactions}
            details={details}
        />
    );
}
