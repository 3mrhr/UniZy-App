'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Send,
    AlertCircle,
    Info,
    Tag,
    ChevronDown,
    Building2,
    Truck,
    ShoppingBag,
    Utensils,
    HelpCircle
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { createTicket } from '@/app/actions/support';
import toast from 'react-hot-toast';

const CATEGORIES = [
    { id: 'HOUSING', en: 'Housing', ar: 'السكن', icon: Building2 },
    { id: 'TRANSPORT', en: 'Transport', ar: 'المواصلات', icon: Truck },
    { id: 'DELIVERY', en: 'Delivery', ar: 'التوصيل', icon: ShoppingBag },
    { id: 'MEALS', en: 'Meals', ar: 'الوجبات', icon: Utensils },
    { id: 'OTHER', en: 'Other', ar: 'أخرى', icon: HelpCircle }
];

const PRIORITIES = [
    { id: 'LOW', en: 'Low', ar: 'منخفضة' },
    { id: 'MEDIUM', en: 'Medium', ar: 'متوسطة' },
    { id: 'HIGH', en: 'High', ar: 'عالية' },
    { id: 'URGENT', en: 'Urgent', ar: 'عاجلة' }
];

export default function NewTicketPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';

    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('OTHER');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !description) {
            const newErrors = {};
            if (!subject) newErrors.subject = true;
            if (!description) newErrors.description = true;
            setErrors(newErrors);
            toast.error(isRTL ? 'يرجى ملء جميع الحقول' : 'Please fill in all required fields');
            return;
        }
        setErrors({});

        setIsSubmitting(true);
        const res = await createTicket({ subject, category, description, priority });

        if (res.success) {
            toast.success(isRTL ? 'تم إرسال التذكرة بنجاح' : 'Ticket submitted successfully');
            router.push('/support');
        } else {
            toast.error(res.error || 'Failed to submit ticket');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 py-4 px-6 md:px-12">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                        <ChevronLeft className={`w-5 h-5 text-gray-900 dark:text-white ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white">
                            {isRTL ? 'تذكرة جديدة' : 'New Support Ticket'}
                        </h1>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            {isRTL ? 'نحن هنا للمساعدة' : 'We are here to help'}
                        </p>
                    </div>
                </div>
            </div>

            <main className="max-w-xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 px-1">
                            {isRTL ? 'فئة المشكلة' : 'What are you having trouble with?'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isSelected = category === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${isSelected
                                            ? 'border-unizy-primary bg-unizy-primary/5 text-unizy-primary shadow-lg shadow-unizy-primary/10'
                                            : 'border-gray-100 dark:border-white/5 bg-white dark:bg-unizy-dark text-gray-500 hover:border-unizy-primary/50'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-unizy-primary' : 'text-gray-400'}`} />
                                        <span className="text-xs font-bold">{isRTL ? cat.ar : cat.en}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className={`bg-white dark:bg-unizy-dark p-6 rounded-3xl border ${errors.subject ? 'border-red-300 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-900/30' : 'border-gray-100 dark:border-white/5'} shadow-sm transition-all`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-5 h-5 text-unizy-primary" />
                            <h3 className="font-bold text-gray-900 dark:text-white">{isRTL ? 'الموضوع' : 'Subject'}</h3>
                            {errors.subject && <span className="text-red-500 text-xs font-bold ml-auto">{isRTL ? 'مطلوب' : 'Required'}</span>}
                        </div>
                        <input
                            type="text"
                            placeholder={isRTL ? 'مثال: مشكلة في الدفع' : 'e.g., Payment Issue'}
                            value={subject}
                            onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors(prev => ({ ...prev, subject: false })); }}
                            className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-unizy-primary transition-all font-medium"
                        />
                    </div>

                    {/* Description */}
                    <div className={`bg-white dark:bg-unizy-dark p-6 rounded-3xl border ${errors.description ? 'border-red-300 dark:border-red-600 ring-2 ring-red-200 dark:ring-red-900/30' : 'border-gray-100 dark:border-white/5'} shadow-sm transition-all`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-5 h-5 text-unizy-primary" />
                            <h3 className="font-bold text-gray-900 dark:text-white">{isRTL ? 'التفاصيل' : 'Details'}</h3>
                            {errors.description && <span className="text-red-500 text-xs font-bold ml-auto">{isRTL ? 'مطلوب' : 'Required'}</span>}
                        </div>
                        <textarea
                            placeholder={isRTL ? 'يرجى تقديم أكبر قدر ممكن من التفاصيل...' : 'Please provide as much detail as possible...'}
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(prev => ({ ...prev, description: false })); }}
                            rows={5}
                            className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-gray-900 dark:text-white focus:ring-2 focus:ring-unizy-primary transition-all font-medium resize-none"
                        />
                    </div>

                    {/* Priority */}
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-unizy-primary" />
                            <h3 className="font-bold text-gray-900 dark:text-white">{isRTL ? 'الأولوية' : 'Priority'}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {PRIORITIES.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setPriority(p.id)}
                                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${priority === p.id
                                        ? 'bg-unizy-primary text-white shadow-lg shadow-unizy-primary/20'
                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200'
                                        }`}
                                >
                                    {isRTL ? p.ar : p.en}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-unizy-primary hover:bg-unizy-primary/90 text-white font-black py-5 rounded-3xl shadow-xl shadow-unizy-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>{isRTL ? 'إرسال الطلب' : 'Submit Request'}</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Information Notice */}
                <div className="mt-8 p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-900/20 flex gap-4">
                    <Info className="w-6 h-6 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                        {isRTL
                            ? 'سيقوم فريق الدعم لدينا بمراجعة طلبك خلال 24 ساعة عمل. ستصلك إشعارات بأي تحديثات على طلبك هنا وفي بريدك الإلكتروني.'
                            : 'Our support team will review your request within 24 business hours. You will receive notifications for any updates here and in your email.'}
                    </p>
                </div>
            </main>
        </div>
    );
}
