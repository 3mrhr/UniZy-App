'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from '@/i18n/LanguageProvider';
import { ChevronLeft, SlidersHorizontal, Users, Sparkles } from 'lucide-react';
import HousingCard from "@/components/housing/HousingCard";
import HousingFilters from "@/components/housing/HousingFilters";

function HousingHomeContent() {
    const { dict } = useLanguage();
    const h = dict?.housing || {};
    const router = useRouter();
    const searchParams = useSearchParams();

    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savedIds, setSavedIds] = useState([]);
    const activeFilter = searchParams.get('type') || 'All';

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const { getHousingListings, getSavedHousing } = await import('@/app/actions/housing');

            // Fetch listings
            const data = await getHousingListings({ type: activeFilter });
            if (data?.length > 0) {
                const formatted = data.map(item => {
                    let images = [];
                    try { images = JSON.parse(item.images); } catch (e) { }
                    return {
                        id: item.id,
                        title: item.title,
                        price: item.price,
                        area: item.location,
                        type: item.type,
                        distance: "Near Campus",
                        gender: item.type === 'Female Only' ? 'Female' : item.type === 'Male Only' ? 'Male' : 'Mixed',
                        verified: item.provider?.name === 'Super Admin' || true,
                        image: images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80"
                    };
                });
                setListings(formatted);
            } else {
                setListings([]);
            }

            // Fetch saved status
            const saved = await getSavedHousing();
            setSavedIds(saved.map(s => s.id));

            setIsLoading(false);
        }
        fetchData();
    }, [activeFilter]);

    const handleToggleSave = async (id) => {
        const { toggleSavedHousing } = await import('@/app/actions/housing');
        const res = await toggleSavedHousing(id);
        if (res.saved) {
            setSavedIds(prev => [...prev, id]);
        } else {
            setSavedIds(prev => prev.filter(sid => sid !== id));
        }
    };

    return (
        <div className="relative min-h-screen bg-[#f8fafc] dark:bg-unizy-navy pb-32 transition-colors overflow-hidden">

            {/* Pro Max Brand Aura Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
            </div>

            {/* Premium Header */}
            <header className="sticky top-0 z-50 px-6 py-8 backdrop-blur-2xl border-b border-white/20 dark:border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/students"
                            className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-unizy-dark/40 border border-white/60 dark:border-white/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-glass"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                                {h.title || "Housing Hub"}
                            </h1>
                            <p className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] mt-1">
                                Premium Living Options
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Link
                            href="/housing/saved"
                            className="px-6 py-3 bg-white/40 dark:bg-unizy-dark/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white hover:bg-brand-500 hover:text-white hover:border-brand-400 transition-all shadow-glass"
                        >
                            {h.saved || "Saved"}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">

                {/* Roommate Radar - Highlight Module 6 Feature */}
                <section className="mb-16">
                    <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-[3rem] p-10 shadow-2xl shadow-brand-500/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full mb-4 border border-white/20">
                                    <Sparkles className="w-3 h-3 text-brand-200" />
                                    <span className="text-[10px] font-black tracking-widest text-white uppercase">New & Smart</span>
                                </div>
                                <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Roommate Matching 2.0</h2>
                                <p className="text-brand-100 text-lg font-medium opacity-80 max-w-md">Find someone who matches your study habits, sleep schedule, and cleanliness with our similarity engine.</p>
                            </div>
                            <Link
                                href="/hub?tab=roommates"
                                className="px-10 py-5 bg-white text-brand-600 rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                Launch Radar
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Filters Section */}
                <HousingFilters
                    activeType={activeFilter}
                    onTypeChange={(type) => router.push(`/housing?type=${type}`)}
                    dict={dict}
                />

                {/* Listings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {isLoading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-[400px] w-full rounded-[2.5rem] bg-white/20 dark:bg-unizy-dark/20 animate-pulse border border-white/20 dark:border-white/5" />
                        ))
                    ) : listings.length > 0 ? (
                        listings.map((listing) => (
                            <HousingCard
                                key={listing.id}
                                listing={listing}
                                isSaved={savedIds.includes(listing.id)}
                                onToggleSave={handleToggleSave}
                                dict={dict}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-24 flex flex-col items-center">
                            <div className="w-24 h-24 bg-white/40 dark:bg-unizy-dark/40 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/60 dark:border-white/10 mb-6 group hover:scale-110 transition-transform shadow-glass">
                                <Users className="w-10 h-10 text-gray-400 group-hover:text-brand-500 transition-colors" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{h.noListings || "No luxury spaces found"}</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Try adjusting your bento filters for a different perspective.</p>
                            <button
                                onClick={() => router.push('/housing')}
                                className="px-8 py-4 bg-brand-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                            >
                                {h.clearFilters || "Reset Grid"}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function HousingHome() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white dark:bg-unizy-navy flex items-center justify-center">
                <div className="w-12 h-12 rounded-[1.5rem] bg-brand-500/20 border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
            </div>
        }>
            <HousingHomeContent />
        </Suspense>
    );
}
