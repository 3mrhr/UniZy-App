"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import {
    Home, ShieldCheck, AlertCircle, Users,
    BarChart3, Camera, MapPin, Search,
    Filter, MoreVertical, ChevronRight, Star,
    CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import { getPendingListings, approveListing, rejectListing } from '@/app/actions/housing';
import { getDashboardAnalytics } from '@/app/actions/analytics';
import { toast } from 'react-hot-toast';

export default function HousingAdminDashboard() {
    const [pendingListings, setPendingListings] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inquiries: 0,
        occupancy: '94%' // Still static for now
    });
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [listings, analyticsRes] = await Promise.all([
                getPendingListings(),
                getDashboardAnalytics()
            ]);

            setPendingListings(listings || []);

            if (analyticsRes.success && analyticsRes.stats) {
                setStats(prev => ({
                    ...prev,
                    total: analyticsRes.stats.marketplace.listings,
                    pending: listings.length,
                    inquiries: analyticsRes.stats.breakdown.housing || 0
                }));
            }
        } catch (error) {
            toast.error("Failed to load dashboard data");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        setActionLoading(id);
        const res = await approveListing(id);
        if (res?.success) {
            toast.success("Listing approved");
            await fetchData();
        } else {
            toast.error(res?.error || "Error approving");
        }
        setActionLoading(null);
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Rejection reason:") || "Violates guidelines";
        setActionLoading(id);
        const res = await rejectListing(id, reason);
        if (res?.success) {
            toast.success("Listing rejected");
            await fetchData();
        } else {
            toast.error(res?.error || "Error rejecting");
        }
        setActionLoading(null);
    };

    const statConfig = [
        { label: 'Total Listings', value: stats.total, icon: Home, color: 'emerald' },
        { label: 'Pending Verif.', value: stats.pending, icon: ShieldCheck, color: 'orange' },
        { label: 'Active Inquiries', value: stats.inquiries, icon: Users, color: 'blue' },
        { label: 'Occupancy Rate', value: stats.occupancy, icon: BarChart3, color: 'indigo' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Sub-page Navigation */}
            <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/admin/housing/pricing" className="px-4 py-2 bg-white dark:bg-unizy-dark rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-all border border-gray-100 dark:border-white/5 shadow-sm">Pricing</Link>
                <Link href="/admin/housing/commissions" className="px-4 py-2 bg-white dark:bg-unizy-dark rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-all border border-gray-100 dark:border-white/5 shadow-sm">Commissions</Link>
                <button onClick={fetchData} className="p-2.5 bg-white dark:bg-unizy-dark rounded-xl text-gray-400 hover:text-brand-600 transition-all border border-gray-100 dark:border-white/5 shadow-sm ml-auto">
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Housing <span className="text-emerald-600">Admin</span></h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest italic">Verification & Listing Management</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statConfig.map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md">
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
                <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Pending Verifications</h3>
                        <Link href="/admin/listings-moderation" className="text-emerald-600 font-black text-sm hover:underline">Manage Queue</Link>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                            <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                            <p className="font-bold text-sm">Refreshing Queue...</p>
                        </div>
                    ) : pendingListings.length === 0 ? (
                        <div className="text-center py-20">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-20" />
                            <p className="text-gray-400 font-bold tracking-tight">All clear! No pending verifications.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                            {pendingListings.map((listing) => (
                                <div key={listing.id} className="flex items-center justify-between p-5 rounded-2xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 group hover:border-emerald-500/30 transition-all shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center font-black text-xs text-emerald-600 border border-gray-100 dark:border-gray-700 shadow-sm">
                                            <Home className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 dark:text-white truncate lg:max-w-xs">{listing.title}</p>
                                            <p className="text-xs text-gray-500 font-medium truncate">{listing.provider?.name || 'Unknown'} • {listing.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApprove(listing.id)}
                                            disabled={actionLoading === listing.id}
                                            className="p-2.5 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 hover:bg-green-100 transition-all shadow-sm disabled:opacity-50"
                                            title="Approve Listing"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleReject(listing.id)}
                                            disabled={actionLoading === listing.id}
                                            className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 transition-all shadow-sm disabled:opacity-50"
                                            title="Reject Listing"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Moderation Toolkit */}
                <div className="bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800 flex flex-col shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Admin Tools</h3>
                    <div className="space-y-3 flex-1">
                        <Link href="/admin/verifications" className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group border border-transparent hover:border-emerald-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">Identity Audits</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </Link>
                        <Link href="/admin/reports" className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-[#0F172A] hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group border border-transparent hover:border-emerald-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                                <span className="font-bold text-gray-700 dark:text-gray-300">Reported Items</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </Link>
                    </div>

                    <div className="mt-8 p-6 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:scale-150 transition-transform"></div>
                        <h4 className="font-black text-lg mb-1 relative z-10">Strict Moderation</h4>
                        <p className="text-emerald-100 text-xs font-medium mb-4 relative z-10">Ensure all listings meet safety & quality standards.</p>
                        <Link href="/admin/audit-logs" className="w-full py-2.5 bg-white text-emerald-600 rounded-xl font-black text-sm block text-center shadow-lg relative z-10 active:scale-95 transition-all">Review Logs</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
