'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Bell, ArrowLeft, Package, Tag, Info, Mail } from 'lucide-react';
import Link from 'next/link';
import { getNotificationPrefs, updateNotificationPrefs } from '@/app/actions/userPrefs';
import toast from 'react-hot-toast';

export default function NotificationPreferencesPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [prefs, setPrefs] = useState({
        orders: true,
        promos: true,
        system: true,
        marketing: false
    });

    useEffect(() => {
        const loadPrefs = async () => {
            setIsLoading(true);
            const res = await getNotificationPrefs();
            if (res.success && res.prefs) setPrefs(res.prefs);
            setIsLoading(false);
        };
        loadPrefs();
    }, []);

    const handleToggle = (key) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateNotificationPrefs(prefs);
        if (res.success) {
            toast.success(isRTL ? 'تم حفظ التفضيلات' : 'Preferences saved!');
        } else {
            toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save');
        }
        setIsSaving(false);
    };

    const settings = [
        { key: 'orders', icon: Package, title: isRTL ? 'تحديثات الطلبات' : 'Order Updates', desc: isRTL ? 'احصل على إشعارات حول حالة طلبك وتتبعه.' : 'Get notified about your order status and tracking.' },
        { key: 'promos', icon: Tag, title: isRTL ? 'العروض الترويجية' : 'Promotions & Offers', desc: isRTL ? 'تلقي رموز الخصم والعروض الأسبوعية الخاصة بنا.' : 'Receive discount codes and our special weekly offers.' },
        { key: 'system', icon: Info, title: isRTL ? 'إشعارات النظام' : 'System Alerts', desc: isRTL ? 'إعلانات هامة حول التطبيق وحسابك.' : 'Important announcements about the app and your account.' },
        { key: 'marketing', icon: Mail, title: isRTL ? 'رسائل تسويقية' : 'Marketing Emails', desc: isRTL ? 'احصل على رسائل بريد إلكتروني حول المنتجات الجديدة.' : 'Receive emails about new features and ecosystem products.' },
    ];

    return (
        <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto pt-6 transition-colors duration-300" dir={isRTL ? 'rtl' : 'ltr'}>

            <header className="flex items-center gap-4 mb-8">
                <Link href="/account" className="w-10 h-10 rounded-full bg-white dark:bg-[#1E293B] flex items-center justify-center shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <ArrowLeft className={`w-5 h-5 text-gray-900 dark:text-white ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                    {isRTL ? 'تفضيلات الإشعارات' : 'Notification Preferences'}
                </h1>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-[var(--unizy-primary-light)] border-t-[var(--unizy-primary)] animate-spin"></div></div>
            ) : (
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 p-2 shadow-sm">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {settings.map((item) => (
                            <div key={item.key} className="p-4 sm:p-5 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{item.title}</h3>
                                        <button
                                            onClick={() => handleToggle(item.key)}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out relative ${prefs[item.key] ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                        >
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${prefs[item.key] ? (isRTL ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 mt-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-4 bg-[var(--unizy-primary)] hover:bg-blue-700 text-white rounded-2xl font-black transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التفضيلات' : 'Save Preferences')}
                        </button>
                    </div>
                </div>
            )}

        </main>
    );
}
