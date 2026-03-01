"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ArrowLeft, ArrowRight, Share2, Heart, Tag, MapPin, Star, Clock, Info, CheckCircle2, Copy } from 'lucide-react';

const MOCK_DEAL = {
    id: 'd1',
    merchant: 'Burger Bros',
    title: '50% Off Second Burger',
    description: 'Enjoy a delicious 50% discount on any second burger of equal or lesser value. Valid for dine-in and takeout on our entire menu.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80',
    distance: '1.2 km',
    rating: 4.8,
    reviews: 312,
    type: 'discount',
    value: '50%',
    expiresIn: '2 days',
    originalPrice: '150',
    discountPrice: '112.5',
    currency: 'EGP',
    terms: [
        'Valid for students with active UniZy ID.',
        'Cannot be combined with other offers or promos.',
        'One use per day per student account.'
    ],
    branches: [
        { name: 'University Campus Branch', distance: '1.2 km' },
        { name: 'Downtown Main Branch', distance: '4.5 km' }
    ],
    promoCode: 'UNIBROS50'
};

export default function DealDetailsPage({ params }) {
    const router = useRouter();
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';

    // Unwrapping promise to prevent sync access errors in Next 15+
    const unwrappedParams = React.use(params);
    const dealId = unwrappedParams.id;

    const [deal, setDeal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    useEffect(() => {
        const fetchDealDetails = async () => {
            setIsLoading(true);
            try {
                const { getDealById, checkIsDealSaved } = await import('@/app/actions/deals');

                const [dealResult, savedResult] = await Promise.all([
                    getDealById(dealId),
                    checkIsDealSaved(dealId)
                ]);

                if (dealResult.success && dealResult.deal) {
                    setDeal(dealResult.deal);
                }
                setIsSaved(savedResult);

            } catch (error) {
                console.error("Failed to fetch deal", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (dealId) {
            fetchDealDetails();
        }
    }, [dealId]);

    const handleCopyCode = () => {
        if (!deal?.promoCode) return;
        navigator.clipboard.writeText(deal.promoCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleToggleSave = async () => {
        try {
            const { toggleSaveDeal } = await import('@/app/actions/deals');
            const result = await toggleSaveDeal(dealId);
            if (result.success) {
                setIsSaved(result.saved);
            }
        } catch (error) {
            console.error("Failed to toggle save status", error);
        }
    };

    if (isLoading) {
        return (
            <main className="min-h-screen pb-24 bg-gray-50 dark:bg-unizy-navy flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-bold">Loading Deal Details...</p>
                </div>
            </main>
        );
    }

    if (!deal) {
        return (
            <main className="min-h-screen pb-24 bg-gray-50 dark:bg-unizy-navy flex items-center justify-center">
                <div className="text-center px-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Deal Not Found</h2>
                    <p className="text-gray-500 mb-6">This deal might have expired or doesn't exist.</p>
                    <button onClick={() => router.back()} className="px-6 py-3 bg-brand-600 text-white rounded-full font-bold shadow-lg">Go Back</button>
                </div>
            </main>
        );
    }

    // Default branches if missing from schema 
    const branches = [
        { name: 'University Campus Branch', distance: '1.2 km' },
        { name: 'Downtown Main Branch', distance: '4.5 km' }
    ];

    return (
        <main className="min-h-screen pb-24 bg-gray-50 dark:bg-unizy-navy transition-colors duration-300">

            {/* Dynamic Header Image */}
            <div className="relative h-72 sm:h-96 w-full rounded-b-[3rem] overflow-hidden shadow-2xl shadow-black/10">
                {deal.image ? (
                    <img src={deal.image} alt={deal.merchant?.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-brand-600 flex items-center justify-center">
                        <Tag className="text-white/30 w-32 h-32" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>

                {/* Top Nav Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 pt-safe">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/40 transition-colors border border-white/30 shadow-lg"
                    >
                        {isRTL ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
                    </button>
                    <div className="flex gap-3">
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/40 transition-colors border border-white/30 shadow-lg" onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: deal.title,
                                    text: `Check out this deal from ${deal.merchant?.name} on UniZy!`,
                                    url: window.location.href,
                                });
                            }
                        }}>
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleToggleSave}
                            className={`w-12 h-12 rounded-full backdrop-blur-xl flex items-center justify-center text-white transition-colors border shadow-lg ${isSaved ? 'bg-red-500/90 border-red-500 hover:bg-red-600' : 'bg-white/20 border-white/30 hover:bg-white/40'}`}
                        >
                            <Heart className={`w-5 h-5 ${isSaved ? 'fill-white stroke-white' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Bottom Title Overlay */}
                <div className="absolute bottom-8 left-6 right-6 text-white max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="bg-brand-500 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg tracking-wide uppercase">
                            <Tag className="w-3.5 h-3.5" /> Exclusive Deal
                        </span>
                        <span className="flex items-center gap-1 text-sm bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl font-bold border border-white/20">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" /> {deal.rating?.toFixed(1) || '5.0'} <span className="opacity-70 text-xs font-normal">({deal.reviews || 0})</span>
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight shadow-black drop-shadow-2xl mb-2">
                        {deal.title}
                    </h1>
                    <p className="text-gray-200 text-lg flex items-center gap-2 drop-shadow-md font-bold">
                        {deal.merchant?.name || 'Local Merchant'}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

                {/* Important Info Strip */}
                <div className="grid grid-cols-3 bg-white dark:bg-unizy-dark rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 mb-8">
                    <div className="flex flex-col items-center justify-center text-center px-4 border-r border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Expires In</p>
                        <p className="font-black text-lg text-orange-500 flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/10 px-3 py-1 rounded-xl whitespace-nowrap">
                            <Clock className="w-4 h-4 hidden sm:block" /> {deal.expiresIn || 'Ongoing'}
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center px-4 border-r border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Savings</p>
                        <p className="font-black text-xl text-green-500">{deal.discount}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center px-4">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Price</p>
                        <p className="font-black text-xl text-gray-900 dark:text-white">{deal.discountPrice || '-'} <span className="text-xs font-bold text-gray-400">{deal.currency || 'EGP'}</span></p>
                    </div>
                </div>

                {/* Promo Code Action */}
                <div className="bg-brand-50 rounded-[2.5rem] p-8 border border-brand-100 dark:border-brand-900/30 dark:bg-brand-500/5 mb-10 flex flex-col items-center text-center shadow-inner relative overflow-hidden">
                    {/* Decorative Blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                    <h3 className="text-xl font-black text-brand-900 dark:text-white mb-2 z-10">
                        In-Store Redemption Code
                    </h3>
                    <p className="text-sm font-medium text-brand-700/80 dark:text-brand-200/60 mb-6 max-w-sm z-10">
                        Show this exclusive promo code to the cashier before paying to instantly apply your student discount.
                    </p>

                    <div className="relative group w-full max-w-xs cursor-pointer z-10" onClick={handleCopyCode}>
                        <div className="absolute inset-0 bg-brand-500 bg-opacity-20 rounded-[1.5rem] blur-xl group-hover:bg-opacity-30 transition-all"></div>
                        <div className="relative flex items-center justify-between bg-white dark:bg-unizy-dark border-2 border-dashed border-brand-500 rounded-[1.5rem] py-4 px-6 shadow-md transition-transform group-active:scale-95">
                            <span className="font-mono text-2xl font-black tracking-widest text-brand-600 dark:text-brand-400 w-full text-center">
                                {deal.promoCode || 'UNIZY50'}
                            </span>
                            {codeCopied ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500 absolute right-4" />
                            ) : (
                                <Copy className="w-6 h-6 text-brand-400 group-hover:text-brand-600 absolute right-4 transition-colors" />
                            )}
                        </div>
                    </div>
                    {codeCopied && <p className="text-sm text-green-600 dark:text-green-400 mt-4 font-bold animate-fade-in z-10">Copied to clipboard!</p>}
                </div>

                {/* Details Section */}
                <div className="space-y-8 bg-white dark:bg-unizy-dark p-8 rounded-[3rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5">

                    <section>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                            <Info className="w-6 h-6 text-brand-500" />
                            About this Deal
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                            {deal.description}
                        </p>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    <section>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                            <MapPin className="w-6 h-6 text-brand-500" />
                            Available Branches
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {MOCK_DEAL.branches.map((branch, index) => (
                                <div key={index} className="flex justify-between items-center p-5 bg-gray-50 dark:bg-unizy-navy rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-brand-500/30 transition-colors">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {branch.name}
                                    </span>
                                    <span className="text-xs font-black text-brand-600 bg-brand-50 dark:bg-brand-500/10 px-3 py-1.5 rounded-xl border border-brand-100 dark:border-brand-500/20">
                                        {branch.distance}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-gray-50 dark:bg-unizy-navy p-6 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                        <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-widest">
                            Terms & Conditions
                        </h3>
                        <ul className="list-disc leading-relaxed text-sm text-gray-600 dark:text-gray-300 space-y-3 ml-6 font-medium">
                            <li className="pl-1">Valid for students with active UniZy ID.</li>
                            <li className="pl-1">Cannot be combined with other offers or promos.</li>
                            <li className="pl-1">One use per day per student account.</li>
                        </ul>
                    </section>

                </div>
            </div>
        </main>
    );
}
