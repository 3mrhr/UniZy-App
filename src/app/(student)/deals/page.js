"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Search, Tag, MapPin, Star, Clock, Store, Percent, ChevronRight, Settings2 } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', name: 'All Deals', icon: '✨' },
    { id: 'restaurants', name: 'Food & Drink', icon: '🍔' },
    { id: 'tech', name: 'Tech & Mobiles', icon: '💻' },
    { id: 'fashion', name: 'Clothing', icon: '👕' },
    { id: 'printing', name: 'Printing', icon: '🖨️' },
    { id: 'laundry', name: 'Laundry', icon: '👕' },
    { id: 'salons', name: 'Salons', icon: '✂️' },
    { id: 'gyms', name: 'Gyms', icon: '🏋️' },
];

const MOCK_DEALS = [
    {
        id: 'd1',
        merchant: 'Student Tech Store',
        title: '50% off MacBook Repairs',
        category: 'tech',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',
        distance: '1.2 km',
        rating: 4.8,
        reviews: 124,
        discount: '50% OFF',
        type: 'discount',
        expiresIn: '2 days'
    },
    {
        id: 'd2',
        merchant: 'Burger Bros',
        title: 'Buy 1 Get 1 Free Meals',
        category: 'restaurants',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
        distance: '0.5 km',
        rating: 4.9,
        reviews: 312,
        discount: 'BOGO',
        type: 'bogo',
        expiresIn: '5 hours'
    },
    {
        id: 'd3',
        merchant: 'Campus Cuts',
        title: '30% Student Discount on Haircuts',
        category: 'salons',
        image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
        distance: '0.8 km',
        rating: 4.6,
        reviews: 89,
        discount: '30% OFF',
        type: 'discount',
        expiresIn: 'Ongoing'
    },
    {
        id: 'd4',
        merchant: 'Urban Kicks',
        title: 'Flat 20% off New Sneakers',
        category: 'fashion',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=800&q=80',
        distance: '2.5 km',
        rating: 4.7,
        reviews: 45,
        discount: '20% OFF',
        type: 'discount',
        expiresIn: '1 week'
    },
    {
        id: 'd5',
        merchant: 'Print Station',
        category: 'printing',
        title: '20% Student Discount',
        image: 'https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?w=800&q=80',
        distance: '0.8 km',
        rating: 4.9,
        reviews: 102,
        discount: '20% OFF',
        type: 'discount',
        expiresIn: 'Ongoing'
    },
];

export default function DealsPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [deals, setDeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch live deals
    React.useEffect(() => {
        const fetchDeals = async () => {
            setIsLoading(true);
            try {
                const { getActiveDeals } = await import('@/app/actions/deals');
                const result = await getActiveDeals(activeCategory === 'all' ? null : activeCategory, searchQuery);
                if (result.success && result.deals) {
                    setDeals(result.deals);
                }
            } catch (error) {
                console.error("Failed to fetch deals", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchDeals();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [activeCategory, searchQuery]);

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-unizy-navy transition-colors duration-300 pb-20 sm:pb-0">

            {/* Header */}
            <header className="bg-brand-600 px-6 pt-12 pb-10 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-400/20 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4"></div>

                <div className="relative z-10 max-w-7xl mx-auto w-full">
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Exclusive Deals</h1>
                    <p className="text-brand-100 text-sm font-medium mb-8 max-w-sm">Unlock local student-only discounts and stretch your budget further.</p>

                    {/* Search Bar */}
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400 w-5 h-5`} />
                            <input
                                type="text"
                                placeholder="Search deals, merchants..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full bg-white dark:bg-unizy-dark border-none rounded-2xl py-4 shadow-lg text-sm font-medium focus:outline-none focus:ring-4 focus:ring-brand-500/30 text-gray-900 dark:text-white transition-all ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                            />
                        </div>
                        <button className="bg-white dark:bg-unizy-dark p-4 rounded-2xl shadow-lg border-none text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors shrink-0">
                            <Settings2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mt-8">

                {/* Categories Carousel */}
                <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-6 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {CATEGORIES.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap font-bold text-sm transition-all shadow-sm ${activeCategory === category.id
                                ? 'bg-brand-600 dark:bg-brand-500 text-white shadow-brand-500/20 scale-105'
                                : 'bg-white dark:bg-unizy-dark text-gray-700 dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-white/10'
                                }`}
                        >
                            <span className="text-lg">{category.icon}</span>
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Section Title */}
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Trending Near You</h2>
                    <Link href="/deals/saved" className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-xs px-4 py-2 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1.5 border border-red-100 dark:border-red-900/30">
                        <span className="text-sm">❤️</span> Saved
                    </Link>
                </div>

                {/* Deals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up pb-12">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-3 shadow-sm border border-gray-100 dark:border-white/5 animate-pulse">
                                <div className="aspect-[4/3] rounded-[2rem] bg-gray-200 dark:bg-gray-800 mb-4"></div>
                                <div className="px-3 pb-3 space-y-3">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
                                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))
                    ) : deals.map(deal => (
                        <Link key={deal.id} href={`/deals/${deal.id}`} className="group block bg-white dark:bg-unizy-dark rounded-[2.5rem] p-3 shadow-lg shadow-gray-200/40 dark:shadow-none hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-white/5 relative overflow-hidden">
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
                                {deal.image ? (
                                    <Image src={deal.image} alt={deal.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-50 dark:bg-brand-900/10 text-brand-300">
                                        <Tag className="w-12 h-12" />
                                    </div>
                                )}

                                {/* Discount Badge */}
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-xl flex items-center gap-1.5 tracking-wide">
                                    <Tag className="w-3 h-3" /> {deal.discount}
                                </div>

                                {/* Save Button */}
                                <button onClick={(e) => { e.preventDefault(); alert('Saved!'); }} className="absolute top-4 right-4 w-10 h-10 bg-white/90 dark:bg-unizy-dark/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 active:scale-90 transition-all shadow-xl z-10 border border-white/20">
                                    ❤️
                                </button>

                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/20 backdrop-blur-md border border-white/20 px-2.5 py-1.5 rounded-xl w-fit shadow-sm">
                                        <Clock className="w-3.5 h-3.5 text-orange-300" /> Expires: {deal.expiresIn || 'Ongoing'}
                                    </div>
                                </div>
                            </div>

                            <div className="px-3 pb-3">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{deal.merchant?.name || 'Local Merchant'}</p>
                                        <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                                            {deal.title}
                                        </h3>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-1.5 text-xs font-bold bg-gray-50 dark:bg-unizy-navy px-3 py-1.5 rounded-xl text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5">
                                        <MapPin className="w-3.5 h-3.5 text-brand-500" /> nearby
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 px-2.5 py-1.5 rounded-xl border border-yellow-100 dark:border-yellow-900/20">
                                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-black text-yellow-700 dark:text-yellow-500">{deal.rating.toFixed(1)}</span>
                                        <span className="text-[10px] font-bold text-yellow-600/60 dark:text-yellow-500/60">({deal.reviews})</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {!isLoading && deals.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-white dark:bg-unizy-dark rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-unizy-navy rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/5">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">No deals found</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Try adjusting your search criteria or explore different categories to find amazing student offers.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
