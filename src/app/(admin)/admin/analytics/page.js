'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Users, ShoppingBag,
    Download, PieChart, Activity, Truck, Settings, ShieldAlert, Tag, Map as MapIcon, Loader2
} from 'lucide-react';
import { getDashboardAnalytics } from '@/app/actions/analytics';
import { getRegionalDensity } from '@/app/actions/advanced-analytics';

// Visual Heatmap Component
function DemandHeatmap({ data }) {
    if (!data || data.length === 0) return null;
    return (
        <div className="bg-white dark:bg-unizy-dark p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
                <MapIcon className="text-brand-500" size={24} />
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Geospatial Demand Heatmap</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {data.map((zone) => {
                    const intensity = Math.min(zone.heatScore * 10, 100);
                    const color = intensity > 80 ? 'bg-rose-500' : intensity > 50 ? 'bg-orange-500' : 'bg-brand-500';
                    return (
                        <div key={zone.zone} className="relative group">
                            <div className={`h-28 rounded-3xl ${color} transition-all group-hover:scale-105 shadow-lg`} style={{ opacity: Math.max(0.2, intensity / 100) }} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-sm font-black text-white drop-shadow-md">{zone.zone}</span>
                                <span className="text-[10px] font-bold text-white/80 uppercase">{zone.heatScore.toFixed(1)} Pulse</span>
                            </div>
                            <div className="mt-3 text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{zone.orderCount} Orders</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-50 dark:border-white/5 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <span>Legend:</span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-brand-500" /> Low</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> High</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> Surge</span>
                </div>
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [heatmap, setHeatmap] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const [res, heatRes] = await Promise.all([
                    getDashboardAnalytics(),
                    getRegionalDensity()
                ]);
                if (res.success && res.stats) {
                    setData(res.stats);
                }
                if (heatRes.success) {
                    setHeatmap(heatRes.data);
                }
            } catch (error) {
                console.error("Fetch analytics error:", error);
            }
            setIsLoading(false);
        };
        fetchAll();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                <p className="mt-4 font-bold text-gray-500">Loading intelligence...</p>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center font-bold text-red-500">Failed to load analytics data.</div>;

    const totalActivity = data.breakdown.delivery + data.breakdown.transport + data.breakdown.services + (data.breakdown.housing || 0);
    const getPercent = (val) => totalActivity > 0 ? Math.round((val / totalActivity) * 100) : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        <BarChart3 className="text-brand-600 w-8 h-8" />
                        Intelligence & <span className="text-brand-600">Analytics</span>
                    </h1>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Platform Insights</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all">
                    <Download className="w-4 h-4" /> Export CSV Report
                </button>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">${data.revenue.toLocaleString()}</h3>
                    </div>
                    <div className="w-14 h-14 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Platform Users</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data.users.students + data.users.drivers}</h3>
                        <p className="text-xs font-bold text-gray-500 mt-1">{data.users.students} Students &bull; {data.users.drivers} Drivers</p>
                    </div>
                    <div className="w-14 h-14 bg-brand-50 dark:bg-brand-500/10 text-brand-600 rounded-2xl flex items-center justify-center">
                        <Users className="w-7 h-7" />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Promo Usages</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white">{data.promos.totalUses}</h3>
                        <p className="text-xs font-bold text-gray-500 mt-1">Times discounts applied</p>
                    </div>
                    <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center">
                        <Tag className="w-7 h-7" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Module Activity Breakdown */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-orange-50 dark:bg-orange-500/10 text-orange-600 rounded-xl"><PieChart className="w-6 h-6" /></div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Module Breakdown</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-orange-500" /> Delivery</span>
                                <span className="font-black">{data.breakdown.delivery} ({getPercent(data.breakdown.delivery)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                                <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${getPercent(data.breakdown.delivery)}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold flex items-center gap-2"><Truck className="w-4 h-4 text-blue-500" /> Transport</span>
                                <span className="font-black">{data.breakdown.transport} ({getPercent(data.breakdown.transport)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                                <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${getPercent(data.breakdown.transport)}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold flex items-center gap-2"><Settings className="w-4 h-4 text-rose-500" /> Services</span>
                                <span className="font-black">{data.breakdown.services} ({getPercent(data.breakdown.services)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                                <div className="bg-rose-500 h-3 rounded-full" style={{ width: `${getPercent(data.breakdown.services)}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold flex items-center gap-2"><PieChart className="w-4 h-4 text-emerald-500" /> Housing</span>
                                <span className="font-black">{data.breakdown.housing || 0} ({getPercent(data.breakdown.housing || 0)}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
                                <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${getPercent(data.breakdown.housing || 0)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Operations Health */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl"><Activity className="w-6 h-6" /></div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">Operations Health</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4 h-[calc(100%-80px)]">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl flex flex-col justify-center items-center text-center">
                            <h4 className="text-4xl font-black text-brand-600 mb-2">{data.orders.active}</h4>
                            <p className="font-bold text-gray-500 uppercase tracking-wider text-xs">Active Tasks in Progress</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl flex flex-col justify-center items-center text-center">
                            <h4 className="text-4xl font-black text-amber-500 mb-2">{data.orders.pending}</h4>
                            <p className="font-bold text-gray-500 uppercase tracking-wider text-xs">Pending / Unassigned</p>
                        </div>
                        <div className="col-span-2 bg-green-50 dark:bg-green-900/10 p-6 rounded-3xl flex flex-col justify-center items-center text-center border border-green-100 dark:border-green-900/20">
                            <h4 className="text-4xl font-black text-green-600 mb-2">{(Math.max(0, 100 - (data.orders.pending > 0 ? (data.orders.pending / totalActivity) * 100 : 0))).toFixed(1)}%</h4>
                            <p className="font-bold text-green-700 dark:text-green-500 uppercase tracking-wider text-xs flex items-center gap-2">
                                <ShieldAlert size={14} /> Fulfillment Efficiency Score
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
