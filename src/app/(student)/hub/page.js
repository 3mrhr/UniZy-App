"use client";

import React, { useState, useEffect, useTransition, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Users, Megaphone, Edit3, MessageCircle, Heart, Share2, MoreHorizontal, Image as ImageIcon, Flag, Loader2, X, Search, Utensils, Home, Tag, Sparkles } from 'lucide-react';
import { getPosts, createPost, flagPost, toggleLike, addComment, getNotices, getRoommateMatches } from '@/app/actions/hub';
import { globalSearch } from '@/app/actions/search';
import { getCurrentUser } from '@/app/actions/auth';
import ReportButton from '@/components/ReportButton';
import ServiceBentoGrid from '@/components/ServiceBentoGrid';
import debounce from 'lodash/debounce';

const HUB_TABS = [
    { id: 'feed', en: 'Community Feed', ar: 'المجتمع', icon: Users },
    { id: 'roommates', en: 'Roommate Radar', ar: 'رادار الزملاء', icon: Heart },
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

function HubContent() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'feed';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [postText, setPostText] = useState('');
    const [postCategory, setPostCategory] = useState('general');
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const TIER_ICONS = {
        BRONZE: { icon: Medal, color: 'text-amber-600' },
        SILVER: { icon: Star, color: 'text-gray-400' },
        GOLD: { icon: Trophy, color: 'text-yellow-500' },
        PLATINUM: { icon: Crown, color: 'text-purple-500' }
    };

    // Search & Notices State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [notices, setNotices] = useState([]);
    const [noticesLoading, setNoticesLoading] = useState(false);
    const [commentingId, setCommentingId] = useState(null);
    const [commentText, setCommentText] = useState('');

    // Roommate State
    const [roommates, setRoommates] = useState([]);
    const [roommatesLoading, setRoommatesLoading] = useState(false);

    // Initial Load
    useEffect(() => {
        async function load() {
            setLoading(true);
            const result = await getPosts();
            if (result.posts) setPosts(result.posts);
            const fetchedUser = await getCurrentUser();
            setUser(fetchedUser);
            setLoading(false);
        }
        load();
    }, []);

    // Tab Data Loading
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
        if (activeTab === 'roommates' && roommates.length === 0) {
            async function fetchRoommates() {
                setRoommatesLoading(true);
                const result = await getRoommateMatches();
                if (result.success) setRoommates(result.requests);
                setRoommatesLoading(false);
            }
            fetchRoommates();
        }
    }, [activeTab]);

    // Search Logic
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

    // Handlers
    const handlePost = () => {
        if (!postText.trim()) return;
        startTransition(async () => {
            const result = await createPost({ content: postText, category: postCategory });
            if (result.success) {
                setPosts(prev => [{
                    ...result.post,
                    likes: 0,
                    comments: 0,
                    isLiked: false,
                    author: {
                        name: user?.name,
                        profileImage: user?.profileImage,
                        university: user?.university,
                        tier: user?.tier || 'BRONZE'
                    }
                }, ...prev]);
                setPostText('');
                setPostCategory('general');
            }
        });
    };

    const handleLike = async (postId) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const newLiked = !p.isLiked;
                return { ...p, isLiked: newLiked, likes: newLiked ? p.likes + 1 : p.likes - 1 };
            }
            return p;
        }));
        await toggleLike(postId);
    };

    const handleComment = async (postId) => {
        if (!commentText.trim()) return;
        const result = await addComment(postId, commentText);
        if (result.success) {
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
            setCommentText('');
            setCommentingId(null);
        }
    };

    return (
        <main className="min-h-screen pb-24 bg-[#f8fafc] dark:bg-unizy-navy px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pt-6 transition-colors duration-300">

            {/* Brand Aura */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 mb-8 space-y-4">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {isRTL ? 'مجتمع يوني زي' : 'The Student Hub'}
                </h1>

                {/* Search */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for something..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/40 dark:bg-unizy-dark/40 border border-white/60 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none backdrop-blur-xl transition-all shadow-glass"
                    />
                    {searchQuery.length >= 2 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/10 shadow-2xl p-2 z-50">
                            {searchResults.length > 0 ? searchResults.map(res => (
                                <Link key={res.id} href={res.url} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/5 rounded-2xl transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                                        {res.type === 'meal' ? <Utensils className="w-4 h-4 text-orange-500" /> : <Home className="w-4 h-4 text-blue-500" />}
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{res.title}</span>
                                </Link>
                            )) : <p className="p-4 text-sm text-gray-500 text-center">No results found</p>}
                        </div>
                    )}
                </div>
            </div>

            <ServiceBentoGrid />

            {/* Tabs */}
            <div className="relative z-10 flex bg-white/20 dark:bg-unizy-dark/20 backdrop-blur-xl p-1.5 rounded-2xl mb-8 border border-white/40 dark:border-white/5 shadow-glass">
                {HUB_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-white dark:bg-unizy-dark text-brand-600 dark:text-brand-400 shadow-glass-intense scale-[1.02]' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <tab.icon className="w-4 h-4 mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{isRTL ? tab.ar : tab.en}</span>
                    </button>
                ))}
            </div>

            {/* Feed View */}
            {activeTab === 'feed' && (
                <div className="relative z-10 space-y-6">
                    <div className="bg-white/40 dark:bg-unizy-dark/40 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-glass">
                        <textarea
                            value={postText}
                            onChange={(e) => setPostText(e.target.value)}
                            placeholder="Share something with your campus..."
                            className="w-full bg-transparent border-0 focus:ring-0 text-sm font-medium text-gray-900 dark:text-white resize-none"
                            rows={3}
                        />
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                            <select value={postCategory} onChange={(e) => setPostCategory(e.target.value)} className="bg-transparent text-xs font-bold text-gray-400 outline-none border-0">
                                {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            <button onClick={handlePost} disabled={!postText.trim() || isPending} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-500/20">
                                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-500" /></div>
                    ) : posts.map(post => (
                        <div key={post.id} className="bg-white/40 dark:bg-unizy-dark/40 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-white/10 shadow-glass">
                            <div className="flex justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-brand-500/10 overflow-hidden border border-brand-500/20">
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=random`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-black text-gray-900 dark:text-white">{post.author?.name}</h4>
                                            {post.author?.tier && post.author.tier !== 'BRONZE' && (() => {
                                                const TierIcon = TIER_ICONS[post.author.tier].icon;
                                                return <TierIcon className={`w-3 h-3 ${TIER_ICONS[post.author.tier].color}`} />;
                                            })()}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{timeAgo(post.createdAt)}</p>
                                    </div>
                                </div>
                                <ReportButton type="HUB_POST" targetId={post.id} targetUserId={post.authorId} />
                            </div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-6">{post.content}</p>
                            <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-white/5">
                                <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 text-xs font-black ${post.isLiked ? 'text-rose-500' : 'text-gray-400'}`}>
                                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} /> {post.likes}
                                </button>
                                <button onClick={() => setCommentingId(post.id)} className="flex items-center gap-1.5 text-xs font-black text-gray-400">
                                    <MessageCircle className="w-4 h-4" /> {post.comments}
                                </button>
                            </div>
                            {commentingId === post.id && (
                                <div className="mt-4 flex gap-2">
                                    <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Type a comment..." className="flex-1 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
                                    <button onClick={() => handleComment(post.id)} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">Reply</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Roommate View */}
            {activeTab === 'roommates' && (
                <div className="relative z-10 animate-fade-in space-y-6">
                    <div className="bg-brand-600 rounded-[2.5rem] p-10 text-white text-center shadow-xl shadow-brand-500/20 overflow-hidden relative">
                        <Sparkles className="absolute top-4 right-4 w-6 h-6 opacity-20" />
                        <h2 className="text-3xl font-black tracking-tighter mb-2">Roommate Radar</h2>
                        <p className="text-brand-100 font-medium opacity-80">Finding peers with 90%+ compatibility based on your habits.</p>
                    </div>

                    {roommatesLoading ? (
                        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-500" /></div>
                    ) : roommates.length > 0 ? roommates.map(req => (
                        <div key={req.id} className="bg-white/40 dark:bg-unizy-dark/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 dark:border-white/10 shadow-glass flex items-center gap-6">
                            <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-white/5" />
                                <div className="absolute inset-0 rounded-full border-4 border-brand-500" style={{ clipPath: `inset(0 ${100 - req.matchScore}% 0 0)` }} />
                                <span className="text-lg font-black text-gray-900 dark:text-white">{req.matchScore}%</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-black text-gray-900 dark:text-white">{req.user.name}</h4>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{req.area} • {req.budget} EGP</p>
                                <div className="flex gap-2">
                                    {['cleanliness', 'study'].map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[8px] font-black uppercase tracking-widest rounded-lg">{req[tag]}</span>
                                    ))}
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-brand-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 active:scale-95 transition-all">Handshake</button>
                        </div>
                    )) : (
                        <div className="py-20 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-black uppercase tracking-widest">No matches found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Notices View */}
            {activeTab === 'notices' && (
                <div className="relative z-10 animate-fade-in space-y-4">
                    {noticesLoading ? (
                        <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand-500" /></div>
                    ) : notices.map(notice => (
                        <div key={notice.id} className="bg-white/40 dark:bg-unizy-dark/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 dark:border-white/10 shadow-glass border-l-4 border-l-brand-500">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{notice.title}</h3>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">{notice.message}</p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <Megaphone className="w-3 h-3" /> {notice.university}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default function HubPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black">UNIZY HUB...</div>}>
            <HubContent />
        </Suspense>
    );
}
