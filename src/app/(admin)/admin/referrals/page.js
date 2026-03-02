'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Gift,
    TrendingUp,
    AlertCircle,
    Search,
    RefreshCw,
    ShieldAlert,
    CheckCircle2,
    Clock,
    UserCheck,
    ChevronRight,
    ArrowUpRight,
    Activity
} from 'lucide-react';
import { getAdminReferralStats } from '@/app/actions/referrals';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminReferralsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const res = await getAdminReferralStats();
        if (res.success) {
            setData(res.stats);
        } else {
            toast.error(res.error || 'Failed to fetch referral stats');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading && !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-unizy-navy">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    const filteredAbuseData = data?.abuseFlags.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Gift className="text-brand-600 w-6 h-6" />
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Referral Engine</h1>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Monitor program growth and detect point harvesting</p>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-3 bg-white dark:bg-unizy-dark rounded-2xl border border-gray-200 dark:border-white/10 text-gray-500 hover:text-brand-600 transition-colors shadow-sm"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Growth Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Users size={12} /> Total Invites
                        </p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{data?.totalReferrals}</p>
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-green-500 font-bold">
                            <ArrowUpRight size={12} /> Live Data
                        </div>
                    </div>
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Clock size={12} /> Pending Conversion
                        </p>
                        <p className="text-3xl font-black text-amber-600">{data?.pendingReferrals}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">Awaiting first order</p>
                    </div>
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Conversions
                        </p>
                        <p className="text-3xl font-black text-green-600">{data?.completedReferrals}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">Points successfully awarded</p>
                    </div>
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Activity size={12} /> Conv. Rate
                        </p>
                        <p className="text-3xl font-black text-brand-600">{data?.conversionRate}%</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">Efficiency of program</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-8">
                    {/* Abuse Detection & Top Referrers */}
                    <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Abuse Detection Queue</h2>
                                <p className="text-sm text-gray-500 font-medium">Identifying users with suspicious referral-to-order ratios</p>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by user..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent focus:border-brand-500 rounded-2xl py-2.5 pl-12 pr-4 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-white/5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-4">Student</th>
                                        <th className="px-8 py-4">Total Invites</th>
                                        <th className="px-8 py-4">Completed</th>
                                        <th className="px-8 py-4">Conv. Rate</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                    {filteredAbuseData?.map((user) => (
                                        <tr key={user.userId} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-black">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-white leading-none mb-1">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-bold text-gray-900 dark:text-white">{user.totalReferrals}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-bold text-gray-900 dark:text-white">{user.completedReferrals}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${parseFloat(user.conversionRate) < 20 ? 'bg-red-500' : 'bg-green-500'}`}
                                                            style={{ width: `${user.conversionRate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{user.conversionRate}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {user.isSuspicious ? (
                                                    <span className="flex items-center gap-1.5 text-xs font-black text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full border border-red-200 dark:border-red-500/20">
                                                        <AlertCircle size={14} /> SUSPICIOUS
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs font-black text-green-500 bg-green-50 dark:bg-green-500/10 px-3 py-1 rounded-full border border-green-200 dark:border-green-500/20">
                                                        <UserCheck size={14} /> TRUSTED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <Link
                                                    href={`/admin/users?q=${user.email}`}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-brand-600 hover:text-white transition-all"
                                                >
                                                    <ChevronRight size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredAbuseData?.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center">
                                                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 opacity-20" />
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">All Clear</h3>
                                                <p className="text-gray-500 text-sm">No suspicious referral patterns detected.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Operational Tips */}
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="max-w-xl text-center md:text-left">
                                <h3 className="text-2xl font-black mb-2 flex items-center gap-2 justify-center md:justify-start">
                                    <ShieldAlert size={28} className="text-indigo-200" /> Fraud Prevention Active
                                </h3>
                                <p className="text-indigo-100 font-medium">
                                    UniZy is now awarding points only after the referred student completes their first order. This prevents bot registration and "farming" without real platform usage.
                                </p>
                            </div>
                            <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                                <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-3">Abuse Threshold</p>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-8">
                                        <span className="text-sm font-bold">Min Invites</span>
                                        <span className="text-sm font-black">5+</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-8">
                                        <span className="text-sm font-bold">Conv. Floor</span>
                                        <span className="text-sm font-black">10%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative blobs */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
