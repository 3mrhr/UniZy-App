"use client";

import React from 'react';
import {
    Tag, Utensils, Users, ShoppingBag,
    BarChart3, Plus, Search, Filter,
    MoreVertical, ArrowUpRight, CheckCircle2,
    TrendingUp, Percent, Store
} from 'lucide-react';

const STATS = [
    { label: 'Active Deals', value: '18', icon: Tag, color: 'purple' },
    { label: 'Meal Options', value: '24', icon: Utensils, color: 'orange' },
    { label: 'Total Redemptions', value: '1,420', icon: CheckCircle2, color: 'emerald' },
    { label: 'Active Merchants', value: '12', icon: Store, color: 'blue' },
];

const RECENT_PRODUCTS = [
    { name: 'MacBook Repair 50% Off', merchant: 'Student Tech', category: 'DEAL', status: 'ACTIVE' },
    { name: 'Grilled Chicken & Rice', merchant: 'Campus Canteen', category: 'MEAL', status: 'ACTIVE' },
    { name: 'Buy 1 Get 1 Burger', merchant: 'Burger Bros', category: 'DEAL', status: 'PAUSED' },
];

export default function CommerceAdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Commerce <span className="text-purple-600">Admin</span></h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest italic">Deals, Meals & Merchant Moderation</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-4 mb-3">
                            <div className={`p-2.5 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Inventory / Moderation */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Listing Moderation</h3>
                            <p className="text-sm font-medium text-gray-500">Manage deals and meal offerings</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                                <Search className="w-5 h-5 text-gray-400" />
                            </button>
                            <button className="p-2 rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-500/20">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {RECENT_PRODUCTS.map((prod, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 hover:border-purple-500/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${prod.category === 'DEAL' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                        {prod.category === 'DEAL' ? <Tag className="w-5 h-5" /> : <Utensils className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{prod.name}</p>
                                        <p className="text-xs text-gray-500 font-medium">{prod.merchant} • {prod.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${prod.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {prod.status}
                                    </span>
                                    <button className="p-2 text-gray-400 hover:text-gray-900">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Redemption Analytics */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Redemption Flow</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-500 uppercase">Growth vs Last Week</span>
                            <span className="text-lg font-black text-emerald-500">+18%</span>
                        </div>

                        <div className="flex items-center gap-2 mb-8">
                            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                                <div key={i} className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-t-md relative h-24 flex items-end">
                                    <div
                                        className="w-full bg-purple-500 rounded-t-md transition-all duration-1000"
                                        style={{ height: `${h}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 rounded-3xl bg-purple-50 dark:bg-purple-500/5 border border-purple-100 dark:border-purple-500/20">
                            <h4 className="font-black text-purple-600 text-sm mb-1 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Top Merchant
                            </h4>
                            <p className="font-bold text-gray-900 dark:text-white">Burger Bros</p>
                            <p className="text-xs text-gray-500 mt-1">42 redemptions today</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
