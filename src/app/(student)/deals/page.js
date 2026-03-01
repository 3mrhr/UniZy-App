"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Tag, MapPin, Star, Clock, Store, Percent, Search, SlidersHorizontal, ChevronRight } from 'lucide-react';

// Mock Deals Data
const CATEGORIES = [
    { id: 'restaurants', icon: Store, en: 'Restaurants', ar: 'مطاعم' },
    { id: 'cafes', icon: Store, en: 'Cafes', ar: 'مقاهي' },
    { id: 'printing', icon: Store, en: 'Printing', ar: 'طباعة' },
    { id: 'laundry', icon: Store, en: 'Laundry', ar: 'مغسلة' },
    { id: 'salons', icon: Store, en: 'Salons', ar: 'صالونات' },
    { id: 'gyms', icon: Store, en: 'Gyms', ar: 'صالات رياضية' },
];

const FEATURED_DEALS = [
    {
        id: 'd1',
        merchant: 'Burger Bros',
        title: '50% Off Second Burger',
        arTitle: 'خصم 50% على البرجر الثاني',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80',
        distance: '1.2 km',
        rating: 4.8,
        type: 'discount',
        value: '50%',
        expiresIn: '2 days'
    },
    {
        id: 'd2',
        merchant: 'Campus Coffee',
        title: 'Free Coffee with Pastry',
        arTitle: 'قهوة مجانية مع أي معجنات',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80',
        distance: '0.5 km',
        rating: 4.6,
        type: 'bogo',
        value: 'Free',
        expiresIn: 'Today'
    }
];

const NEARBY_OFFERS = [
    {
        id: 'd3',
        merchant: 'Print Station',
        category: 'printing',
        title: '20% Student Discount',
        arTitle: 'خصم طلابي 20%',
        distance: '0.8 km',
        rating: 4.9,
        originalPrice: '1.00',
        discountPrice: '0.80',
        currency: 'EGP'
    },
    {
        id: 'd4',
        merchant: 'Fresh Laundry',
        category: 'laundry',
        title: 'Wash & Fold 3kg Deal',
        arTitle: 'عرض غسيل وطي 3 كيلو',
        distance: '1.5 km',
        rating: 4.5,
        originalPrice: '120',
        discountPrice: '90',
        currency: 'EGP'
    },
    {
        id: 'd5',
        merchant: 'Fit Zone Gym',
        category: 'gyms',
        title: '1 Month Free (3 Month Sub)',
        arTitle: 'شهر مجاني (اشتراك 3 شهور)',
        distance: '2.1 km',
        rating: 4.7,
        originalPrice: '1500',
        discountPrice: '1000',
        currency: 'EGP'
    }
];


export default function DealsPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 transition-colors duration-300">

            {/* Header & Search */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[var(--unizy-text-dark)] dark:text-white mb-2">
                    {isRTL ? 'عروض وخدمات محلية' : 'Local Deals & Services'}
                </h1>
                <p className="text-[var(--unizy-text-muted)] dark:text-gray-400 mb-6">
                    {isRTL ? 'وفر أكثر مع خصومات الطلاب الحصرية.' : 'Save more with exclusive student discounts.'}
                </p>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-gray-400`} />
                        <input
                            type="text"
                            placeholder={isRTL ? 'ابحث عن مطاعم، مقاهي، خدمات...' : 'Search restaurants, cafes, services...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl py-3 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-[var(--unizy-text-dark)] dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--unizy-primary)] transition-all`}
                        />
                    </div>
                    <button className="p-3 bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[var(--unizy-primary)] transition-colors shrink-0">
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--unizy-text-dark)] dark:text-white">
                        {isRTL ? 'الأقسام' : 'Categories'}
                    </h2>
                </div>
                <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                            className={`flex flex-col items-center justify-center min-w-[80px] p-3 rounded-2xl border transition-all ${activeCategory === cat.id
                                ? 'bg-[var(--unizy-primary)] bg-opacity-10 border-[var(--unizy-primary)] text-[var(--unizy-primary)] dark:border-[var(--unizy-primary)]'
                                : 'bg-white dark:bg-[#1E293B] border-transparent hover:border-gray-200 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                        >
                            <div className={`p-2 rounded-xl mb-2 ${activeCategory === cat.id ? 'bg-[var(--unizy-primary)] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-center line-clamp-1">{isRTL ? cat.ar : cat.en}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Offers Slider */}
            <div className="mb-10">
                <h2 className="text-lg font-bold text-[var(--unizy-text-dark)] dark:text-white mb-4">
                    {isRTL ? 'عروض مميزة' : 'Featured Offers'}
                </h2>
                <div className="flex overflow-x-auto hide-scrollbar gap-5 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {FEATURED_DEALS.map((deal) => (
                        <Link href={`/deals/${deal.id}`} key={deal.id} className="min-w-[280px] sm:min-w-[320px] rounded-2xl overflow-hidden glass-card dark:border dark:border-gray-800 shrink-0 group block">
                            <div className="relative h-40">
                                <img src={deal.image} alt={deal.merchant} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                    <Percent className="w-3 h-3" /> {deal.value}
                                </div>

                                <div className="absolute bottom-3 left-3 right-3">
                                    <h3 className="text-white font-bold text-lg leading-tight mb-1">{isRTL ? deal.arTitle : deal.title}</h3>
                                    <p className="text-gray-300 text-sm flex items-center gap-2">
                                        <Store className="w-3 h-3" /> {deal.merchant}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-[#1E293B] flex items-center justify-between">
                                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /> {deal.rating}</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {deal.distance}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-orange-500 font-medium bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                                    <Clock className="w-3 h-3" /> {isRTL ? `ينتهي خلال ${deal.expiresIn}` : `Ends in ${deal.expiresIn}`}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Nearby Merchants Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-[var(--unizy-text-dark)] dark:text-white">
                        {isRTL ? 'خصومات قريبة' : 'Nearby Discounts'}
                    </h2>
                    <button className="text-[var(--unizy-primary)] text-sm font-medium hover:underline flex items-center gap-1">
                        {isRTL ? 'عرض الكل' : 'View All'}
                        <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {NEARBY_OFFERS.map((offer) => (
                        <Link href={`/deals/${offer.id}`} key={offer.id} className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 flex items-center gap-4 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all group">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                                <Tag className="w-8 h-8 text-[var(--unizy-primary)] opacity-80" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-[var(--unizy-text-dark)] dark:text-white truncate pr-2">
                                        {isRTL ? offer.arTitle : offer.title}
                                    </h3>
                                    <span className="flex items-center gap-1 text-sm bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 font-medium shrink-0">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" /> {offer.rating}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 truncate">{offer.merchant}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-lg text-[var(--unizy-primary)]">{offer.discountPrice}</span>
                                        <span className="text-xs text-gray-400 line-through">{offer.originalPrice}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{offer.currency}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {offer.distance}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

        </main>
    );
}
