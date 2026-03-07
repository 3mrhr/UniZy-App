"use client";

import Link from 'next/link';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Users, Megaphone, Edit3, MessageCircle, Heart, Share2, MoreHorizontal, Image as ImageIcon, Flag, Loader2, X, Search, Utensils, Home, Tag } from 'lucide-react';
import { getPosts, createPost, flagPost, toggleLike, addComment, getNotices } from '@/app/actions/hub';
import { globalSearch } from '@/app/actions/search';
import { getCurrentUser } from '@/app/actions/auth';
import ReportButton from '@/components/ReportButton';
import ServiceBentoGrid from '@/components/ServiceBentoGrid';
import debounce from 'lodash/debounce';

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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [reportedIds, setReportedIds] = useState(new Set());

    // Search & Notices State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [notices, setNotices] = useState([]);
    const [noticesLoading, setNoticesLoading] = useState(false);
    const [commentingId, setCommentingId] = useState(null);
    const [commentText, setCommentText] = useState('');

    // Load posts from DB
    useEffect(() => {
        async function load() {
            setLoading(true);
            const result = await getPosts();
            if (result.posts && result.posts.length > 0) {
                setPosts(result.posts);
            }
            setLoading(false);
        }

        async function loadUser() {
            const fetchedUser = await getCurrentUser();
            setUser(fetchedUser);
        }
        loadUser();
        load();
    }, []);

    // Load Notices
    useEffect(() => {
        if (activeTab === 'notices' && notices.length === 0) {
            async function fetchNotices() {
                setNoticesLoading(true);
                const result = await getNotices();
                if (result.success) setNotices(result.notices);
                setNoticesLoading(false);
            }
            fetchNotices();
        }
    }, [activeTab]);

    // Global Search Logic
    const debouncedSearch = useCallback(
        debounce(async (query) => {
            if (query.trim().length < 2) {
                setSearchResults([]);
                setSearching(false);
                return;
            }
            setSearching(true);
            const result = await globalSearch(query);
            setSearchResults(result.results || []);
            setSearching(false);
        }, 300),
        []
    );

    useEffect(() => {
        debouncedSearch(searchQuery);
    }, [searchQuery, debouncedSearch]);

    const handlePost = () => {
        if (!postText.trim()) {
            if (typeof window !== 'undefined') {
                import('react-hot-toast').then(({ default: toast }) => {
                    toast.error('Please write something before posting');
                });
            }
            return;
        }
        startTransition(async () => {
            const result = await createPost({ content: postText, category: postCategory });
            if (result.success) {
                setPosts(prev => [{
                    ...result.post,
                    likes: 0,
                    comments: 0,
                    isLiked: false,
                    author: { name: user?.name || 'You', university: user?.university || 'Assiut University', profileImage: user?.profileImage }
                }, ...prev]);
                setPostText('');
                setPostCategory('general');
            }
        });
    };

    const handleLike = async (postId) => {
        if (!user) return;
        // Optimistic UI
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const newLiked = !p.isLiked;
                return {
                    ...p,
                    isLiked: newLiked,
                    likes: newLiked ? p.likes + 1 : p.likes - 1
                };
            }
            return p;
        }));

        const result = await toggleLike(postId);
        if (result.error) {
            // Revert on error
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    const oldLiked = !p.isLiked;
                    return {
                        ...p,
                        isLiked: oldLiked,
                        likes: oldLiked ? p.likes + 1 : p.likes - 1
                    };
                }
                return p;
            }));
        }
    };

    const handleComment = async (postId) => {
        if (!commentText.trim()) return;
        const result = await addComment(postId, commentText);
        if (result.success) {
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    return { ...p, comments: p.comments + 1 };
                }
                return p;
            }));
            setCommentText('');
            setCommentingId(null);
        }
    };

    return (
        <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pt-6 transition-colors duration-300">

            {/* Header & Search */}
            <div className="mb-8 space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--unizy-text-dark)] dark:text-white mb-1">
                            {isRTL ? 'مجتمع يوني زي' : 'Student Hub'}
                        </h1>
                        <p className="text-[var(--unizy-text-muted)] dark:text-gray-400 text-sm">
                            {isRTL ? 'تواصل مع زملائك في الحرم الجامعي' : 'Connect with your campus community'}
                        </p>
                    </div>
                </div>

                {/* Global Search Bar (Playbook Upgrade) */}
                <div className="relative group z-40">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--unizy-primary)] transition-colors">
                        {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </div>
                    <input
                        type="text"
                        placeholder={isRTL ? 'ابحث عن مطاعم، سكن، أو صفقات...' : 'Search for dining, housing, or deals...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-12 text-sm focus:ring-2 focus:ring-[var(--unizy-primary)] focus:border-transparent outline-none shadow-sm transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* Search Results Dropdown */}
                    {searchQuery.length >= 2 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl p-2 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            {searchResults.length > 0 ? (
                                <div className="space-y-1">
                                    {searchResults.map((result) => (
                                        <Link
                                            key={`${result.type}-${result.id}`}
                                            href={result.url}
                                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                                {result.type === 'meal' && <Utensils className="w-5 h-5 text-orange-500" />}
                                                {result.type === 'housing' && <Home className="w-5 h-5 text-blue-500" />}
                                                {result.type === 'deal' && <Tag className="w-5 h-5 text-purple-500" />}
                                                {result.type === 'hub_post' && <Users className="w-5 h-5 text-green-500" />}
                                                {result.type === 'roommate' && <Heart className="w-5 h-5 text-red-500" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[var(--unizy-primary)]">
                                                    {result.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                                            </div>
                                            <div className="text-right">
                                                {result.price && (
                                                    <span className="text-xs font-black text-[var(--unizy-primary)]">
                                                        {result.price} {result.currency}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : !searching ? (
                                <div className="p-8 text-center">
                                    <p className="text-sm text-gray-500 font-bold">No results found for "{searchQuery}"</p>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>

            {/* Service Bento Grid (Playbook Upgrade) */}
            <ServiceBentoGrid />

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
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=random&color=fff`} alt="User" className="w-full h-full object-cover" />
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
                                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleLike(post.id)}
                                                    className={`flex items-center gap-1.5 transition-colors text-sm font-bold group ${post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                                                >
                                                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-red-500' : 'group-hover:fill-red-500'}`} />
                                                    <span>{post.likes || 0}</span>
                                                </button>
                                                <button
                                                    onClick={() => setCommentingId(commentingId === post.id ? null : post.id)}
                                                    className={`flex items-center gap-1.5 transition-colors text-sm font-bold ${commentingId === post.id ? 'text-[var(--unizy-primary)]' : 'text-gray-500 hover:text-[var(--unizy-primary)]'}`}
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span>{post.comments || 0}</span>
                                                </button>
                                            </div>
                                            <button className="flex items-center gap-1.5 text-gray-500 hover:text-[var(--unizy-primary)] transition-colors text-sm font-bold">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Comment Input Overlay */}
                                        {commentingId === post.id && (
                                            <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Write a comment..."
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                    className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-2 text-sm outline-none border border-transparent focus:border-[var(--unizy-primary)] transition-all"
                                                />
                                                <button
                                                    onClick={() => handleComment(post.id)}
                                                    className="bg-[var(--unizy-primary)] text-white px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                                                >
                                                    Reply
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'notices' && (
                <div className="animate-fade-in space-y-4">
                    {noticesLoading ? (
                        <div className="text-center py-20">
                            <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-500" />
                            <p className="text-gray-400 font-bold text-sm mt-3">Fetching official notices...</p>
                        </div>
                    ) : notices.length > 0 ? (
                        notices.map(notice => (
                            <div key={notice.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                                {/* Notice Type Indicator */}
                                <div className={`absolute top-0 left-0 w-1 h-full ${notice.type === 'EMERGENCY' ? 'bg-red-500' :
                                    notice.type === 'ACADEMIC' ? 'bg-blue-500' :
                                        notice.type === 'EVENT' ? 'bg-purple-500' : 'bg-gray-400'
                                    }`} />

                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-[var(--unizy-text-dark)] dark:text-white group-hover:text-[var(--unizy-primary)] transition-colors">
                                        {notice.title}
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                        {notice.type}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                                    {notice.message}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
                                    <Megaphone className="w-3 h-3" />
                                    <span>{notice.university}</span>
                                    <span>•</span>
                                    <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800">
                            <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                            <h3 className="text-lg font-bold text-[var(--unizy-text-dark)] dark:text-white mb-2">
                                {isRTL ? 'لا توجد إعلانات حالياً' : 'No Official Notices'}
                            </h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                {isRTL ? 'ستظهر هنا الإعلانات الرسمية من الجامعة وإدارة التطبيق.' : 'Official announcements from the University and UniZy admin will appear here.'}
                            </p>
                        </div>
                    )}
                </div>
            )}

        </main>
    );
}
