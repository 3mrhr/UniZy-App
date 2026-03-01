"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Gift, Wallet, History, Ticket, ArrowUpRight, TrendingUp, HelpCircle } from 'lucide-react';

const REWARDS_TABS = [
    { id: 'overview', icon: Wallet, en: 'Overview', ar: 'نظرة عامة' },
    { id: 'redeem', icon: Ticket, en: 'Redeem', ar: 'استبدال' },
    { id: 'history', icon: History, en: 'History', ar: 'السجل' },
];

const REDEMPTION_OPTIONS = [
    { id: 'ro1', points: 50, value: '5 EGP', enTitle: 'Discount on Next Ride', arTitle: 'خصم على المشوار القادم', icon: '🚗', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'ro2', points: 100, value: '10 EGP', enTitle: 'Food Delivery Voucher', arTitle: 'قسيمة توصيل طعام', icon: '🍔', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { id: 'ro3', points: 500, value: '50 EGP', enTitle: 'Wallet Cashback', arTitle: 'استرداد نقدي في المحفظة', icon: '💰', color: 'bg-green-100 dark:bg-green-900/30' },
];

const POINTS_HISTORY = [
    { id: 'h1', type: 'earn', points: '+15', description: 'Food Order #8821', arDescription: 'طلب طعام #8821', date: 'Oct 24, 2023' },
    { id: 'h2', type: 'redeem', points: '-50', description: 'Ride Discount Voucher', arDescription: 'قسيمة خصم مشوار', date: 'Oct 20, 2023' },
    { id: 'h3', type: 'earn', points: '+8', description: 'Campus Ride', arDescription: 'مشوار الحرم الجامعي', date: 'Oct 19, 2023' },
    { id: 'h4', type: 'earn', points: '+120', description: 'Housing Booking Deposit', arDescription: 'عربون حجز سكن', date: 'Oct 15, 2023' },
];

export default function RewardsPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [activeTab, setActiveTab] = useState('overview');

    const currentPoints = 345;
    const totalEarned = 1250;
    const eqvEgp = currentPoints / 10; // Rule: 1 EGP = 0.1 point -> 10 points = 1 EGP

    return (
        <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pt-6 transition-colors duration-300">

            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--unizy-text-dark)] dark:text-white flex items-center gap-2">
                    <Gift className="w-8 h-8 text-[var(--unizy-primary)]" />
                    {isRTL ? 'المكافآت' : 'Rewards'}
                </h1>
                <button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-[var(--unizy-primary)] transition-colors">
                    <HelpCircle className="w-5 h-5" />
                </button>
            </div>

            {/* Main Points Card */}
            <div className="bg-gradient-to-br from-[var(--unizy-primary)] to-blue-600 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl shadow-blue-500/20 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-blue-100 font-medium mb-1">{isRTL ? 'نقاطك الحالية' : 'Current Points'}</p>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-5xl font-black">{currentPoints}</h2>
                                <span className="text-xl text-blue-200">pts</span>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-center">
                            <p className="text-xs text-blue-50 mb-0.5">{isRTL ? 'تساوي' : 'Equals'}</p>
                            <p className="font-bold text-lg">≈ {eqvEgp} EGP</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-5 mt-2">
                        <div>
                            <p className="text-xs text-blue-200 mb-1">{isRTL ? 'إجمالي المكتسب' : 'Total Earned'}</p>
                            <p className="font-semibold">{totalEarned} <span className="text-xs font-normal opacity-80">pts</span></p>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-xs text-blue-200 mb-1">{isRTL ? 'معدل الكسب' : 'Earning Rate'}</p>
                            <p className="font-semibold text-sm">1 EGP = 0.1 pt</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1.5 rounded-2xl mb-8">
                {REWARDS_TABS.map((tab) => (
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

            {/* Tab Content */}
            <div className="animate-fade-in">

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Progress to next tier mock */}
                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-[var(--unizy-text-dark)] dark:text-white text-sm">
                                        {isRTL ? 'المستوى الذهبي' : 'Gold Tier'}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-medium">345 / 500 pts</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: '69%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {isRTL ? 'احصل على 155 نقطة إضافية لفتح مميزات المستوى الذهبي.' : 'Earn 155 more pts to unlock Gold perks.'}
                                </p>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-[var(--unizy-text-dark)] dark:text-white mb-4 mt-6">
                            {isRTL ? 'كيف تكسب النقاط؟' : 'How to earn points?'}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#1E293B] shadow-sm flex items-center justify-center text-xl">🍔</div>
                                <div>
                                    <p className="font-medium text-sm text-[var(--unizy-text-dark)] dark:text-white">{isRTL ? 'اطلب طعام' : 'Order Food'}</p>
                                    <p className="text-xs text-gray-500">10 EGP = 1 point</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#1E293B] shadow-sm flex items-center justify-center text-xl">🚗</div>
                                <div>
                                    <p className="font-medium text-sm text-[var(--unizy-text-dark)] dark:text-white">{isRTL ? 'احجز مشوار' : 'Book a Ride'}</p>
                                    <p className="text-xs text-gray-500">10 EGP = 1 point</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Redeem Tab */}
                {activeTab === 'redeem' && (
                    <div className="space-y-4">
                        {REDEMPTION_OPTIONS.map((option) => (
                            <div key={option.id} className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${option.color} shrink-0`}>
                                    {option.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[var(--unizy-text-dark)] dark:text-white text-sm truncate">
                                        {isRTL ? option.arTitle : option.enTitle}
                                    </h3>
                                    <p className="text-[var(--unizy-primary)] font-bold mt-1 text-lg leading-none">{option.value}</p>
                                </div>
                                <button
                                    disabled={currentPoints < option.points}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all shrink-0 ${currentPoints >= option.points
                                            ? 'bg-[var(--unizy-primary)] text-white hover:opacity-90'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {option.points} pts
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {POINTS_HISTORY.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'earn' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-red-50 dark:bg-red-900/20 text-red-500'
                                        }`}>
                                        {item.type === 'earn' ? <ArrowUpRight className="w-5 h-5 rotate-45" /> : <ArrowUpRight className="w-5 h-5 group-hover:-translate-y-1 transition-transform -rotate-135" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-[var(--unizy-text-dark)] dark:text-white text-sm">
                                            {isRTL ? item.arDescription : item.description}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.date}</p>
                                    </div>
                                </div>
                                <span className={`font-bold ${item.type === 'earn' ? 'text-green-500' : 'text-[var(--unizy-text-dark)] dark:text-white'}`}>
                                    {item.points}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

            </div>

        </main>
    );
}
