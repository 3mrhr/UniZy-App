'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, ArrowLeft, Loader2, Calendar, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getNotices } from '@/app/actions/hub';

export default function CampusNoticesPage() {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNotices() {
            setLoading(true);
            const result = await getNotices();
            if (result.success) setNotices(result.notices);
            setLoading(false);
        }
        fetchNotices();
    }, []);

    return (
        <main className="min-h-screen bg-[#f8fafc] dark:bg-unizy-navy pb-32 transition-colors duration-500">
            {/* Imposing Header */}
            <div className="bg-gradient-to-br from-brand-600 via-indigo-700 to-unizy-navy px-6 pt-12 pb-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                </div>

                <div className="max-w-3xl mx-auto relative z-10">
                    <Link href="/hub" className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-bold mb-8 transition-all group w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Hub
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                            <Megaphone className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter">Campus <span className="text-brand-300">Notices</span></h1>
                            <p className="text-indigo-100 font-medium opacity-80">Official bulletins & trending university pulses</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Feed */}
            <div className="max-w-3xl mx-auto px-6 -mt-12 relative z-20">
                {loading ? (
                    <div className="bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-xl rounded-[2.5rem] p-20 flex flex-col items-center justify-center shadow-xl border border-white/20 dark:border-white/5">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
                        <p className="font-black text-gray-400 uppercase tracking-widest text-sm text-center">Synchronizing Feed...</p>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-xl rounded-[2.5rem] p-20 text-center shadow-xl border border-white/20 dark:border-white/5">
                        <Sparkles className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-6" />
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">All Quiet Today</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">No official notices have been posted recently. Check back later for updates from your university.</p>
                        <Link href="/hub" className="mt-8 inline-block px-8 py-3 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20">
                            Explore Community Feed
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {notices.map((notice) => (
                            <div key={notice.id} className="bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-glass border border-white/60 dark:border-white/5 transition-all hover:translate-y-[-4px] hover:shadow-2xl group border-l-8 border-l-brand-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                                            <Megaphone className="text-brand-600 w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-brand-600 transition-colors">
                                                {notice.title}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                    <Calendar size={10} /> {new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] font-black text-indigo-400 uppercase tracking-tighter">
                                                    <MapPin size={10} /> {notice.university}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {notice.isPriority && (
                                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                                            Important
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-6">
                                    {notice.message}
                                </p>
                                {notice.link && (
                                    <a href={notice.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-black text-brand-600 dark:text-brand-400 hover:underline">
                                        View Details <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
