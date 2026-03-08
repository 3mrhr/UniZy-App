'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Trash2, CheckCircle, AlertTriangle, MessageSquare, Flag, Eye, Ghost, Medal, Star, Trophy, Crown } from 'lucide-react';
import { getModQueue, approvePost, deletePost, shadowBanUser } from '@/app/actions/hub';

export default function AdminHubModeration() {
    const [flaggedPosts, setFlaggedPosts] = useState([]);
    const [stats, setStats] = useState({ totalPosts: 0, activePosts: 0, flaggedPosts: 0, removedPosts: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQueue = async () => {
            setIsLoading(true);
            try {
                const res = await getModQueue();
                if (res.stats) setStats(res.stats);
                if (res.flagged) setFlaggedPosts(res.flagged);
            } catch (error) {
                console.error(error);
            }
            setIsLoading(false);
        };
        fetchQueue();
    }, []);

    const handleApprove = async (id) => {
        const prevPosts = [...flaggedPosts];
        setFlaggedPosts(prev => prev.filter(p => p.id !== id));
        setStats(prev => ({ ...prev, flaggedPosts: Math.max(0, prev.flaggedPosts - 1), activePosts: prev.activePosts + 1 }));
        try {
            const res = await approvePost(id);
            if (!res.success) {
                setFlaggedPosts(prevPosts);
                alert(res.error || 'Failed to approve post');
            }
        } catch { setFlaggedPosts(prevPosts); }
    };

    const handleShadowBan = async (userId) => {
        if (!confirm('Shadow ban this user? They will still be able to post, but no one else will see their content.')) return;
        try {
            const res = await shadowBanUser(userId);
            if (res.success) {
                alert('User shadow banned successfully.');
            } else {
                alert(res.error || 'Failed to shadow ban');
            }
        } catch { alert('Something went wrong'); }
    };

    const TIER_ICONS = {
        BRONZE: { icon: Medal, color: 'text-amber-600' },
        SILVER: { icon: Star, color: 'text-gray-400' },
        GOLD: { icon: Trophy, color: 'text-yellow-500' },
        PLATINUM: { icon: Crown, color: 'text-purple-500' }
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

                {isLoading ? (
                    <div className="p-12 text-center text-gray-500 font-bold">Loading flagged posts...</div>
                ) : flaggedPosts.length === 0 ? (
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
                                            onClick={() => handleShadowBan(post.authorId)}
                                            className="p-2.5 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-xl hover:bg-purple-200 transition-all"
                                            title="Shadow Ban User"
                                        >
                                            <Ghost size={16} />
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
