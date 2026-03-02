"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Users, Megaphone, Edit3, MessageCircle, Heart, Share2, MoreHorizontal, Image as ImageIcon, Flag, Loader2 } from 'lucide-react';
import { getPosts, createPost, flagPost } from '@/app/actions/hub';
import ReportButton from '@/components/ReportButton';

const HUB_TABS = [
    { id: 'feed', en: 'Community Feed', ar: 'المجتمع', icon: Users },
    { id: 'notices', en: 'Campus Notices', ar: 'إعلانات الحرم', icon: Megaphone },
];

const CATEGORY_OPTIONS = [
    { value: 'general', label: 'General' },
    { value: 'study_help', label: 'Study Help' },
    { value: 'lost_found', label: 'Lost & Found' },
    { value: 'housing', label: 'Housing' },
    { value: 'marketplace', label: 'Marketplace' },
];

const TAG_COLORS = {
    general: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-800',
    study_help: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 border-purple-200 dark:border-purple-800',
    lost_found: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 border-yellow-200 dark:border-yellow-800',
    housing: 'bg-green-100 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-800',
    marketplace: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 border-orange-200 dark:border-orange-800',
};

function timeAgo(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const secs = Math.floor((now - date) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
}

export default function HubPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [activeTab, setActiveTab] = useState('feed');
    const [postText, setPostText] = useState('');
    const [postCategory, setPostCategory] = useState('general');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [reportedIds, setReportedIds] = useState(new Set());

    // Load posts from DB
    useEffect(() => {
        async function load() {
            setLoading(true);
            const result = await getPosts();
            if (result.posts && result.posts.length > 0) {
                setPosts(result.posts);
            } else {
                // Seed with demo posts if DB is empty
                setPosts([
                    {
                        id: 'demo-1', content: 'Does anyone have past exams for BioPhysics 101? 🙏',
                        category: 'study_help', likes: 12, comments: 5, createdAt: new Date(Date.now() - 7200000).toISOString(),
                        author: { name: 'Sarah M.', university: 'Assiut University' }
                    },
                    {
                        id: 'demo-2', content: 'Found a black wallet near the library entrance. Handed it to security at gate 2.',
                        category: 'lost_found', likes: 45, comments: 2, createdAt: new Date(Date.now() - 18000000).toISOString(),
                        author: { name: 'Ahmed Kareem', university: 'Assiut University' }
                    },
                    {
                        id: 'demo-3', content: 'Looking for a 3rd roommate in a furnished apartment near the university (5 mins walk). Rent is super affordable. DM me!',
                        category: 'housing', likes: 28, comments: 14, createdAt: new Date(Date.now() - 86400000).toISOString(),
                        author: { name: 'Nour El-Din', university: 'Assiut University' }
                    },
                ]);
            }
            setLoading(false);
        }
        load();
    }, []);

    const handlePost = () => {
        if (!postText.trim()) return;
        startTransition(async () => {
            const result = await createPost({ content: postText, category: postCategory });
            if (result.success) {
                // Add to top of feed optimistically
                setPosts(prev => [{
                    id: result.post?.id || Date.now().toString(),
                    content: postText,
                    category: postCategory,
                    likes: 0, comments: 0,
                    createdAt: new Date().toISOString(),
                    author: { name: 'You', university: 'Assiut University' }
                }, ...prev]);
                setPostText('');
                setPostCategory('general');
            }
        });

    };

    return (
        <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pt-6 transition-colors duration-300">

            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--unizy-text-dark)] dark:text-white mb-1">
                        {isRTL ? 'مجتمع يوني زي' : 'Student Hub'}
                    </h1>
                    <p className="text-[var(--unizy-text-muted)] dark:text-gray-400 text-sm">
                        {isRTL ? 'تواصل مع زملائك في الحرم الجامعي' : 'Connect with your campus community'}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl mb-6">
                {HUB_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? 'bg-white dark:bg-[#1E293B] text-[var(--unizy-primary)] shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`} />
                        {isRTL ? tab.ar : tab.en}
                    </button>
                ))}
            </div>

            {activeTab === 'feed' && (
                <div className="animate-fade-in">
                    {/* Create Post Box */}
                    <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
                        <div className="flex gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                                <img src="https://ui-avatars.com/api/?name=Omar+Hassan&background=random&color=fff" alt="User" className="w-full h-full object-cover" />
                            </div>
                            <textarea
                                placeholder={isRTL ? 'بم تفكر؟ اطلب مساعدة أو شارك خبراً...' : 'What\'s on your mind? Ask for help or share news...'}
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-sm text-[var(--unizy-text-dark)] dark:text-white border-0 focus:ring-1 focus:ring-[var(--unizy-primary)] outline-none resize-none pt-3"
                                rows={2}
                            ></textarea>
                        </div>
                        <div className="flex justify-between items-center pl-14 rtl:pl-0 rtl:pr-14">
                            <div className="flex items-center gap-2">
                                <button className="text-gray-400 hover:text-[var(--unizy-primary)] transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <select
                                    value={postCategory}
                                    onChange={(e) => setPostCategory(e.target.value)}
                                    className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg px-2 py-1.5 border-0 outline-none appearance-none cursor-pointer"
                                >
                                    {CATEGORY_OPTIONS.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handlePost}
                                disabled={!postText.trim() || isPending}
                                className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${postText.trim().length > 0
                                    ? 'bg-[var(--unizy-primary)] text-white hover:opacity-90 shadow-md shadow-blue-500/20'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                                {isRTL ? 'نشر' : 'Post'}
                            </button>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-500" />
                            <p className="text-gray-400 font-bold text-sm mt-3">Loading posts...</p>
                        </div>
                    )}

                    {/* Feed Stream */}
                    {!loading && (
                        <div className="space-y-4">
                            {posts.map(post => (
                                <div key={post.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                                    {/* Post Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-3 items-center">
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'User')}&background=random&color=fff`} alt={post.author?.name} className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700" />
                                            <div>
                                                <h3 className="font-bold text-[var(--unizy-text-dark)] dark:text-white text-sm">{post.author?.name || 'Anonymous'}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>{post.author?.university || ''}</span>
                                                    <span>•</span>
                                                    <span>{timeAgo(post.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Report Button */}
                                        <ReportButton
                                            type="HUB_POST"
                                            targetId={post.id}
                                            targetUserId={post.authorId}
                                        />
                                    </div>

                                    {/* Post Tag */}
                                    <div className="mb-2">
                                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border ${TAG_COLORS[post.category] || TAG_COLORS.general}`}>
                                            {CATEGORY_OPTIONS.find(c => c.value === post.category)?.label || post.category}
                                        </span>
                                    </div>

                                    {/* Post Content */}
                                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                                        {post.content}
                                    </p>

                                    {/* Post Image */}
                                    {post.imageUrl && (
                                        <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800 max-h-64">
                                            <img src={post.imageUrl} alt="Post attachment" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    {/* Post Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex gap-4">
                                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium group">
                                                <Heart className="w-5 h-5 group-hover:fill-red-500" />
                                                <span>{post.likes || 0}</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-[var(--unizy-primary)] transition-colors text-sm font-medium">
                                                <MessageCircle className="w-5 h-5" />
                                                <span>{post.comments || 0}</span>
                                            </button>
                                        </div>
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-[var(--unizy-primary)] transition-colors text-sm font-medium">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'notices' && (
                <div className="animate-fade-in text-center py-20 bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800">
                    <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-bold text-[var(--unizy-text-dark)] dark:text-white mb-2">
                        {isRTL ? 'لا توجد إعلانات حالياً' : 'No Official Notices'}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        {isRTL ? 'ستظهر هنا الإعلانات الرسمية من الجامعة وإدارة التطبيق.' : 'Official announcements from the University and UniZy admin will appear here.'}
                    </p>
                </div>
            )}

        </main>
    );
}
