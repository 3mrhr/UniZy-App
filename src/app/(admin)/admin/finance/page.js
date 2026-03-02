'use client';


import Link from 'next/link';
import { DollarSign, TrendingUp, ArrowUpRight, CreditCard, Wallet, Receipt } from 'lucide-react';

const STATS = [
    { label: 'Total Revenue', value: '₱ 248,500', change: '+18%', trend: 'up', icon: DollarSign, color: 'green' },
    { label: 'Pending Payouts', value: '₱ 34,200', change: '12 vendors', trend: 'up', icon: Wallet, color: 'amber' },
    { label: 'This Month', value: '₱ 67,800', change: '+24%', trend: 'up', icon: TrendingUp, color: 'blue' },
    { label: 'Transactions', value: '1,847', change: '+9%', trend: 'up', icon: Receipt, color: 'purple' },
];

const RECENT = [
    { id: 1, type: 'Delivery Payout', vendor: 'KFC Campus', amount: '₱ 4,500', status: 'Pending', date: '2 hours ago' },
    { id: 2, type: 'Transport Revenue', vendor: 'UniRide Pool', amount: '₱ 1,200', status: 'Completed', date: '5 hours ago' },
    { id: 3, type: 'Housing Commission', vendor: 'Modern Studio', amount: '₱ 2,800', status: 'Completed', date: '1 day ago' },
    { id: 4, type: 'Service Booking', vendor: 'Hassan Ibrahim', amount: '₱ 350', status: 'Pending', date: '1 day ago' },
    { id: 5, type: 'Cleaning Service', vendor: 'CleanPro', amount: '₱ 400', status: 'Completed', date: '2 days ago' },
];

export default function FinancePage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Sub-page Navigation */}
            <div className="flex flex-wrap gap-3 mb-8">
                    <Link href="/admin/finance/payouts" className="px-4 py-2 bg-white dark:bg-unizy-dark rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-all border border-gray-100 dark:border-white/5">Payouts</Link>
                    <Link href="/admin/finance/settlements" className="px-4 py-2 bg-white dark:bg-unizy-dark rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-all border border-gray-100 dark:border-white/5">Settlements</Link>
                    <Link href="/admin/finance/reports" className="px-4 py-2 bg-white dark:bg-unizy-dark rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-all border border-gray-100 dark:border-white/5">Reports</Link>
            </div>

            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Finance & <span className="text-brand-600">Payouts</span></h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Revenue Tracking & Vendor Settlements</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-black text-green-500">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</h3>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Recent Transactions</h2>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {RECENT.map((tx) => (
                        <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-brand-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{tx.type}</p>
                                    <p className="text-xs text-gray-400 font-medium">{tx.vendor} · {tx.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-sm text-gray-900 dark:text-white">{tx.amount}</p>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${tx.status === 'Completed' ? 'text-green-500' : 'text-amber-500'}`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Coming Soon Note */}
            <div className="bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-brand-900/10 dark:to-indigo-900/10 rounded-3xl p-8 text-center border border-brand-100 dark:border-brand-900/20">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">💳 Payment Gateway Coming Soon</h3>
                <p className="text-gray-500 text-sm font-medium max-w-md mx-auto">Stripe & Paymob integration, UniZy Wallet, automated settlements, and real-time revenue dashboards are in development.</p>
            </div>
        </div>
    );
}
