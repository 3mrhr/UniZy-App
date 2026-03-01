'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Trash2, CheckCircle, AlertTriangle, MessageSquare, Flag, Eye } from 'lucide-react';

// Mock data for initial render (will be replaced by real DB calls when admin is logged in)
const MOCK_FLAGGED = [
    { id: '1', content: 'Selling old textbooks — DM me for prices', category: 'marketplace', author: { name: 'Ahmed K.', email: 'ahmed@student.com' }, flagReason: 'Suspected spam', createdAt: '2026-02-28T10:30:00Z' },
    { id: '2', content: 'This professor is terrible and unfair!!!', category: 'general', author: { name: 'Khaled M.', email: 'khaled@student.com' }, flagReason: 'Offensive content', createdAt: '2026-02-28T14:00:00Z' },
    { id: '3', content: 'CHEAP HOUSING $50/mo — call 01234567890', category: 'housing', author: { name: 'Unknown', email: 'test@test.com' }, flagReason: 'Suspicious listing / scam', createdAt: '2026-03-01T09:00:00Z' },
];

const MOCK_STATS = { totalPosts: 142, activePosts: 135, flaggedPosts: 3, removedPosts: 4 };

export default function AdminHubModeration() {
    const [flaggedPosts, setFlaggedPosts] = useState(MOCK_FLAGGED);
    const [stats, setStats] = useState(MOCK_STATS);

    const handleApprove = (id) => {
        setFlaggedPosts(prev => prev.filter(p => p.id !== id));
        setStats(prev => ({ ...prev, flaggedPosts: prev.flaggedPosts - 1, activePosts: prev.activePosts + 1 }));
    };

    const handleDelete = (id) => {
        setFlaggedPosts(prev => prev.filter(p => p.id !== id));
        setStats(prev => ({ ...prev, flaggedPosts: prev.flaggedPosts - 1, removedPosts: prev.removedPosts + 1 }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Hub <span className="text-brand-600">Moderation</span></h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Community content review</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Posts', value: stats.totalPosts, icon: MessageSquare, color: 'brand' },
                    { label: 'Active', value: stats.activePosts, icon: CheckCircle, color: 'green' },
                    { label: 'Flagged', value: stats.flaggedPosts, icon: Flag, color: 'orange' },
                    { label: 'Removed', value: stats.removedPosts, icon: Trash2, color: 'red' },
                ].map((s) => (
                    <div key={s.label} className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                        <s.icon className={`w-5 h-5 mx-auto mb-2 text-${s.color}-500`} />
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Moderation Queue */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Shield className="text-orange-500" size={20} />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Flagged Posts Queue</h3>
                    <span className="ml-auto text-xs font-bold bg-orange-100 dark:bg-orange-900/20 text-orange-600 px-3 py-1 rounded-full">{flaggedPosts.length} pending</span>
                </div>

                {flaggedPosts.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircle className="mx-auto text-green-400 mb-3" size={40} />
                        <p className="font-bold text-gray-400">All clear! No flagged posts to review.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {flaggedPosts.map((post) => (
                            <div key={post.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                        <AlertTriangle size={18} className="text-orange-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-900 dark:text-white text-sm">{post.author.name}</span>
                                            <span className="text-[10px] font-bold text-gray-400">({post.author.email})</span>
                                            <span className="ml-auto text-[10px] font-bold bg-brand-100 dark:bg-brand-900/20 text-brand-600 px-2 py-0.5 rounded-lg uppercase">{post.category}</span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{post.content}</p>
                                        <div className="flex items-center gap-2">
                                            <Flag size={12} className="text-red-400" />
                                            <span className="text-xs text-red-400 font-bold">{post.flagReason}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleApprove(post.id)}
                                            className="p-2.5 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl hover:bg-green-200 transition-all"
                                            title="Approve — return to feed"
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2.5 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-200 transition-all"
                                            title="Remove from feed"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
