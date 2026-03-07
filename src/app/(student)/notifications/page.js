'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Bell, Check, Trash2, ArrowLeft, Package, Star, Info, ShieldAlert } from 'lucide-react';
import { getMyNotifications, markNotificationsAsRead, deleteNotification, clearAllNotifications } from '@/app/actions/notifications';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';

    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setIsLoading(true);
        const res = await getMyNotifications();
        if (res.success) {
            setNotifications(res.notifications);
        } else {
            toast.error(res.error || 'Failed to load notifications');
        }
        setIsLoading(false);
    };

    const handleMarkAllRead = async () => {
        const res = await markNotificationsAsRead();
        if (res.success) {
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All marked as read');
        }
    };

    const handleMarkRead = async (id) => {
        const res = await markNotificationsAsRead([id]);
        if (res.success) {
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        const res = await deleteNotification(id);
        if (res.success) {
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success('Notification deleted');
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to clear all notifications?')) return;
        const res = await clearAllNotifications();
        if (res.success) {
            setNotifications([]);
            toast.success('Inbox cleared');
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return past.toLocaleDateString();
    };

    const getIconInfo = (type) => {
        switch (type) {
            case 'ORDER': return { icon: Package, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' };
            case 'REFERRAL': return { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
            case 'SAFETY': return { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
            default: return { icon: Info, color: 'text-brand-500', bg: 'bg-brand-100 dark:bg-brand-900/30' };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32 transition-colors duration-300" dir={isRTL ? 'rtl' : 'ltr'}>
            <header className="px-6 py-8 max-w-2xl mx-auto w-full flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/students" className="w-10 h-10 rounded-full bg-white dark:bg-unizy-dark flex items-center justify-center shadow-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                    </Link>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Notifications</h1>
                </div>
                <div className="flex gap-2">
                    {notifications.length > 0 && (
                        <button onClick={handleClearAll} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={20} />
                        </button>
                    )}
                    {notifications.some(n => !n.isRead) && (
                        <button onClick={handleMarkAllRead} className="text-sm font-bold text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-xl transition-colors">
                            Mark All Read
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 w-full">
                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div></div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <Bell size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">You're all caught up!</h3>
                        <p className="text-gray-500">No new notifications at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif) => {
                            const IconData = getIconInfo(notif.type);
                            const Icon = IconData.icon;

                            return (
                                <div key={notif.id} onClick={() => {
                                    if (!notif.isRead) handleMarkRead(notif.id);
                                    if (notif.link) window.location.href = notif.link;
                                }} className={`group p-4 rounded-3xl border ${notif.isRead ? 'bg-white dark:bg-unizy-dark border-gray-100 dark:border-white/5 shadow-sm opacity-70' : 'bg-white dark:bg-unizy-dark border-brand-100 dark:border-brand-900/30 shadow-md cursor-pointer hover:border-brand-300 transition-colors'} flex gap-4`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${IconData.bg} ${IconData.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`font-bold ${notif.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>{notif.title}</h4>
                                            <div className="flex items-center gap-2">
                                                {!notif.isRead && <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0"></span>}
                                                <button
                                                    onClick={(e) => handleDelete(e, notif.id)}
                                                    className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">{notif.message}</p>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatTime(notif.createdAt)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
