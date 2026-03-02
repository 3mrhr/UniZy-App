'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Gift,
    Copy,
    Users,
    Star,
    ArrowLeft,
    CheckCircle,
    Clock,
    AlertCircle,
    RefreshCw,
    Share2,
    CheckCircle2
} from 'lucide-react';
import { getReferralStats } from '@/app/actions/referrals';
import { getCurrentUser } from '@/app/actions/auth';
import toast from 'react-hot-toast';

export default function ReferralPage() {
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, userRes] = await Promise.all([
                getReferralStats(),
                getCurrentUser()
            ]);

            if (statsRes.success) {
                setStats(statsRes.stats);
            }
            setUser(userRes);
        } catch (error) {
            console.error('Failed to fetch referral data', error);
            toast.error('Failed to load referral data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCopy = () => {
        if (!user?.referralCode) return;
        navigator.clipboard.writeText(user.referralCode);
        setCopied(true);
        toast.success('Code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading && !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-unizy-navy">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32 transition-colors">
            {/* Animated Header */}
            <div className="bg-gradient-to-br from-brand-600 via-indigo-700 to-purple-800 px-6 pt-12 pb-20 relative overflow-hidden">
                <div className="max-w-2xl mx-auto relative z-10">
                    <Link href="/rewards" className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-bold mb-6 transition-all group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Rewards
                    </Link>
                    <h1 className="text-4xl font-black text-white mb-2">Referral Center</h1>
                    <p className="text-indigo-100 font-bold text-lg opacity-80">Invite friends, grow our community, and earn points.</p>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-400/20 rounded-full blur-2xl"></div>
            </div>

            <div className="max-w-2xl mx-auto px-6 -mt-12 space-y-6 relative z-10">
                {/* Referral Code Card */}
                <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-xs font-black text-brand-600 uppercase tracking-widest mb-1">Your Unique Code</p>
                            <h2 className="text-sm font-bold text-gray-400">Tap to copy and share</h2>
                        </div>
                        <Gift className="text-brand-600 w-8 h-8 opacity-20" />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCopy}
                            className="flex-1 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl px-6 py-5 border-2 border-dashed border-brand-200 dark:border-brand-800/50 hover:border-brand-500 transition-all group flex items-center justify-between"
                        >
                            <p className="text-3xl font-black text-brand-600 tracking-widest uppercase font-mono group-hover:scale-105 transition-transform">
                                {user?.referralCode || 'UNI-XXXXXX'}
                            </p>
                            {copied ? (
                                <CheckCircle2 className="text-green-500" size={24} />
                            ) : (
                                <Copy className="text-gray-400 group-hover:text-brand-600" size={24} />
                            )}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                                <Star size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Get <span className="font-black text-brand-600">50 points</span> when your friend completes their first order.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                                <Users size={20} />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Your friend gets <span className="font-black text-green-600">25 points</span> to start their journey!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm text-center">
                        <Users size={20} className="mx-auto text-indigo-500 mb-2" />
                        <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">{stats?.totalInvited || 0}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Invites</p>
                    </div>
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm text-center">
                        <CheckCircle size={20} className="mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">{stats?.completed || 0}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Earned</p>
                    </div>
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm text-center col-span-2 sm:col-span-1">
                        <Clock size={20} className="mx-auto text-amber-500 mb-2" />
                        <p className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-1">{stats?.pending || 0}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</p>
                    </div>
                </div>

                {/* Referral History */}
                <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <h3 className="font-black text-gray-900 dark:text-white">Friend Activity</h3>
                        {stats?.pending > 0 && (
                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-1 rounded-full uppercase tracking-widest">
                                {stats.pending} awaiting first order
                            </span>
                        )}
                    </div>

                    {!stats?.history || stats.history.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <Share2 size={32} />
                            </div>
                            <p className="text-gray-500 font-bold">No invites yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Start sharing your code to earn points!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                            {stats.history.map((r) => (
                                <div key={r.id} className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 bg-brand-50 dark:bg-brand-950/20 rounded-2xl flex items-center justify-center">
                                            <span className="text-sm font-black text-brand-600">
                                                {r.referred?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{r.referred?.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold">
                                                <span className="text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                {r.status === 'PENDING' && (
                                                    <span className="flex items-center gap-1 text-amber-500">
                                                        <Clock size={10} /> Pending Orders
                                                    </span>
                                                )}
                                                {r.status === 'COMPLETED' && (
                                                    <span className="flex items-center gap-1 text-green-500">
                                                        <CheckCircle2 size={10} /> Order Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black tracking-tighter ${r.status === 'COMPLETED' ? 'text-green-600 text-lg' : 'text-gray-400 text-sm'}`}>
                                            {r.status === 'COMPLETED' ? `+${r.pointsAwarded}` : '0'} <span className="text-[10px] uppercase">pts</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
