"use client";

import React, { useState, useEffect } from 'react';
import {
    Users, ShoppingBag, Truck, Home, Tag,
    TrendingUp, ShieldAlert, AlertCircle,
    ArrowUpRight, ArrowDownRight, MoreVertical,
    Search, Filter, Download, ChevronRight
} from 'lucide-react';
import { getDashboardAnalytics } from '@/app/actions/analytics';

const RECENT_ALERTS = [
    { id: 1, type: 'MODERATION', title: 'New Listing Flagged', description: 'Listing "Modern Studio nr Campus" flagged for inaccurate pics.', time: '2 mins ago', severity: 'HIGH' },
    { id: 2, type: 'SYSTEM', title: 'Provider Payout Pending', description: 'Weekly payouts for 12 delivery vendors are ready for approval.', time: '1 hour ago', severity: 'MEDIUM' },
    { id: 3, type: 'USER', title: 'Identity Verified', description: 'Student #8272 verification document approved.', time: '3 hours ago', severity: 'LOW' },
];

export default function SuperadminOverview() {
    const [statsData, setStatsData] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            const res = await getDashboardAnalytics();
            if (res.success) {
                setStatsData(res.stats);
            }
        };
        fetchStats();
    }, []);

    const dynamicStats = statsData ? [
        { label: 'Total Users', value: statsData.users.students + statsData.users.drivers, change: '+2%', trend: 'up', icon: Users, color: 'indigo' },
        { label: 'Total Orders', value: statsData.orders.total, change: '+5%', trend: 'up', icon: ShoppingBag, color: 'orange' },
        { label: 'Active Services', value: statsData.orders.active, change: '-1%', trend: 'down', icon: Truck, color: 'blue' },
        { label: 'Revenue', value: `$${statsData.revenue.toLocaleString()}`, change: '+10%', trend: 'up', icon: TrendingUp, color: 'green' },
    ] : [
        { label: 'Total Users', value: '...', change: '', trend: 'up', icon: Users, color: 'indigo' },
        { label: 'Total Orders', value: '...', change: '', trend: 'up', icon: ShoppingBag, color: 'orange' },
        { label: 'Active Services', value: '...', change: '', trend: 'down', icon: Truck, color: 'blue' },
        { label: 'Revenue', value: '...', change: '', trend: 'up', icon: TrendingUp, color: 'green' },
    ];

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
                        {RECENT_ALERTS.map((alert) => (
                            <div key={alert.id} className="flex items-center gap-5 p-5 rounded-3xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all group cursor-pointer">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${alert.severity === 'HIGH' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' :
                                    alert.severity === 'MEDIUM' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' :
                                        'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500'
                                    }`}>
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${alert.severity === 'HIGH' ? 'text-red-500' :
                                            alert.severity === 'MEDIUM' ? 'text-orange-500' :
                                                'text-indigo-500'
                                            }`}>
                                            {alert.type}
                                        </span>
                                        <span className="text-xs font-medium text-gray-400">{alert.time}</span>
                                    </div>
                                    <h4 className="font-black text-gray-900 dark:text-white truncate">{alert.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{alert.description}</p>
                                </div>
                                <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Module Quick Access */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 p-8">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Module Control</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="aspect-square rounded-3xl bg-orange-50 dark:bg-orange-500/5 flex flex-col items-center justify-center gap-3 border border-orange-100 dark:border-orange-500/20 hover:scale-105 active:scale-95 transition-all group">
                            <ShoppingBag className="w-8 h-8 text-orange-600" />
                            <span className="font-black text-sm text-orange-900 dark:text-orange-100">Delivery</span>
                        </button>
                        <button className="aspect-square rounded-3xl bg-blue-50 dark:bg-blue-500/5 flex flex-col items-center justify-center gap-3 border border-blue-100 dark:border-blue-500/20 hover:scale-105 active:scale-95 transition-all group">
                            <Truck className="w-8 h-8 text-blue-600" />
                            <span className="font-black text-sm text-blue-900 dark:text-blue-100">Transport</span>
                        </button>
                        <button className="aspect-square rounded-3xl bg-emerald-50 dark:bg-emerald-500/5 flex flex-col items-center justify-center gap-3 border border-emerald-100 dark:border-emerald-500/20 hover:scale-105 active:scale-95 transition-all group">
                            <Home className="w-8 h-8 text-emerald-600" />
                            <span className="font-black text-sm text-emerald-900 dark:text-emerald-100">Housing</span>
                        </button>
                        <button className="aspect-square rounded-3xl bg-purple-50 dark:bg-purple-500/5 flex flex-col items-center justify-center gap-3 border border-purple-100 dark:border-purple-500/20 hover:scale-105 active:scale-95 transition-all group">
                            <Tag className="w-8 h-8 text-purple-600" />
                            <span className="font-black text-sm text-purple-900 dark:text-purple-100">Deals</span>
                        </button>
                    </div>

                    <div className="mt-8 p-6 rounded-3xl bg-brand-600 text-white relative overflow-hidden group cursor-pointer">
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
