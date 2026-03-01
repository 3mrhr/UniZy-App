"use client";

import React from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { User, MapPin, CreditCard, Bell, Shield, LogOut, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
    const { language, toggleLanguage } = useLanguage();
    const isRTL = language === 'ar-EG';

    const SETTINGS_SECTIONS = [
        {
            title: isRTL ? 'حسابي' : 'My Account',
            items: [
                { id: 'profile', icon: User, en: 'Personal Details', ar: 'التفاصيل الشخصية' },
                { id: 'addresses', icon: MapPin, en: 'Saved Addresses', ar: 'العناوين المحفوظة' },
                { id: 'payment', icon: CreditCard, en: 'Payment Methods', ar: 'طرق الدفع' },
            ]
        },
        {
            title: isRTL ? 'التفضيلات' : 'Preferences',
            items: [
                { id: 'notifications', icon: Bell, en: 'Notification Settings', ar: 'تفضيلات الإشعارات' },
                // Dark mode is handled in the top nav globally, but we could add it here too
            ]
        },
        {
            title: isRTL ? 'الأمان' : 'Security',
            items: [
                { id: 'privacy', icon: Shield, en: 'Privacy & Security', ar: 'الخصوصية والأمان' },
            ]
        }
    ];

    return (
        <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pt-6 transition-colors duration-300">

            {/* Header Profile Summary */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[var(--unizy-primary)] to-blue-400 p-1">
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#1E293B] overflow-hidden border-2 border-white dark:border-[#1E293B]">
                        <img src="https://ui-avatars.com/api/?name=Omar+Hassan&background=random&color=fff&size=150" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold text-[var(--unizy-text-dark)] dark:text-white truncate">Omar Hassan</h1>
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">omar.hassan@student.aun.edu.eg</p>
                    <div className="inline-flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-md border border-yellow-100 dark:border-yellow-900">
                        <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500">Gold Student</span>
                    </div>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-8">
                {SETTINGS_SECTIONS.map((section, idx) => (
                    <div key={idx}>
                        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">
                            {section.title}
                        </h2>
                        <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                            {section.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-[var(--unizy-primary)] group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-[var(--unizy-text-dark)] dark:text-white">
                                            {isRTL ? item.ar : item.en}
                                        </span>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-gray-300 group-hover:text-[var(--unizy-primary)] transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Special App Language Toggle Section */}
                <div>
                    <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3">
                        {isRTL ? 'إعدادات التطبيق' : 'App Settings'}
                    </h2>
                    <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden text-center">
                        <button
                            onClick={toggleLanguage}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                            <span className="font-bold text-[var(--unizy-text-dark)] dark:text-white">
                                {isRTL ? 'App Language (English)' : 'لغة التطبيق (عربى)'}
                            </span>
                            <ChevronRight className={`w-5 h-5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-[var(--unizy-primary)] transition-all ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Logout */}
                <div className="pt-4">
                    <Link href="/login" className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 py-4 rounded-2xl font-bold transition-colors">
                        <LogOut className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                        {isRTL ? 'تسجيل الخروج' : 'Log Out'}
                    </Link>
                </div>
            </div>

        </main>
    );
}
