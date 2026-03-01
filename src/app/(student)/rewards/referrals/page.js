'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Gift, Copy, Share2, Users, Star, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ReferralPage() {
    const [copied, setCopied] = useState(false);

    // Mock data (will be from getReferralStats when user is authenticated)
    const code = 'UNI-OMA7X2K';
    const points = 1250;
    const totalReferrals = 5;
    const totalEarned = 250;
    const history = [
        { name: 'Sarah M.', date: '2026-02-25', points: 50 },
        { name: 'Ahmed K.', date: '2026-02-20', points: 50 },
        { name: 'Nour E.', date: '2026-02-15', points: 50 },
        { name: 'Fatma A.', date: '2026-02-10', points: 50 },
        { name: 'Khaled M.', date: '2026-02-05', points: 50 },
    ];

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-24 transition-colors">
            <div className="bg-gradient-to-br from-purple-600 via-brand-700 to-indigo-800 px-6 pt-8 pb-14">
                <div className="max-w-2xl mx-auto">
                    <Link href="/rewards" className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-bold mb-4">
                        <ArrowLeft size={16} /> Back to Rewards
                    </Link>
                    <h1 className="text-3xl font-black text-white">Referral Center</h1>
                    <p className="text-purple-200 font-bold text-sm mt-1">Invite friends, earn rewards together</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 -mt-8 space-y-6 relative z-10">
                {/* Share Card */}
                <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-white/5">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Your Referral Code</p>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl px-5 py-4 border-2 border-dashed border-brand-200 dark:border-brand-800">
                            <p className="text-2xl font-black text-brand-600 tracking-widest text-center">{code}</p>
                        </div>
                        <button onClick={handleCopy} className="p-4 bg-brand-600 text-white rounded-2xl hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-500/30">
                            {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 font-bold mt-3">
                        {copied ? '✅ Copied to clipboard!' : 'Share this code with friends to earn 50pts each'}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-unizy-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 text-center">
                        <Users size={18} className="mx-auto text-brand-500 mb-1" />
                        <p className="text-xl font-black text-gray-900 dark:text-white">{totalReferrals}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Friends Joined</p>
                    </div>
                    <div className="bg-white dark:bg-unizy-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 text-center">
                        <Star size={18} className="mx-auto text-amber-500 mb-1" />
                        <p className="text-xl font-black text-gray-900 dark:text-white">{totalEarned}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Points Earned</p>
                    </div>
                    <div className="bg-white dark:bg-unizy-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 text-center">
                        <Gift size={18} className="mx-auto text-purple-500 mb-1" />
                        <p className="text-xl font-black text-gray-900 dark:text-white">{points}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Total Points</p>
                    </div>
                </div>

                {/* History */}
                <div className="bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
                        <h3 className="font-black text-gray-900 dark:text-white">Referral History</h3>
                    </div>
                    {history.map((r, i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-white/[0.03] last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-brand-100 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
                                    <span className="text-xs font-black text-brand-600">{r.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{r.name}</p>
                                    <p className="text-[10px] text-gray-400">{r.date}</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-green-500">+{r.points} pts</span>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
