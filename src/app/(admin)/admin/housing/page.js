"use client";

import React from 'react';
import {
    Home, ShieldCheck, AlertCircle, Users,
    BarChart3, Camera, MapPin, Search,
    Filter, MoreVertical, ChevronRight, Star,
    CheckCircle2, XCircle
} from 'lucide-react';

const STATS = [
    { label: 'Total Listings', value: '42', icon: Home, color: 'emerald' },
    { label: 'Pending Verif.', value: '12', icon: ShieldCheck, color: 'orange' },
    { label: 'Monthly Inquiries', value: '184', icon: Users, color: 'blue' },
    { label: 'Occupancy Rate', value: '94%', icon: BarChart3, color: 'indigo' },
];

const PENDING_LISTINGS = [
    { id: '#H-441', title: 'Modern Studio nr Campus', provider: 'Ahmed Ali', type: 'Studio', date: 'Oct 12' },
    { id: '#H-442', title: 'Shared Apt - 3 Bed', provider: 'Sara M.', type: 'Shared', date: 'Oct 13' },
    { id: '#H-443', title: 'Luxury Dorm Suite', provider: 'UniProperty', type: 'Dorm', date: 'Oct 13' },
];

export default function HousingAdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Housing <span className="text-emerald-600">Admin</span></h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest italic">Verification & Listing Management</p>
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
                {/* Pending Verifications */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Pending Verifications</h3>
                        <button className="text-emerald-600 font-black text-sm hover:underline">Manage Queue</button>
                    </div>
                    <div className="space-y-4">
                        {PENDING_LISTINGS.map((listing) => (
                            <div key={listing.id} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 group hover:border-emerald-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center font-black text-xs text-emerald-600 border border-gray-100 dark:border-gray-700">
                                        <Home className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{listing.title}</p>
                                        <p className="text-xs text-gray-500 font-medium">{listing.provider} • {listing.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-all">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all">
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Moderation Toolkit */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 flex flex-col">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Admin Tools</h3>
                    <div className="space-y-3 flex-1">
                        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">Identity Audits</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">Reported Items</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>
                    </div>

                    <div className="mt-8 p-6 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20">
                        <h4 className="font-black text-lg mb-1">Strict Moderation</h4>
                        <p className="text-emerald-100 text-xs font-medium mb-4">Ensure all listings meet safety & quality standards.</p>
                        <button className="w-full py-2 bg-white text-emerald-600 rounded-xl font-black text-sm">Review Logs</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
