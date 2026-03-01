"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ArrowLeft, ArrowRight, Share2, Heart, Tag, MapPin, Star, Clock, Info, CheckCircle2, Copy } from 'lucide-react';

const MOCK_DEAL = {
    id: 'd1',
    merchant: 'Burger Bros',
    title: '50% Off Second Burger',
    arTitle: 'خصم 50% على البرجر الثاني',
    description: 'Enjoy a delicious 50% discount on any second burger of equal or lesser value. Valid for dine-in and takeout.',
    arDescription: 'استمتع بخصم رائع 50٪ على أي برجر ثاني بقيمة مساوية أو أقل. صالح للأكل في المطعم والتيك أواي.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80',
    distance: '1.2 km',
    rating: 4.8,
    type: 'discount',
    value: '50%',
    expiresIn: '2 days',
    originalPrice: '150',
    discountPrice: '112.5',
    currency: 'EGP',
    terms: [
        'Valid for students with active UniZy ID.',
        'Cannot be combined with other offers.',
        'One use per day per student.'
    ],
    arTerms: [
        'صالح للطلاب الذين يحملون هوية UniZy نشطة.',
        'لا يمكن دمجه مع عروض أخرى.',
        'استخدام واحد في اليوم لكل طالب.'
    ],
    branches: [
        { name: 'University Campus Branch', arName: 'فرع الحرم الجامعي', distance: '1.2 km' },
        { name: 'Downtown Branch', arName: 'فرع وسط البلد', distance: '4.5 km' }
    ],
    promoCode: 'UNIBROS50'
};

export default function DealDetailsPage({ params }) {
    const router = useRouter();
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [isSaved, setIsSaved] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(MOCK_DEAL.promoCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    return (
        <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] transition-colors duration-300">

            {/* Dynamic Header Image */}
            <div className="relative h-64 sm:h-80 w-full">
                <img src={MOCK_DEAL.image} alt={MOCK_DEAL.merchant} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>

                {/* Top Nav Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pt-safe">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                    >
                        {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                    </button>
                    <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsSaved(!isSaved)}
                            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        >
                            <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Bottom Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-[var(--unizy-primary)] text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                            <Tag className="w-3.5 h-3.5" /> {isRTL ? 'خصم حصري' : 'Exclusive Deal'}
                        </span>
                        <span className="flex items-center gap-1 text-sm bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" /> {MOCK_DEAL.rating}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight shadow-black drop-shadow-lg">
                        {isRTL ? MOCK_DEAL.arTitle : MOCK_DEAL.title}
                    </h1>
                    <p className="text-gray-200 mt-1 flex items-center gap-2 shadow-black drop-shadow-md font-medium">
                        {MOCK_DEAL.merchant}
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

                {/* Important Info Strip */}
                <div className="flex bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 mb-6 divide-x dark:divide-gray-700 rtl:divide-x-reverse">
                    <div className="flex-1 text-center px-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{isRTL ? 'ينتهي خلال' : 'Expires In'}</p>
                        <p className="font-bold text-orange-500 flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" /> {MOCK_DEAL.expiresIn}
                        </p>
                    </div>
                    <div className="flex-1 text-center px-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{isRTL ? 'توفير' : 'Savings'}</p>
                        <p className="font-bold text-green-500">{MOCK_DEAL.value}</p>
                    </div>
                    <div className="flex-1 text-center px-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{isRTL ? 'السعر بعد الخصم' : 'Est. Price'}</p>
                        <p className="font-bold text-[var(--unizy-text-dark)] dark:text-white">{MOCK_DEAL.discountPrice} <span className="text-xs font-normal text-gray-500">{MOCK_DEAL.currency}</span></p>
                    </div>
                </div>

                {/* Promo Code Action */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-900 mb-8 flex flex-col items-center text-center">
                    <h3 className="font-bold text-[var(--unizy-text-dark)] dark:text-white mb-2">
                        {isRTL ? 'استخدم كود الخصم في المطعم' : 'Use Promo Code at Merchant'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 px-4">
                        {isRTL ? 'اعرض هذا الكود للكاشير عند الدفع للحصول على الخصم.' : 'Show this code to the cashier in-store to claim your discount.'}
                    </p>

                    <div className="relative group w-full max-w-xs cursor-pointer" onClick={handleCopyCode}>
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-xl blur-md group-hover:bg-opacity-30 transition-all"></div>
                        <div className="relative flex items-center justify-between bg-white dark:bg-[#1E293B] border-2 border-dashed border-[var(--unizy-primary)] rounded-xl py-3 px-6 shadow-sm">
                            <span className="font-mono text-xl font-bold tracking-wider text-[var(--unizy-primary)] w-full text-center">
                                {MOCK_DEAL.promoCode}
                            </span>
                            {codeCopied ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500 absolute right-4" />
                            ) : (
                                <Copy className="w-5 h-5 text-gray-400 group-hover:text-[var(--unizy-primary)] absolute right-4 transition-colors" />
                            )}
                        </div>
                    </div>
                    {codeCopied && <p className="text-xs text-green-500 mt-2 font-medium">{isRTL ? 'تم نسخ الكود!' : 'Code copied!'}</p>}
                </div>

                {/* Details Section */}
                <div className="mb-8 space-y-6">
                    <section>
                        <h3 className="text-lg font-bold text-[var(--unizy-text-dark)] dark:text-white flex items-center gap-2 mb-3">
                            <Info className="w-5 h-5 text-[var(--unizy-primary)]" />
                            {isRTL ? 'عن العرض' : 'About this Deal'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                            {isRTL ? MOCK_DEAL.arDescription : MOCK_DEAL.description}
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-bold text-[var(--unizy-text-dark)] dark:text-white flex items-center gap-2 mb-3 mt-8">
                            <MapPin className="w-5 h-5 text-[var(--unizy-primary)]" />
                            {isRTL ? 'الفروع المتاحة' : 'Available Branches'}
                        </h3>
                        <div className="space-y-3">
                            {MOCK_DEAL.branches.map((branch, index) => (
                                <div key={index} className="flex justify-between items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <span className="font-medium text-[var(--unizy-text-dark)] dark:text-white">
                                        {isRTL ? branch.arName : branch.name}
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1E293B] px-2 py-1 rounded shadow-sm border border-gray-100 dark:border-gray-700">
                                        {branch.distance}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-yellow-50 dark:bg-yellow-900/10 p-5 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 mt-8">
                        <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-500 mb-3 uppercase tracking-wider">
                            {isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}
                        </h3>
                        <ul className="list-disc leading-relaxed text-sm text-yellow-700 dark:text-yellow-600 space-y-2 ml-5 rtl:mr-5 rtl:ml-0">
                            {(isRTL ? MOCK_DEAL.arTerms : MOCK_DEAL.terms).map((term, i) => (
                                <li key={i}>{term}</li>
                            ))}
                        </ul>
                    </section>

                </div>
            </div>
        </main>
    );
}
