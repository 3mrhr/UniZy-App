"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { HelpCircle, MessageSquare, Phone, FileText, ChevronRight, AlertCircle, Search, Send } from 'lucide-react';

const FAQ_CATEGORIES = [
    { id: '1', icon: FileText, en: 'App Usage Guides', ar: 'أدلة استخدام التطبيق' },
    { id: '2', icon: HelpCircle, en: 'Payments & Rewards', ar: 'المدفوعات والمكافآت' },
    { id: '3', icon: AlertCircle, en: 'Cancellations', ar: 'الإلغاء والاسترداد' },
];

export default function SupportPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [showTicketForm, setShowTicketForm] = useState(false);

    return (
        <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pt-6 transition-colors duration-300">

            {/* Header */}
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-[var(--unizy-text-dark)] dark:text-white mb-3">
                    {isRTL ? 'مركز المساعدة ودعم الطلاب' : 'Help & Support Center'}
                </h1>
                <p className="text-[var(--unizy-text-muted)] dark:text-gray-400 max-w-xl">
                    {isRTL ? 'نحن هنا لمساعدتك في أي وقت. كيف يمكننا خدمتك اليوم؟' : 'We are here to help you anytime. How can we assist you today?'}
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-gray-400`} />
                <input
                    type="text"
                    placeholder={isRTL ? 'ابحث في قواعد المعرفة...' : 'Search knowledge base...'}
                    className={`w-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-2xl py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-[var(--unizy-text-dark)] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--unizy-primary)] transition-all shadow-sm`}
                />
            </div>

            {/* Quick Contact Options */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <button
                    onClick={() => setShowTicketForm(true)}
                    className="bg-[var(--unizy-primary)] text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-md shadow-blue-500/20"
                >
                    <MessageSquare className="w-6 h-6" />
                    <span className="font-bold text-sm">{isRTL ? 'فتح تذكرة دعم' : 'Open Ticket'}</span>
                </button>

                <button className="bg-white dark:bg-[#1E293B] text-[var(--unizy-text-dark)] dark:text-white border border-gray-200 dark:border-gray-700 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all">
                    <Phone className="w-6 h-6 text-green-500" />
                    <span className="font-bold text-sm">{isRTL ? 'اتصال طارئ' : 'Emergency Call'}</span>
                </button>
            </div>

            {/* FAQ Categories */}
            {!showTicketForm ? (
                <div>
                    <h2 className="text-lg font-bold text-[var(--unizy-text-dark)] dark:text-white mb-4">
                        {isRTL ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
                    </h2>
                    <div className="space-y-3">
                        {FAQ_CATEGORIES.map((cat) => (
                            <button key={cat.id} className="w-full bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between hover:shadow-sm transition-shadow group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-[var(--unizy-primary)]">
                                        <cat.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-[var(--unizy-text-dark)] dark:text-white">
                                        {isRTL ? cat.ar : cat.en}
                                    </span>
                                </div>
                                <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-[var(--unizy-primary)] transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                /* Submit Ticket Form */
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-[var(--unizy-text-dark)] dark:text-white flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-[var(--unizy-primary)]" />
                            {isRTL ? 'تفاصيل التذكرة' : 'Ticket Details'}
                        </h2>
                        <button onClick={() => setShowTicketForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm font-medium">
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Ticket Submitted'); setShowTicketForm(false); }}>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {isRTL ? 'نوع المشكلة' : 'Issue Category'}
                            </label>
                            <select className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-[var(--unizy-text-dark)] dark:text-white focus:ring-2 focus:ring-[var(--unizy-primary)] outline-none">
                                <option>{isRTL ? 'مشكلة في طلب طعام' : 'Food Order Issue'}</option>
                                <option>{isRTL ? 'مشكلة في مشوار' : 'Ride Issue'}</option>
                                <option>{isRTL ? 'استفسار سكن' : 'Housing Inquiry'}</option>
                                <option>{isRTL ? 'أخرى' : 'Other'}</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {isRTL ? 'الوصف' : 'Description'}
                            </label>
                            <textarea
                                rows={4}
                                placeholder={isRTL ? 'اشرح مشكلتك بالتفصيل...' : 'Explain your issue in detail...'}
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-[var(--unizy-text-dark)] dark:text-white focus:ring-2 focus:ring-[var(--unizy-primary)] outline-none resize-none"
                            ></textarea>
                        </div>

                        <button type="submit" className="w-full bg-[var(--unizy-primary)] text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                            <Send className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                            {isRTL ? 'إرسال التذكرة' : 'Submit Ticket'}
                        </button>
                    </form>
                </div>
            )}

        </main>
    );
}
