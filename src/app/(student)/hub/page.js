"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Users, Megaphone, Edit3, MessageCircle, Heart, Share2, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

const HUB_TABS = [
    { id: 'feed', en: 'Community Feed', ar: 'المجتمع', icon: Users },
    { id: 'notices', en: 'Campus Notices', ar: 'إعلانات الحرم', icon: Megaphone },
];

const MOCK_POSTS = [
    {
        id: 'p1',
        author: 'Sarah M.',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+M&background=0D8ABC&color=fff',
        role: 'Student - Dentistry',
        time: '2 hours ago',
        content: 'Does anyone have the past exams for BioPhysics 101? Could really use some help studying for midterms next week! 🙏',
        arContent: 'حد معاه امتحانات السنين اللي فاتت لمادة البيوفيزياء 101؟ محتاجة مساعدة في المذاكرة للميدتيرم الأسبوع الجاي! 🙏',
        likes: 12,
        comments: 5,
        tag: 'Study Help'
    },
    {
        id: 'p2',
        author: 'Ahmed Kareem',
        avatar: 'https://ui-avatars.com/api/?name=Ahmed+Kareem&background=F59E0B&color=fff',
        role: 'Student - Engineering',
        time: '5 hours ago',
        content: 'Found a black wallet near the library entrance. Handed it over to the security desk at gate 2.',
        arContent: 'لقيت محفظة سودة قريبة من مدخل المكتبة. سلمتها لمكتب الأمن على بوابة 2.',
        likes: 45,
        comments: 2,
        tag: 'Lost & Found'
    },
    {
        id: 'p3',
        author: 'Nour El-Din',
        avatar: 'https://ui-avatars.com/api/?name=Nour+E&background=10B981&color=fff',
        role: 'Student - Pharmacy',
        time: '1 day ago',
        content: 'Looking for a 3rd roommate in a furnished apartment near the university (5 mins walk). Rent is super affordable. DM me!',
        arContent: 'بدور على شريك سكن تالت في شقة مفروشة قريبة من الجامعة (5 دقايق مشي). الإيجار مناسب جداً. ابعتلي رسالة!',
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80',
        likes: 28,
        comments: 14,
        tag: 'Housing'
    }
];

export default function HubPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [activeTab, setActiveTab] = useState('feed');
    const [postText, setPostText] = useState('');

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
                            <button className="text-gray-400 hover:text-[var(--unizy-primary)] transition-colors p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <button
                                className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${postText.trim().length > 0
                                    ? 'bg-[var(--unizy-primary)] text-white hover:opacity-90 shadow-md shadow-blue-500/20'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <Edit3 className="w-4 h-4" />
                                {isRTL ? 'نشر' : 'Post'}
                            </button>
                        </div>
                    </div>

                    {/* Feed Stream */}
                    <div className="space-y-4">
                        {MOCK_POSTS.map(post => (
                            <div key={post.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                                {/* Post Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3 items-center">
                                        <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700" />
                                        <div>
                                            <h3 className="font-bold text-[var(--unizy-text-dark)] dark:text-white text-sm">{post.author}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{post.role}</span>
                                                <span>•</span>
                                                <span>{post.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Post Tag */}
                                <div className="mb-2">
                                    <span className="inline-block bg-[var(--unizy-primary)] bg-opacity-10 text-[var(--unizy-primary)] text-xs font-bold px-2 py-0.5 rounded border border-[var(--unizy-primary)]/20">
                                        {post.tag}
                                    </span>
                                </div>

                                {/* Post Content */}
                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                                    {isRTL ? post.arContent : post.content}
                                </p>

                                {/* Post Image (if any) */}
                                {post.image && (
                                    <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800 max-h-64">
                                        <img src={post.image} alt="Post attachment" className="w-full h-full object-cover" />
                                    </div>
                                )}

                                {/* Post Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex gap-4">
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium group">
                                            <Heart className="w-5 h-5 group-hover:fill-red-500" />
                                            <span>{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-[var(--unizy-primary)] transition-colors text-sm font-medium">
                                            <MessageCircle className="w-5 h-5" />
                                            <span>{post.comments}</span>
                                        </button>
                                    </div>
                                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-[var(--unizy-primary)] transition-colors text-sm font-medium">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
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
