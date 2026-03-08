"use client";

import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Gift, Wallet, History, Ticket, ArrowUpRight, TrendingUp, HelpCircle, Flame, Medal, Star, Trophy, Crown, Sparkles } from 'lucide-react';
import { spendRewardPoints, getRewardBalance, updateDailyStreak } from '@/app/actions/rewards-engine';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const REWARDS_TABS = [
    { id: 'overview', icon: Wallet, en: 'Overview', ar: 'نظرة عامة' },
    { id: 'redeem', icon: Ticket, en: 'Redeem', ar: 'استبدال' },
    { id: 'history', icon: History, en: 'History', ar: 'السجل' },
];

const TIER_CONFIG = {
    BRONZE: { color: 'text-amber-600', bg: 'bg-amber-100', icon: Medal, multiplier: 1.0, next: 500, label: 'Bronze' },
    SILVER: { color: 'text-gray-400', bg: 'bg-gray-100', icon: Star, multiplier: 1.2, next: 1500, label: 'Silver' },
    GOLD: { color: 'text-yellow-500', bg: 'bg-yellow-100', icon: Trophy, multiplier: 1.5, next: 5000, label: 'Gold' },
    PLATINUM: { color: 'text-purple-500', bg: 'bg-purple-100', icon: Crown, multiplier: 2.0, next: Infinity, label: 'Platinum' }
};

const REDEMPTION_OPTIONS = [
    { id: 'ro1', points: 50, value: '5 EGP', enTitle: 'Ride Discount', arTitle: 'خصم مشوار', icon: '🚗', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'ro2', points: 100, value: '10 EGP', enTitle: 'Food Voucher', arTitle: 'قسيمة طعام', icon: '🍔', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { id: 'ro3', points: 500, value: '50 EGP', enTitle: 'Wallet Credits', arTitle: 'رصيد محفظة', icon: '💰', color: 'bg-green-100 dark:bg-green-900/30' },
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
    const [currentPoints, setCurrentPoints] = useState(0);
    const [totalEarned, setTotalEarned] = useState(0);
    const [tier, setTier] = useState('BRONZE');
    const [streak, setStreak] = useState(0);
    const [isRedeeming, setIsRedeeming] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        async function loadData() {
            const [balanceRes, streakRes] = await Promise.all([
                getRewardBalance(),
                updateDailyStreak() // Self-trigger on visit
            ]);

            if (balanceRes.success) {
                setCurrentPoints(balanceRes.balance || 0);
                setTotalEarned(balanceRes.totalEarned || 0);
                setHistory(balanceRes.history || []);
            }
            if (streakRes.success) {
                setStreak(streakRes.newCount || streakRes.currentStreak || 0);
                if (streakRes.pointsAwarded) {
                    toast.success(`Daily Streak Bonus! +${streakRes.pointsAwarded} pts`, { icon: '🔥' });
                }
            }
        }
        loadData();
    }, []);

    const handleRedeem = async (option) => {
        if (currentPoints < option.points) return;
        setIsRedeeming(option.id);
        try {
            const res = await spendRewardPoints(option.points, `Redeemed: ${option.enTitle}`);
            if (res.success) {
                setCurrentPoints(prev => prev - option.points);
                toast.success(`Redeemed ${option.value} successfully!`);
            } else {
                toast.error(res.error || 'Redemption failed');
            }
        } catch {
            toast.error('Something went wrong');
        }
        setIsRedeeming(null);
    };

    const eqvEgp = Math.round(currentPoints / 10); // Rule: 10 points = 1 EGP

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

            {/* Quick Links */}
            <div className="flex gap-3 mb-4">
                <Link href="/rewards/referrals" className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl text-sm font-bold hover:bg-amber-100 transition-colors">🔗 Referral Program</Link>
            </div>

            {/* Premium Points Card */}
            <div className="bg-gradient-to-br from-unizy-navy via-brand-900 to-black rounded-[2.5rem] p-8 text-white mb-8 shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            <span className="text-xs font-black tracking-widest uppercase">{streak} Day Streak</span>
                        </div>
                        <div className="flex items-center gap-2 bg-brand-500/20 px-4 py-1.5 rounded-full border border-brand-500/30">
                            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-brand-100">x{TIER_CONFIG[tier].multiplier} Boost</span>
                        </div>
                    </div>

                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Available Balance</p>
                    <div className="flex items-baseline gap-3 mb-8">
                        <h2 className="text-6xl font-black tracking-tighter">{currentPoints}</h2>
                        <span className="text-xl font-bold text-gray-500">Points</span>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Est. Value</span>
                            <span className="text-lg font-bold">EGP {eqvEgp}</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Life-Time</span>
                            <span className="text-lg font-bold">{totalEarned}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tier Progression */}
            <div className="bg-white dark:bg-unizy-dark rounded-[2rem] p-6 mb-8 border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-2xl ${TIER_CONFIG[tier].bg} flex items-center justify-center`}>
                        {(() => {
                            const Icon = TIER_CONFIG[tier].icon;
                            return <Icon className={`w-7 h-7 ${TIER_CONFIG[tier].color}`} />;
                        })()}
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{TIER_CONFIG[tier].label} Tier</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase">Current Status</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span>Progress to Silver</span>
                        <span>{currentPoints} / {TIER_CONFIG[tier].next} pts</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((currentPoints / TIER_CONFIG[tier].next) * 100, 100)}%` }}
                            className="h-full bg-gradient-to-r from-brand-500 to-blue-500 rounded-full"
                        />
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
                                    onClick={() => handleRedeem(option)}
                                    disabled={currentPoints < option.points || isRedeeming === option.id}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all shrink-0 ${currentPoints >= option.points
                                        ? 'bg-[var(--unizy-primary)] text-white hover:opacity-90'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {isRedeeming === option.id ? '...' : `${option.points} pts`}
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
