"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Clock, Info, Search, Star, UtensilsCrossed, CalendarDays, Wallet, ChefHat, Heart, ChevronRight, Leaf } from 'lucide-react';

const MEAL_CATEGORIES = [
    { id: 'daily', en: 'Daily Offers', ar: 'عروض اليوم', icon: CalendarDays },
    { id: 'budget', en: 'Budget Meals', ar: 'وجبات اقتصادية', icon: Wallet },
    { id: 'healthy', en: 'Healthy', ar: 'أكل صحي', icon: Leaf },
    { id: 'protein', en: 'High Protein', ar: 'عالي البروتين', icon: ChefHat },
];

const MEALS_DATA = [
    {
        id: 'm1',
        merchant: 'Campus Canteen',
        name: 'Grilled Chicken & Rice',
        arName: 'دجاج مشوي مع أرز',
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80',
        price: '75',
        currency: 'EGP',
        rating: 4.5,
        calories: '450 kcal',
        prepTime: '15-20 min',
        tags: ['protein', 'daily'],
        isPopular: true
    },
    {
        id: 'm2',
        merchant: 'Fresh Bowl',
        name: 'Vegan Quinoa Salad',
        arName: 'سلطة كينوا نباتية',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80',
        price: '65',
        currency: 'EGP',
        rating: 4.8,
        calories: '320 kcal',
        prepTime: '10 min',
        tags: ['healthy'],
        isPopular: false
    },
    {
        id: 'm3',
        merchant: 'Student Bites',
        name: 'Classic Beef Burger Combo',
        arName: 'وجبة برجر لحم كلاسيك',
        image: 'https://images.unsplash.com/photo-1594212696431-7b00bf6895ce?auto=format&fit=crop&q=80',
        price: '90',
        currency: 'EGP',
        rating: 4.3,
        calories: '850 kcal',
        prepTime: '20 min',
        tags: ['budget'],
        isPopular: true
    }
];

export default function MealsPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [activeCategory, setActiveCategory] = useState('daily');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMeals = MEALS_DATA.filter(meal =>
        meal.tags.includes(activeCategory) &&
        ((isRTL ? meal.arName : meal.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
            meal.merchant.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 transition-colors duration-300">

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[var(--unizy-text-dark)] dark:text-white">
                        {isRTL ? 'وجبات الطلاب' : 'Student Meals'}
                    </h1>
                </div>
                <p className="text-[var(--unizy-text-muted)] dark:text-gray-400 mb-6">
                    {isRTL ? 'اطلب وجبتك اليومية بأسعار تناسب ميزانيتك.' : 'Order your daily meals at student-friendly prices.'}
                </p>

                {/* Search */}
                <div className="relative">
                    <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-gray-400`} />
                    <input
                        type="text"
                        placeholder={isRTL ? 'ابحث عن أكلات أو مطاعم...' : 'Search meals or restaurants...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-2xl py-3.5 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-[var(--unizy-text-dark)] dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm`}
                    />
                </div>
            </div>

            {/* Subscription Banner (Upsell) */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 mb-8 text-white flex items-center justify-between shadow-lg shadow-orange-500/20">
                <div>
                    <h3 className="font-bold text-lg mb-1">{isRTL ? 'خطط الوجبات الأسبوعية' : 'Weekly Meal Plans'}</h3>
                    <p className="text-orange-50 text-sm">{isRTL ? 'وفر حتى 30% مع الاشتراك الشهري.' : 'Save up to 30% with a monthly subscription.'}</p>
                </div>
                <button className="bg-white text-orange-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:scale-105 transition-transform shrink-0">
                    {isRTL ? 'اشترك الآن' : 'Subscribe'}
                </button>
            </div>

            {/* Categories */}
            <div className="mb-8">
                <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {MEAL_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all whitespace-nowrap ${activeCategory === cat.id
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                                    : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-500/50'
                                }`}
                        >
                            <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                            {isRTL ? cat.ar : cat.en}
                        </button>
                    ))}
                </div>
            </div>

            {/* Meals Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMeals.map((meal) => (
                    <div key={meal.id} className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow group flex flex-col">
                        {/* Image Area */}
                        <div className="relative h-48 w-full overflow-hidden">
                            <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                                <Heart className="w-4 h-4" />
                            </button>
                            {meal.isPopular && (
                                <div className="absolute top-3 left-3 bg-[var(--unizy-primary)] text-white text-xs font-bold px-2 py-1 rounded-lg">
                                    {isRTL ? 'الأكثر طلباً' : 'Popular'}
                                </div>
                            )}

                            <div className="absolute bottom-3 left-3 flex gap-2">
                                <span className="bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" /> {meal.rating}
                                </span>
                                <span className="bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-md">
                                    {meal.calories}
                                </span>
                            </div>
                        </div>

                        {/* Info Area */}
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-[var(--unizy-text-dark)] dark:text-white leading-tight">
                                        {isRTL ? meal.arName : meal.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meal.merchant}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-3 mb-5 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" /> {meal.prepTime}
                                </span>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-[var(--unizy-text-dark)] dark:text-white">{meal.price}</span>
                                    <span className="text-sm text-gray-500 font-medium">{meal.currency}</span>
                                </div>
                                <button className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white font-medium px-4 py-2 rounded-xl transition-colors">
                                    {isRTL ? 'إضافة للسلة' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredMeals.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                        <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{isRTL ? 'لا توجد وجبات تطابق بحثك حالياً.' : 'No meals match your search currently.'}</p>
                    </div>
                )}
            </div>

        </main>
    );
}
