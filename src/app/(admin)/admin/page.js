"use client";

import React, { useState, useEffect } from 'react';
import {
    Users, ShoppingBag, Truck, Home, Tag,
    TrendingUp, ShieldAlert, AlertCircle,
    ArrowUpRight, ArrowDownRight, MoreVertical,
    Search, Filter, Download, ChevronRight
} from 'lucide-react';
import { getDashboardAnalytics } from '@/app/actions/analytics';
import { getSystemModules, toggleSystemModule } from '@/app/actions/settings';
import { getAuditLogs } from '@/app/actions/audit';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const RECENT_ALERTS = [
    { id: 1, type: 'MODERATION', title: 'New Listing Flagged', description: 'Listing "Modern Studio nr Campus" flagged for inaccurate pics.', time: '2 mins ago', severity: 'HIGH' },
    { id: 2, type: 'SYSTEM', title: 'Provider Payout Pending', description: 'Weekly payouts for 12 delivery vendors are ready for approval.', time: '1 hour ago', severity: 'MEDIUM' },
    { id: 3, type: 'USER', title: 'Identity Verified', description: 'Student #8272 verification document approved.', time: '3 hours ago', severity: 'LOW' },
];

export default function SuperadminOverview() {
    const router = useRouter();
    const [statsData, setStatsData] = useState(null);
    const [modules, setModules] = useState({ delivery: true, transport: true, housing: true, deals: true });
    const [recentLogs, setRecentLogs] = useState([]);
    const [isToggling, setIsToggling] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            const [res, modRes, logRes] = await Promise.all([
                getDashboardAnalytics(),
                getSystemModules(),
                getAuditLogs({ limit: 5 })
            ]);

            if (res.success) setStatsData(res.stats);
            if (modRes.success) setModules(modRes.modules);
            if (logRes.success) setRecentLogs(logRes.data.slice(0, 5));
            setIsLoading(false);
        };
        fetchStats();
    }, []);

    const dynamicStats = statsData ? [
        { label: 'Total Users', value: (statsData.users.students + statsData.users.drivers + (statsData.users.merchants || 0) + (statsData.users.providers || 0)).toLocaleString(), change: '', trend: 'up', icon: Users, color: 'indigo' },
        { label: 'Total Orders', value: statsData.orders.total.toLocaleString(), change: '', trend: 'up', icon: ShoppingBag, color: 'orange' },
        { label: 'Revenue (EGP)', value: `${Math.round(statsData.revenue).toLocaleString()}`, change: '', trend: 'up', icon: TrendingUp, color: 'green' },
        { label: 'Commission (EGP)', value: `${Math.round(statsData.commission || 0).toLocaleString()}`, change: '', trend: 'up', icon: TrendingUp, color: 'emerald' },
    ] : [
        { label: 'Total Users', value: '...', change: '', trend: 'up', icon: Users, color: 'indigo' },
        { label: 'Total Orders', value: '...', change: '', trend: 'up', icon: ShoppingBag, color: 'orange' },
        { label: 'Revenue (EGP)', value: '...', change: '', trend: 'up', icon: TrendingUp, color: 'green' },
        { label: 'Commission (EGP)', value: '...', change: '', trend: 'up', icon: TrendingUp, color: 'emerald' },
    ];

    const handleToggleModule = async (moduleName) => {
        if (isToggling) return;
        setIsToggling(true);
        const currentState = modules[moduleName];
        const newState = !currentState;

        // Optimistic update
        setModules(prev => ({ ...prev, [moduleName]: newState }));

        const res = await toggleSystemModule(moduleName, newState);
        if (!res.success) {
            toast.error(res.error || 'Failed to toggle module');
            // Revert
            setModules(prev => ({ ...prev, [moduleName]: currentState }));
        } else {
            toast.success(`Module ${moduleName} ${newState ? 'enabled' : 'disabled'}`);
        }
        setIsToggling(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Breadcrumb / Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Superadmin <span className="text-brand-600">Overview</span></h1>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Master Control Panel</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all">
                        <Download className="w-4 h-4" /> Export Data
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all">
                        System Status: Healthy
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {dynamicStats.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-[#1E293B] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group overflow-hidden relative">
                        {/* Background Decor */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700 bg-${stat.color}-600`}></div>

                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-black ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                                {stat.change}
                            </div>
                        </div>
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</h3>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Real-time Moderation Activity */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Active Moderation Queue</h3>
                            <p className="text-sm font-medium text-gray-500">Items requiring master admin attention</p>
                        </div>
                        <button className="text-brand-600 font-bold text-sm hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {recentLogs.length > 0 ? recentLogs.map((log) => (
                            <div key={log.id} className="flex items-center gap-5 p-5 rounded-3xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all group cursor-pointer">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${log.module === 'HUB' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' :
                                    log.module === 'AUTH' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' :
                                        'bg-brand-50 dark:bg-brand-500/10 text-brand-500'
                                    }`}>
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-500">
                                            {log.module}
                                        </span>
                                        <span className="text-xs font-medium text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <h4 className="font-black text-gray-900 dark:text-white truncate">{log.action}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">Target: {log.targetId || 'System'}</p>
                                </div>
                                <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        )) : (
                            <p className="text-center py-10 text-gray-400 font-bold">No recent audit logs found.</p>
                        )}
                    </div>
                </div>

                {/* Module Quick Access */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Module Control</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleToggleModule('delivery')} disabled={isToggling} className={`aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 border transition-all group ${modules.delivery ? 'bg-orange-50 dark:bg-orange-500/5 border-orange-100 dark:border-orange-500/20' : 'bg-gray-50 border-gray-200 grayscale opacity-60'}`}>
                            <ShoppingBag className={`w-8 h-8 ${modules.delivery ? 'text-orange-600' : 'text-gray-400'}`} />
                            <span className={`font-black text-sm ${modules.delivery ? 'text-orange-900 dark:text-orange-100' : 'text-gray-500'}`}>Delivery</span>
                        </button>
                        <button onClick={() => handleToggleModule('transport')} disabled={isToggling} className={`aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 border transition-all group ${modules.transport ? 'bg-blue-50 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20' : 'bg-gray-50 border-gray-200 grayscale opacity-60'}`}>
                            <Truck className={`w-8 h-8 ${modules.transport ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className={`font-black text-sm ${modules.transport ? 'text-blue-900 dark:text-blue-100' : 'text-gray-500'}`}>Transport</span>
                        </button>
                        <button onClick={() => handleToggleModule('housing')} disabled={isToggling} className={`aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 border transition-all group ${modules.housing ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20' : 'bg-gray-50 border-gray-200 grayscale opacity-60'}`}>
                            <Home className={`w-8 h-8 ${modules.housing ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <span className={`font-black text-sm ${modules.housing ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-500'}`}>Housing</span>
                        </button>
                        <button onClick={() => handleToggleModule('deals')} disabled={isToggling} className={`aspect-square rounded-3xl flex flex-col items-center justify-center gap-3 border transition-all group ${modules.deals ? 'bg-purple-50 dark:bg-purple-500/5 border-purple-100 dark:border-purple-500/20' : 'bg-gray-50 border-gray-200 grayscale opacity-60'}`}>
                            <Tag className={`w-8 h-8 ${modules.deals ? 'text-purple-600' : 'text-gray-400'}`} />
                            <span className={`font-black text-sm ${modules.deals ? 'text-purple-900 dark:text-purple-100' : 'text-gray-500'}`}>Deals</span>
                        </button>
                    </div>

                    <div onClick={() => router.push('/admin/master-mode')} className="mt-8 p-6 rounded-3xl bg-brand-600 text-white relative overflow-hidden group cursor-pointer">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                        <h4 className="font-black text-lg mb-1 relative z-10">Extreme Moderation</h4>
                        <p className="text-brand-100 text-xs font-medium mb-4 relative z-10">Delete or edit any entity globally.</p>
                        <div className="flex items-center gap-2 font-black text-sm relative z-10">
                            Enter Master Mode <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
