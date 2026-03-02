'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Bell, Send, Users, ShieldAlert, Check } from 'lucide-react';
import { broadcastNotification } from '@/app/actions/notifications';
import toast from 'react-hot-toast';

export default function AdminBroadcastPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';

    const [isSending, setIsSending] = useState(false);
    const [payload, setPayload] = useState({
        title: '',
        message: '',
        type: 'SYSTEM',
        targetRole: 'ALL'
    });

    const handleSend = async (e) => {
        e.preventDefault();
        if (!payload.title || !payload.message) return toast.error('Please fill required fields');

        setIsSending(true);
        const res = await broadcastNotification(payload.title, payload.message, payload.type, payload.targetRole);

        setIsSending(false);
        if (res.success) {
            toast.success(`Broadcast sent to ${res.count} users!`);
            setPayload({ title: '', message: '', type: 'SYSTEM', targetRole: 'ALL' });
        } else {
            toast.error(res.error || 'Failed to broadcast');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Broadcast Center</h1>
                        <p className="text-gray-500 dark:text-gray-400">Send push notifications & alerts to your users</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSend} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Notification Title</label>
                            <input
                                required
                                type="text"
                                value={payload.title}
                                onChange={e => setPayload({ ...payload, title: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. Server Maintenance, Welcome Promo..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message Content</label>
                            <textarea
                                required
                                rows={4}
                                value={payload.message}
                                onChange={e => setPayload({ ...payload, message: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                placeholder="Enter the full notification message here..."
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setPayload({ ...payload, targetRole: 'ALL' })} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${payload.targetRole === 'ALL' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700'}`}>
                                    <Users size={20} />
                                    <span className="text-sm font-bold">All Users</span>
                                </button>
                                <button type="button" onClick={() => setPayload({ ...payload, targetRole: 'STUDENT' })} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${payload.targetRole === 'STUDENT' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700'}`}>
                                    <Users size={20} />
                                    <span className="text-sm font-bold">Students Only</span>
                                </button>
                                <button type="button" onClick={() => setPayload({ ...payload, targetRole: 'DRIVER' })} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${payload.targetRole === 'DRIVER' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-700'}`}>
                                    <Users size={20} />
                                    <span className="text-sm font-bold">Drivers Only</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 mt-2">Notification Type</label>
                            <select
                                value={payload.type}
                                onChange={e => setPayload({ ...payload, type: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-medium text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="SYSTEM">General System Info</option>
                                <option value="ORDER">Order Update</option>
                                <option value="PROMO">Promotions & Offers</option>
                                <option value="SAFETY">Safety Alert (Red)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button
                        disabled={isSending}
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isSending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={20} />}
                        {isSending ? 'Broadcasting...' : 'Blast Broadcast'}
                    </button>
                </div>
            </form>
        </div>
    );
}
