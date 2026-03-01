"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
    Calendar, CheckCircle2, ChevronLeft, CreditCard,
    Zap, Sparkles, ShieldCheck, ArrowRight, Package
} from 'lucide-react';

const PLANS = [
    {
        id: 'weekly-5',
        name: 'Lite Week',
        arName: 'أسبوع خفيف',
        meals: 5,
        period: 'Weekly',
        arPeriod: 'أسبوعي',
        price: '325',
        saving: '15%',
        popular: false,
        features: [
            '5 Meals per week',
            'Lunch or Dinner',
            'Pause anytime',
            'Priority Delivery'
        ],
        arFeatures: [
            '5 وجبات في الأسبوع',
            'غداء أو عشاء',
            'إيقاف في أي وقت',
            'توصيل أولوية'
        ],
        color: 'blue'
    },
    {
        id: 'monthly-20',
        name: 'Student Pro',
        arName: 'برو للطلاب',
        meals: 20,
        period: 'Monthly',
        arPeriod: 'شهري',
        price: '1200',
        saving: '30%',
        popular: true,
        features: [
            '20 Meals per month',
            'Any meal type',
            'Free Delivery',
            'Premium Support',
            'Exclusive Menu'
        ],
        arFeatures: [
            '20 وجبة في الشهر',
            'أي نوع وجبة',
            'توصيل مجاني',
            'دعم مميز',
            'قائمة طعام حصرية'
        ],
        color: 'orange'
    },
    {
        id: 'monthly-10',
        name: 'Balanced',
        arName: 'متوازن',
        meals: 10,
        period: 'Monthly',
        arPeriod: 'شهري',
        price: '650',
        saving: '20%',
        popular: false,
        features: [
            '10 Meals per month',
            'Lunch or Dinner',
            'Flexible scheduling',
            'Standard Delivery'
        ],
        arFeatures: [
            '10 وجبات في الشهر',
            'غداء أو عشاء',
            'جدولة مرنة',
            'توصيل قياسي'
        ],
        color: 'green'
    }
];

export default function MealPlansPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [selectedPlan, setSelectedPlan] = useState('monthly-20');

    const handleBack = () => router.back();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32">
            {/* Header */}
            <div className="bg-brand-600 pt-12 pb-24 px-6 rounded-b-[3rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-400/20 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4"></div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <button
                        onClick={handleBack}
                        className="mb-8 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20"
                    >
                        <ChevronLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>

                    <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
                        {isRTL ? 'خطط وجبات UniZy' : 'UniZy Meal Plans'}
                    </h1>
                    <p className="text-brand-100 text-lg font-medium max-w-2xl">
                        {isRTL
                            ? 'اشترك في خطة وجبات ووفر حتى 30٪. وجبات طازجة، توصيل مجاني، ومرونة كاملة.'
                            : 'Subscribe to a meal plan and save up to 30%. Fresh meals, free delivery, and total flexibility.'
                        }
                    </p>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 shadow-xl transition-all cursor-pointer border-2 ${selectedPlan === plan.id
                                    ? 'border-brand-500 ring-4 ring-brand-500/10 scale-[1.02]'
                                    : 'border-transparent hover:border-brand-500/30'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase mb-3 ${plan.color === 'orange' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10' :
                                        plan.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' :
                                            'bg-green-50 text-green-600 dark:bg-green-500/10'
                                    }`}>
                                    {isRTL ? plan.arPeriod : plan.period}
                                </span>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{isRTL ? plan.arName : plan.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                                    <span className="text-sm font-bold text-gray-400">EGP / {isRTL ? plan.arPeriod : plan.period}</span>
                                </div>
                                <p className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1">
                                    <Zap className="w-3 h-3 fill-current" /> Save {plan.saving} vs. one-time orders
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                {(isRTL ? plan.arFeatures : plan.features).map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className={`w-full py-4 rounded-2xl font-black text-center transition-all ${selectedPlan === plan.id
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                    : 'bg-gray-100 dark:bg-unizy-navy text-gray-500'
                                }`}>
                                {selectedPlan === plan.id ? (isRTL ? 'الخطة المختارة' : 'Selected Plan') : (isRTL ? 'اختر الخطة' : 'Select Plan')}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Benefits / Trust Strip */}
                <div className="mt-16 bg-white dark:bg-unizy-dark rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'لماذا تختار خطط وجبات UniZy؟' : 'Why UniZy Meal Plans?'}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Pause Anytime</h4>
                                    <p className="text-sm text-gray-500">Going home for the weekend? Pause your plan with one tap.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <Package className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Variety & Choice</h4>
                                    <p className="text-sm text-gray-500">Choose from 50+ fresh daily options every single day.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Sticky Footer Mobile / Action Box Desktop */}
                <div className="mt-12 flex flex-col items-center">
                    <button className="w-full max-w-lg h-16 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-lg shadow-2xl shadow-brand-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                        {isRTL ? 'متابعة للدفع' : 'Continue to Checkout'}
                        <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                    <p className="mt-4 text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Secure payment via UniZy Wallet or Card
                    </p>
                </div>
            </div>
        </div>
    );
}
