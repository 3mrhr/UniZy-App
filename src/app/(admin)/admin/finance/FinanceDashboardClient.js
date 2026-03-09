import React from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, ArrowUpRight, CreditCard, Wallet, Receipt, Clock } from 'lucide-react';
import FinanceModulesOverview from './FinanceModulesOverview';

export default function FinanceDashboardClient({ stats, recentTransactions }) {
    const STATS = [
        { label: 'UniZy Revenue', value: `${stats.revenue?.toLocaleString()} EGP`, change: 'Net Commission', trend: 'up', icon: DollarSign, color: 'brand' },
        { label: 'Gross GMV', value: `${stats.gmv?.toLocaleString()} EGP`, change: 'Total Volume', trend: 'up', icon: Receipt, color: 'blue' },
        { label: 'Pending Payouts', value: `${stats.pendingPayouts?.toLocaleString()} EGP`, change: 'Action Required', trend: 'up', icon: Wallet, color: 'amber' },
        { label: 'This Month GMV', value: `${stats.thisMonth?.toLocaleString()} EGP`, change: 'Growth Track', trend: 'up', icon: TrendingUp, color: 'emerald' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Sub-page Navigation */}
            <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/admin/finance/payouts" className="px-5 py-2.5 bg-white dark:bg-[#1E293B] rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 shadow-sm border border-gray-100 dark:border-white/5 transition-all">Payouts</Link>
                <Link href="/admin/finance/settlements" className="px-5 py-2.5 bg-white dark:bg-[#1E293B] rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 shadow-sm border border-gray-100 dark:border-white/5 transition-all">Settlements</Link>
                <Link href="/admin/finance/reports" className="px-5 py-2.5 bg-white dark:bg-[#1E293B] rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 shadow-sm border border-gray-100 dark:border-white/5 transition-all">Reports</Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">Finance <span className="text-brand-600">&</span> Payouts</h1>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-[0.2em]">Real-time Revenue Intelligence</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live reconciliation active</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat) => (
                    <div key={stat.label} className="group relative bg-white dark:bg-[#1E293B] p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 hover:border-brand-500/30 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-5 h-5 text-brand-600" />
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-4 rounded-2xl bg-${stat.color === 'brand' ? 'brand-500/10' : stat.color + '-500/10'} text-${stat.color === 'brand' ? 'brand-600' : stat.color + '-600'}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</h3>
                        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modules Overview */}
            <FinanceModulesOverview />

            {/* Main Dashboard Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions Table */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-[3rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white italic">Recent Handshakes</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Direct atomic transactions</p>
                        </div>
                        <Link href="/admin/finance/settlements" className="text-xs font-black text-brand-600 uppercase tracking-widest border-b-2 border-brand-600/20 hover:border-brand-600 transition-all pb-1">View Ledger</Link>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                        {recentTransactions.map((tx) => (
                            <div key={tx.id} className="px-8 py-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-500/5 flex items-center justify-center border border-brand-500/10">
                                        <CreditCard className="w-6 h-6 text-brand-600" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{tx.txnCode}</p>
                                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{tx.type} · {new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-lg text-gray-900 dark:text-white">{tx.amount.toLocaleString()} EGP</p>
                                    <div className="flex items-center gap-2 justify-end">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-lg ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Automation & Status Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[#0F172A] p-8 rounded-[3rem] text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                            <Clock size={80} />
                        </div>
                        <h3 className="text-xl font-black mb-4 italic">Settlement Auto-Pilot</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">System reconciles all "COMPLETED" handshakes every 24 hours at 00:00 Cairo Time.</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                                <span>Next Batch In</span>
                                <span className="text-brand-400">04:12:00</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-brand-500 h-full w-[65%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1E293B] p-8 rounded-[3rem] border border-gray-100 dark:border-white/5">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Platinum Guards</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Atomic Linkage', active: true },
                                { label: 'Dynamic Rate Mapping', active: true },
                                { label: 'Settlement Handshake', active: true },
                                { label: 'Stripe Settlement', active: false },
                            ].map((g, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{g.label}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${g.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
