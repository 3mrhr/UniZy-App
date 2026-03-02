'use client';

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from '@/i18n/LanguageProvider';

function HousingHomeContent() {
    const { dict } = useLanguage();
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
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{dict.home.housing}</h1>
                </div>
                <button className="text-gray-600 dark:text-gray-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors bg-gray-50 dark:bg-unizy-navy/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                </button>
                <div className="flex gap-2 ml-2">
                    <Link href="/housing/saved" className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-xl text-xs font-bold hover:bg-brand-100 transition-colors">❤️ Saved</Link>
                    <Link href="/housing/compare" className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors">⚖️ Compare</Link>
                </div>
            </header>

            {/* Filter Chips */}
            <div className="px-6 md:px-12 py-4 flex gap-2 overflow-x-auto hide-scrollbar bg-white dark:bg-unizy-dark shadow-sm border-t border-gray-50 dark:border-white/5 max-w-7xl mx-auto w-full">
                {['All', 'Studio', 'Shared', 'Apartment', 'Female Only', 'Male Only'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => router.push(`/housing?type=${filter}`)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === filter
                            ? "bg-brand-600 text-white shadow-md shadow-brand-500/20"
                            : "bg-gray-100 dark:bg-unizy-navy/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-unizy-navy"
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <main className="px-6 md:px-12 py-6 flex flex-col gap-5 animate-fade-in max-w-7xl mx-auto w-full">

                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Featured Near You</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        <div className="col-span-full py-20 flex justify-center">
                            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-brand-600 animate-spin"></div>
                        </div>
                    ) : listings.length > 0 ? (
                        listings.map((listing) => (
                            <Link href={`/housing/${listing.id}`} key={listing.id} className="block group">
                                <div className="bg-white dark:bg-unizy-dark rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">

                                    <div className="relative h-48 w-full bg-gray-200 dark:bg-unizy-navy/30">
                                        <Image
                                            src={listing.image}
                                            alt={listing.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />

                                        {listing.verified && (
                                            <div className="absolute top-4 left-4 bg-white/90 dark:bg-unizy-dark/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-white/50 dark:border-white/10">
                                                <span className="text-green-500 text-sm">✓</span>
                                                <span className="text-xs font-bold tracking-wide text-gray-800 dark:text-gray-200">Verified</span>
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-unizy-dark/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white/50 dark:border-white/10">
                                            <p className="font-bold text-gray-900 dark:text-white">{listing.price} <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">EGP/mo</span></p>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-gray-900 dark:text-white leading-tight w-4/5 group-hover:text-brand-600 transition-colors">{listing.title}</h3>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            <span className="flex-shrink-0">📍</span>
                                            <p className="truncate">{listing.area} • {listing.distance}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs font-medium">
                                            <span className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-lg border border-brand-100 dark:border-brand-900/30">{listing.type}</span>
                                            <span className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900/30">{listing.gender}</span>
                                        </div>
                                    </div>

                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-12 flex flex-col items-center bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5">
                            <span className="text-5xl mb-4">🏠</span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No listings found</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center text-sm max-w-sm">There are no {activeFilter !== 'All' ? activeFilter : ''} listings matching your current criteria. Consider adjusting your filters.</p>
                            {activeFilter !== 'All' && (
                                <button onClick={() => router.push('/housing')} className="mt-4 px-6 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors text-sm">
                                    Clear Filters
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
