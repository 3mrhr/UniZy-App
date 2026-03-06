'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from '@/i18n/LanguageProvider';

function HousingHomeContent() {
    const { dict } = useLanguage();
    const h = dict?.housing || {};
    const c = dict?.common || {};
    const router = useRouter();
    const searchParams = useSearchParams();

    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const activeFilter = searchParams.get('type') || 'All';

    useEffect(() => {
        async function fetchListings() {
            setIsLoading(true);
            const { getHousingListings } = await import('@/app/actions/housing');
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
                        gender: "Mixed",
                        verified: item.provider?.name === 'Super Admin', // Just as a UI mock
                        image: images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80"
                    };
                });
                setListings(formatted);
            } else {
                setListings([]);
            }
            setIsLoading(false);
        }
        fetchListings();
    }, [activeFilter]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-24 dark:bg-unizy-navy transition-colors">

            {/* Header */}
            <header className="bg-white dark:bg-unizy-dark px-6 md:px-12 py-6 shadow-sm sticky top-0 z-10 flex items-center justify-between max-w-7xl mx-auto w-full border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <Link href="/students" className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{h.title || "Housing"}</h1>
                </div>
                <button className="text-gray-600 dark:text-gray-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors bg-gray-50 dark:bg-unizy-navy/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                </button>
                <div className="flex gap-2 ml-2">
                    <Link href="/housing/saved" className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-xl text-xs font-bold hover:bg-brand-100 transition-colors">❤️ {h.saved || "Saved"}</Link>
                    <Link href="/housing/compare" className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">⚖️ {h.compare || "Compare"}</Link>
                </div>
            </header>

            {/* Filter Chips */}
            <div className="px-6 md:px-12 py-4 flex gap-2 overflow-x-auto hide-scrollbar bg-white dark:bg-unizy-dark shadow-sm border-t border-gray-50 dark:border-white/5 max-w-7xl mx-auto w-full">
                {[{ key: 'All', label: h?.filters?.all || 'All' }, { key: 'Studio', label: h?.filters?.studio || 'Studio' }, { key: 'Shared', label: h?.filters?.shared || 'Shared' }, { key: 'Apartment', label: h?.filters?.apartment || 'Apartment' }, { key: 'Female Only', label: h?.filters?.femaleOnly || 'Female Only' }, { key: 'Male Only', label: h?.filters?.maleOnly || 'Male Only' }].map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => router.push(`/housing?type=${filter.key}`)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === filter.key
                            ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                            : "bg-gray-100 dark:bg-unizy-navy/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-unizy-navy"
                            }`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            <main className="px-6 md:px-12 py-6 flex flex-col gap-5 animate-fade-in max-w-7xl mx-auto w-full">

                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{h.featuredNearYou || "Featured Near You"}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoading ? (
                        <div className="col-span-full py-20 flex justify-center">
                            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-brand-600 animate-spin"></div>
                        </div>
                    ) : listings.length > 0 ? (
                        listings.map((listing, index) => (
                            <Link
                                href={`/housing/${listing.id}`}
                                key={listing.id}
                                className="block group animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="bg-white/60 dark:bg-black/20 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-brand-500/10">
                                    <div className="relative h-60 w-full bg-gray-200 dark:bg-black/40">
                                        <Image
                                            src={listing.image}
                                            alt={listing.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                                        {listing.verified && (
                                            <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/30 shadow-lg">
                                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                                <span className="text-[10px] font-black tracking-widest text-white uppercase">{c.verified || "Verified"}</span>
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 left-4 bg-brand-600/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-brand-400/30">
                                            <p className="font-black text-white text-lg leading-none">
                                                {listing.price}
                                                <span className="text-[10px] opacity-70 ml-1 uppercase tracking-tighter">{h.perMonth || "EGP/mo"}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="font-black text-gray-900 dark:text-white text-lg leading-tight mb-2 group-hover:text-brand-600 transition-colors uppercase tracking-tighter truncate">
                                            {listing.title}
                                        </h3>

                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                                            <span>📍</span>
                                            <p className="truncate">{listing.area} • {listing.distance}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                            <div className="flex gap-2">
                                                <span className="bg-brand-500/10 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-500/10">{listing.type}</span>
                                                <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-500/10">{listing.gender}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all">
                                                <span className="text-xl">→</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-12 flex flex-col items-center bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5">
                            <span className="text-5xl mb-4">🏠</span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{h.noListings || "No listings found"}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center text-sm max-w-sm">{h.noListingsDesc || "There are no listings matching your current criteria. Consider adjusting your filters."}</p>
                            {activeFilter !== 'All' && (
                                <button onClick={() => router.push('/housing')} className="mt-4 px-6 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors text-sm">
                                    {h.clearFilters || "Clear Filters"}
                                </button>
                            )}
                        </div>
                    )}
                </div>

            </main >
        </div >
    );
}

export default function HousingHome() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <HousingHomeContent />
        </Suspense>
    );
}
