'use client';

import { useState } from 'react';
import { Flag, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { submitReport } from '@/app/actions/trust';
import toast from 'react-hot-toast';

const REASONS = [
    { id: 'SCAM', en: 'Scam or Fraud', ar: 'احتيال أو خداع' },
    { id: 'INACCURATE', en: 'Inaccurate Information', ar: 'معلومات غير دقيقة' },
    { id: 'OFFENSIVE', en: 'Offensive Content', ar: 'محتوى مسيء' },
    { id: 'HARASSMENT', en: 'Harassment', ar: 'مضايقة' },
    { id: 'OTHER', en: 'Other', ar: 'أخرى' }
];

export default function ReportButton({ type, targetId, targetUserId, className = "" }) {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) {
            toast.error(isRTL ? 'يرجى اختيار سبب للبلاغ' : 'Please select a reason for reporting');
            return;
        }

        setIsSubmitting(true);
        const res = await submitReport({ type, targetId, reason, details, targetUserId });

        if (res.success) {
            toast.success(isRTL ? 'تم إرسال بلاغك بنجاح. سنقومبمراجعته.' : 'Your report has been submitted. We will review it.');
            setIsOpen(false);
            setReason('');
            setDetails('');
        } else {
            toast.error(res.error || 'Failed to submit report');
        }
        setIsSubmitting(false);
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${className}`}
            >
                <Flag size={12} />
                {isRTL ? 'إبلاغ' : 'Report'}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
                    <div className="relative bg-white dark:bg-unizy-dark w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white">
                                        {isRTL ? 'تقديم بلاغ' : 'Submit a Report'}
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                        {isRTL ? 'ساعدنا في الحفاظ على سلامة الجميع' : 'Help us keep the community safe'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Reason Selection */}
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                                    {isRTL ? 'ما هو السبب؟' : 'Why are you reporting this?'}
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {REASONS.map((r) => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setReason(r.id)}
                                            className={`w-full p-4 rounded-2xl text-left flex items-center justify-between border-2 transition-all ${reason === r.id
                                                    ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10 text-red-600 font-bold'
                                                    : 'border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-gray-500'
                                                }`}
                                        >
                                            <span className="text-sm">{isRTL ? r.ar : r.en}</span>
                                            {reason === r.id && <ShieldCheck size={16} className="text-red-500" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1">
                                    {isRTL ? 'تفاصيل إضافية (اختياري)' : 'Additional Details (Optional)'}
                                </label>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder={isRTL ? 'يرجى تقديم أكبر قدر ممكن من التفاصيل...' : 'Please provide as much detail as possible...'}
                                    rows={3}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 transition-all font-medium resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!reason || isSubmitting}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-3xl shadow-xl shadow-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                ) : (
                                    <>{isRTL ? 'إرسال البلاغ' : 'Submit Report'}</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
