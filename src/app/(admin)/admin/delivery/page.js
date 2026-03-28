"use client";


import Link from 'next/link';
import React from 'react';
import {
    Truck, ShoppingBag, Users, Star,
    TrendingUp, BarChart3, Clock, AlertCircle,
    ArrowUpRight, ChevronRight, MapPin
} from 'lucide-react';

const STATS = [
    { label: 'Active Vendors', value: '24', icon: ShoppingBag, color: 'orange' },
    { label: 'Today\'s Orders', value: '156', icon: Truck, color: 'blue' },
    { label: 'Avg Delivery Time', value: '22m', icon: Clock, color: 'emerald' },
    { label: 'Customer Rating', value: '4.8', icon: Star, color: 'amber' },
];

const RECENT_ORDERS = [
    { id: '#ORD-9281', customer: 'Sample Student', vendor: 'Burger Bros', status: 'DELIVERING', amount: '120 EGP' },
    { id: '#ORD-9280', customer: 'Sara Ahmed', vendor: 'Pizza Hut', status: 'COMPLETED', amount: '240 EGP' },
    { id: '#ORD-9279', customer: 'Ziad Nour', vendor: 'Sushi Express', status: 'PENDING', amount: '310 EGP' },
];

export default function DeliveryAdminDashboard() {
    return (
        <div className="space-y-8">

            {/* Sub-page Navigation */}
            <div className="flex flex-wrap gap-3 mb-8">
                    <Link href="/admin/delivery/pricing" className="px-4 py-2 bg-white dark:bg-unizy-dark rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-all border border-gray-100 dark:border-white/5">Pricing</Link>
                    <Link href="/admin/delivery/commissions" className="px-4 py-2 bg-white dark:bg-unizy-dark rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-all border border-gray-100 dark:border-white/5">Commissions</Link>
            </div>

            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Delivery <span className="text-orange-600">Admin</span></h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest italic">Restricted to Delivery Operations</p>
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
                {/* Orders Table-ish */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Recent Orders</h3>
                        <button className="text-orange-600 font-black text-sm hover:underline">Manage All</button>
                    </div>
                    <div className="space-y-4">
                        {RECENT_ORDERS.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center font-black text-xs text-orange-600">
                                        {order.id.slice(1, 4)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{order.customer}</p>
                                        <p className="text-xs text-gray-500 font-medium">{order.vendor}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-sm font-black text-gray-900 dark:text-white">{order.amount}</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'DELIVERING' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Analytics Snapshot */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Module Analytics</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-orange-500" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">Revenue (MTD)</span>
                            </div>
                            <span className="font-black text-green-500">+12%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 w-3/4 rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Canceled</p>
                                <p className="text-lg font-black text-red-500">2%</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Delayed</p>
                                <p className="text-lg font-black text-orange-500">5%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
