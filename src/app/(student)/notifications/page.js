"use client";

import React from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Bell, Car, Store, Package, Info, Settings, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const NOTIFICATIONS = [
    {
        id: 'n1',
        type: 'order',
        isUnread: true,
        icon: Package,
        color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
        title: 'Order Preparing',
        arTitle: 'جاري التجهيز',
        message: 'Burger Bros has started preparing your order.',
        arMessage: 'بدأ مطعم برجر بروز في تجهيز طلبك.',
        time: '2m ago'
    },
    {
        id: 'n2',
        type: 'ride',
        isUnread: true,
        icon: Car,
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
        title: 'Driver Arrived',
        arTitle: 'وصل السائق',
        message: 'Your driver Ahmed is waiting at the pickup location.',
        arMessage: 'السائق أحمد في انتظارك في موقع الالتقاء.',
        time: '15m ago'
    },
    {
        id: 'n3',
        type: 'promo',
        isUnread: false,
        icon: Store,
        color: 'bg-green-100 text-green-600 dark:bg-green-900/30',
        title: 'New Deal Available!',
        arTitle: 'عرض جديد متاح!',
        message: 'Get 20% off your next printing job near campus.',
        arMessage: 'احصل على خصم 20% على طلب الطباعة القادم.',
        time: '3h ago'
    },
    {
        id: 'n4',
        type: 'system',
        isUnread: false,
        icon: Info,
        color: 'bg-gray-100 text-gray-600 dark:bg-gray-800',
        title: 'Update Required',
        arTitle: 'تحديث مطلوب',
        message: 'Please update your app to access the new Rewards features.',
        arMessage: 'يرجى تحديث التطبيق للوصول إلى ميزات المكافآت الجديدة.',
        time: 'Yesterday'
    }
];

export default function NotificationsPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';

    return (
        <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pt-6 transition-colors duration-300">

            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--unizy-text-dark)] dark:text-white mb-1">
                        {isRTL ? 'الإشعارات' : 'Notifications'}
                    </h1>
                    <p className="text-[var(--unizy-text-muted)] dark:text-gray-400 text-sm">
                        {isRTL ? 'لديك إشعارين غير مقروئين' : 'You have 2 unread messages'}
                    </p>
                </div>
                <Link href="/account" className="w-10 h-10 rounded-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-[var(--unizy-primary)] transition-colors shadow-sm">
                    <Settings className="w-5 h-5" />
                </Link>
            </div>

            {/* Notifications List */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {NOTIFICATIONS.map((notif, index) => (
                    <div
                        key={notif.id}
                        className={`p-4 sm:p-5 flex items-start gap-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${index !== NOTIFICATIONS.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''} ${notif.isUnread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notif.color} relative`}>
                            <notif.icon className="w-6 h-6" />
                            {notif.isUnread && (
                                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white dark:border-[#1E293B] rounded-full"></span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-bold text-sm sm:text-base truncate pr-2 ${notif.isUnread ? 'text-[var(--unizy-text-dark)] dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {isRTL ? notif.arTitle : notif.title}
                                </h3>
                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap shrink-0">
                                    {notif.time}
                                </span>
                            </div>
                            <p className={`text-sm leading-snug ${notif.isUnread ? 'text-gray-600 dark:text-gray-400 font-medium' : 'text-gray-500 dark:text-gray-500'}`}>
                                {isRTL ? notif.arMessage : notif.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State (Hidden, just for logic) */}
            {NOTIFICATIONS.length === 0 && (
                <div className="py-20 text-center text-gray-500 dark:text-gray-400">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">{isRTL ? 'لا توجد إشعارات حتى الآن' : 'No notifications yet'}</p>
                </div>
            )}

        </main>
    );
}
