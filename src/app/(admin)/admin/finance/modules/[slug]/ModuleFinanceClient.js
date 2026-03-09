import React from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    CreditCard,
    TrendingUp,
    DollarSign,
    Receipt,
    Percent,
    PieChart,
    Activity
} from 'lucide-react';

export default function ModuleFinanceClient({ module, stats, transactions, details }) {
    const STAT_CARDS = [
        { label: 'Total Volume (GMV)', value: `${details.totalVolume?.toLocaleString()} EGP`, icon: Receipt, color: 'blue' },
        { label: 'UniZy Net Revenue', value: `${details.netRevenue?.toLocaleString()} EGP`, icon: DollarSign, color: 'brand' },
        { label: 'Avg Order Value', value: `${details.avgOrderValue?.toLocaleString()} EGP`, icon: TrendingUp, color: 'emerald' },
        { label: 'Success Rate', value: `${details.successRate}%`, icon: Activity, color: 'orange' },
    ];

    const moduleName = module.charAt(0).toUpperCase() + module.slice(1);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/finance"
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-[#1E293B] flex items-center justify-center border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight italic">
                            {moduleName} <span className="text-brand-600">Finance</span>
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">Sector Ledger & Performance Analysis</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-5 py-2.5 bg-brand-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 hover:scale-105 transition-all cursor-pointer">
                        Export Report
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {STAT_CARDS.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-[#1E293B] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className={`w-12 h-12 rounded-2xl bg-${stat.color === 'brand' ? 'brand-500/10' : stat.color + '-500/10'} text-${stat.color === 'brand' ? 'brand-600' : stat.color + '-600'} flex items-center justify-center mb-6`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</h3>
                        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transaction Ledger */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">Transaction Ledger</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Raw atomic record data</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-white/5">
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-500/5 flex items-center justify-center border border-brand-500/10">
                                                        <CreditCard className="w-5 h-5 text-brand-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-sm text-gray-900 dark:text-white italic">{tx.txnCode}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-sm text-gray-700 dark:text-gray-300">{tx.user?.name || 'Anonymous'}</p>
                                                <p className="text-[10px] text-gray-400 font-medium lowercase tracking-tight">{tx.user?.email}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <p className="font-black text-md text-gray-900 dark:text-white">{tx.amount.toLocaleString()} EGP</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <p className="text-sm font-bold text-gray-400 italic">No transactions captured for this module yet.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance & Meta Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#0F172A] p-10 rounded-[3rem] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <PieChart size={140} />
                        </div>
                        <h3 className="text-xl font-black mb-4 italic">Revenue Share</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">Commission mapping for this sector is dynamically calculated based on module-specific rules.</p>

                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 mb-4">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Platform Share</span>
                            <span className="text-sm font-black text-brand-400">Dynamic</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Provider Share</span>
                            <span className="text-sm font-black text-emerald-400">90% - 70%</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] border border-gray-100 dark:border-white/5 text-center">
                        <div className="w-20 h-20 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-6">
                            <Percent className="w-8 h-8 text-brand-600" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">Automated Reconciliation</h3>
                        <p className="text-gray-400 text-xs font-medium leading-relaxed">This module's settlements are atomically linked to the global pool every midnight.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
