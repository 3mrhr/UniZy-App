'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Tag, MapPin, Star, Clock, Heart } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function SavedDealsPage() {
    const router = useRouter();
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [savedDeals, setSavedDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSavedDeals();
    }, []);

    const fetchSavedDeals = async () => {
        setIsLoading(true);
        try {
            const { getSavedDeals } = await import('@/app/actions/deals');
            const result = await getSavedDeals();
            if (result.success && result.savedDeals) {
                setSavedDeals(result.savedDeals);
            }
        } catch (error) {
            console.error("Failed to load saved deals", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSave = async (e, dealId) => {
        e.preventDefault();
        try {
            const { toggleSaveDeal } = await import('@/app/actions/deals');
            const result = await toggleSaveDeal(dealId);
            if (result.success) {
                // Optimistically remove from list
                if (!result.saved) {
                    setSavedDeals(current => current.filter(d => d.id !== dealId));
                }
            }
        } catch (error) {
            console.error("Failed to remove saved deal", error);
        }
    };

    return (
        <main className="min-h-screen pb-24 bg-gray-50 dark:bg-unizy-navy transition-colors duration-300">
            {/* Header */}
            <header className="bg-brand-600 px-6 pt-safe pb-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 max-w-7xl mx-auto w-full pt-6 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/20 shadow-lg"
                    >
                        {isRTL ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Saved Deals</h1>
                        <p className="text-brand-100 text-sm font-medium">Your favorite discounts ready to use.</p>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* Deals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up pb-12">
                    {isLoading ? (
                        // Loading Skeletons
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-3 shadow-sm border border-gray-100 dark:border-white/5 animate-pulse">
                                <div className="aspect-[4/3] rounded-[2rem] bg-gray-200 dark:bg-gray-800 mb-4"></div>
                                <div className="px-3 pb-3 space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))
                    ) : savedDeals.map(deal => (
                        <Link key={deal.id} href={`/deals/${deal.id}`} className="group block bg-white dark:bg-unizy-dark rounded-[2.5rem] p-3 shadow-lg shadow-gray-200/40 dark:shadow-none hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-white/5 relative overflow-hidden">
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                                {deal.image ? (
                                    <Image src={deal.image} alt={deal.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-50 dark:bg-brand-900/10 text-brand-300">
                                        <Tag className="w-12 h-12" />
                                    </div>
                                )}

                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-xl flex items-center gap-1.5 tracking-wide">
                                    <Tag className="w-3 h-3" /> {deal.discount}
                                </div>

                                <button onClick={(e) => handleRemoveSave(e, deal.id)} className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 active:scale-90 transition-all shadow-xl z-10">
                                    <Heart className="w-5 h-5 fill-white" />
                                </button>

                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/20 backdrop-blur-md border border-white/20 px-2.5 py-1.5 rounded-xl w-fit shadow-sm">
                                        <Clock className="w-3.5 h-3.5 text-orange-300" /> Expires: {deal.expiresIn || 'Ongoing'}
                                    </div>
                                </div>
                            </div>

                            <div className="px-3 pb-3">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{deal.merchant?.name || 'Local Merchant'}</p>
                                <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                                    {deal.title}
                                </h3>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold bg-gray-50 dark:bg-unizy-navy px-3 py-1.5 rounded-xl text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5">
                                        <MapPin className="w-3.5 h-3.5 text-brand-500" /> nearby
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 px-2.5 py-1.5 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-black text-yellow-700 dark:text-yellow-500">{deal.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {!isLoading && savedDeals.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white dark:bg-unizy-dark rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-unizy-navy rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/5">
                                <Heart className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">No saved deals yet</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">Browse the local deals section and tap the heart icon to save offers for later.</p>
                            <Link href="/deals" className="inline-block bg-brand-600 text-white font-black px-6 py-3 rounded-2xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20">
                                Explore Deals
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
