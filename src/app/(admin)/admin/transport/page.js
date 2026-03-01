"use client";

import React from 'react';
import {
    Truck, Users, MapPin, Gauge,
    BarChart3, AlertCircle, Clock,
    ChevronRight, ArrowUpRight, TrendingUp,
    ShoppingBag
} from 'lucide-react';

const STATS = [
    { label: 'Active Drivers', value: '18', icon: Users, color: 'blue' },
    { label: 'Rides Today', value: '84', icon: Truck, color: 'indigo' },
    { label: 'Avg Wait Time', value: '6m', icon: Clock, color: 'emerald' },
    { label: 'Active Areas', value: '4', icon: MapPin, color: 'orange' },
];

const RECENT_RIDES = [
    { id: '#RID-1021', student: 'Kareem Ali', driver: 'Capt. Ahmed', status: 'IN_PROGRESS', route: 'Main Gate -> Building C' },
    { id: '#RID-1020', student: 'Mona Zeid', driver: 'Capt. Sayed', status: 'COMPLETED', route: 'Building B -> Library' },
    { id: '#RID-1019', student: 'Hassan J.', driver: 'Capt. Mahmoud', status: 'ARRIVED', route: 'Dorm A -> Cafeteria' },
];

export default function TransportAdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Transport <span className="text-blue-600">Admin</span></h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest italic">Fleet & Ride Management</p>
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
                {/* Rides Table */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Active & Recent Rides</h3>
                        <button className="text-blue-600 font-black text-sm hover:underline">Full Fleet Log</button>
                    </div>
                    <div className="space-y-4">
                        {RECENT_RIDES.map((ride) => (
                            <div key={ride.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center font-black text-xs text-blue-600">
                                        {ride.id.slice(1, 4)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{ride.student}</p>
                                        <p className="text-xs text-gray-500 font-medium">{ride.route}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-gray-500">{ride.driver}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ride.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                            ride.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                        }`}>
                                        {ride.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fleet Health */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Fleet Status</h3>
                    <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase">On-Duty Drivers</span>
                                <span className="text-lg font-black text-blue-600">18 / 25</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-3/4"></div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20">
                            <h4 className="font-black text-orange-600 text-sm mb-1 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Demand Surge
                            </h4>
                            <p className="text-xs text-orange-800 dark:text-orange-200 opacity-80">Higher demand detected at South Gate Cafeteria.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
