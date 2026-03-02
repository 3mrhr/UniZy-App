import { getFinanceReports } from '@/app/actions/finance';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { BarChart3, TrendingUp, DollarSign, Wallet } from 'lucide-react';

export const metadata = {
    title: 'Financial Reports | Admin | UniZy',
    description: 'Master revenue and commission reporting.',
};

export default async function AdminFinanceReportsPage() {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN_SUPER') {
        redirect('/admin'); // Only Super Admin for global reports
    }

    const res = await getFinanceReports();
    const stats = res.stats || { revenue: 0, payouts: 0, netProfit: 0 };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold font-cabinet text-unizy-navy dark:text-gray-100 flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-brand-600" />
                    Financial Reports
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Master overview of platform revenue, provider payouts, and net retained commissions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Total Processed Gross */}
                <div className="bg-white dark:bg-unizy-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <h3 className="font-medium text-gray-500">Gross Transaction Value (GTV)</h3>
                    </div>
                    <p className="text-4xl font-black text-gray-900 dark:text-white">
                        EGP {stats.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Total money moved through platform</p>
                </div>

                {/* Total Payouts */}
                <div className="bg-white dark:bg-unizy-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Wallet className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
                            <CreditCardIcon className="w-6 h-6" />
                        </div>
                        <h3 className="font-medium text-gray-500">Total Provider Payouts</h3>
                    </div>
                    <p className="text-4xl font-black text-gray-900 dark:text-white">
                        EGP {stats.payouts.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Funds transferred to merchants & drivers</p>
                </div>

                {/* Net Revenue */}
                <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-6 rounded-2xl shadow-lg border border-brand-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <BarChart3 className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10 flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 text-white rounded-xl backdrop-blur-sm">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="font-medium text-brand-100">Net Platform Revenue</h3>
                    </div>
                    <p className="text-4xl font-black text-white">
                        EGP {stats.netProfit.toLocaleString()}
                    </p>
                    <p className="text-sm text-brand-100 mt-2">Retained commissions and fees</p>
                </div>

            </div>

            <div className="bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 text-center mt-8">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Advanced Analytics & Charting</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                    Visual charts and detailed module-specific reporting (Transport vs Food vs Services) will be available in the next Analytics update.
                </p>
            </div>
        </div>
    );
}

// Simple local component for the icon to avoid full lucide import for just one
function CreditCardIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
    )
}
