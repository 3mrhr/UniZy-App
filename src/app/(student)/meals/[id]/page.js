"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
    Clock, Star, UtensilsCrossed, ChevronLeft, Heart,
    Share2, Plus, Minus, Info, Flame, Leaf, ChefHat
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function MealDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';

    const [meal, setMeal] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchMealDetails = async () => {
            setIsLoading(true);
            try {
                const { getMealById } = await import('@/app/actions/meals');
                const result = await getMealById(id);
                if (result.success) {
                    setMeal(result.meal);
                }
            } catch (error) {
                console.error("Error fetching meal details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMealDetails();
    }, [id]);

    const handleBack = () => router.back();
    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));
    const toggleSave = () => setIsSaved(!isSaved);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy animate-pulse">
                <div className="h-[40vh] bg-gray-200 dark:bg-gray-800" />
                <div className="max-w-4xl mx-auto px-6 -mt-10">
                    <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 shadow-xl">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8" />
                        <div className="space-y-4">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <UtensilsCrossed className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Meal Not Found</h2>
                <button onClick={handleBack} className="mt-6 text-brand-600 font-bold flex items-center gap-2">
                    <ChevronLeft className="w-5 h-5" /> Back to Meals
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32">
            {/* Hero Image Section */}
            <div className="relative h-[45vh] w-full overflow-hidden">
                {meal.image ? (
                    <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <UtensilsCrossed className="w-24 h-24 text-orange-200 dark:text-orange-800" />
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent"></div>

                {/* Top Actions */}
                <div className="absolute top-6 inset-x-6 flex justify-between items-center z-10 transition-transform duration-300">
                    <button
                        onClick={handleBack}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/30 hover:bg-white/40 transition-all"
                    >
                        <ChevronLeft className={`w-6 h-6 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="flex gap-3">
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/30 hover:bg-white/40">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={toggleSave}
                            className={`w-12 h-12 rounded-full backdrop-blur-xl flex items-center justify-center transition-all border shadow-lg ${isSaved ? 'bg-red-500 border-red-500 text-white' : 'bg-white/20 border-white/30 text-white'}`}
                        >
                            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 relative z-20">
                <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5">

                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div>
                            <div className="flex gap-2 mb-3">
                                {meal.isPopular && (
                                    <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                        <Flame className="w-3 h-3" /> Popular
                                    </span>
                                )}
                                <span className="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <ChefHat className="w-3 h-3" /> Student Favorite
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                                {isRTL ? (meal.arName || meal.name) : meal.name}
                            </h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                                {meal.merchant?.name || 'UniZy Kitchen'}
                            </p>
                        </div>

                        <div className="flex flex-col items-end">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-gray-900 dark:text-white">{meal.price}</span>
                                    <span className="text-lg font-bold text-brand-600 dark:text-brand-400">{meal.currency || 'EGP'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-3 bg-gray-50 dark:bg-unizy-navy rounded-3xl p-6 mb-10">
                        <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-800">
                            <Star className="w-5 h-5 text-yellow-500 fill-current mb-1" />
                            <span className="font-black text-gray-900 dark:text-white">{meal.rating || '4.9'}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Rating</span>
                        </div>
                        <div className="flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-800">
                            <Clock className="w-5 h-5 text-brand-500 mb-1" />
                            <span className="font-black text-gray-900 dark:text-white">{meal.prepTime || '15-20m'}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Time</span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <Flame className="w-5 h-5 text-orange-500 mb-1" />
                            <span className="font-black text-gray-900 dark:text-white">{meal.calories || '450'}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Calories</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-10">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Description</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                            {meal.description || (isRTL
                                ? 'وجبة شهية ومغذية مصممة خصيصاً لتناسب يوم الطلاب المزدحم. تحتوي على مكونات طازجة وجودة عالية.'
                                : 'A delicious and nutritious meal specially designed to fit into a busy student schedule. Made with fresh, high-quality ingredients.'
                            )}
                        </p>
                    </div>

                    {/* Features/Dietary */}
                    <div className="flex flex-wrap gap-4 mb-10">
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 px-4 py-2 rounded-2xl text-sm font-bold border border-green-100 dark:border-green-900/30">
                            <Leaf className="w-4 h-4" /> Healthy Choice
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-2xl text-sm font-bold border border-blue-100 dark:border-blue-900/30">
                            <Info className="w-4 h-4" /> Fresh Daily
                        </div>
                    </div>
                </div>

                {/* Sticky Action Footer-like bar */}
                <div className="bg-white dark:bg-unizy-dark rounded-[2rem] p-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center bg-gray-100 dark:bg-unizy-navy rounded-2xl p-2 gap-4">
                        <button
                            onClick={handleDecrement}
                            className="w-12 h-12 rounded-xl bg-white dark:bg-unizy-dark flex items-center justify-center text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            <Minus className="w-5 h-5" />
                        </button>
                        <span className="text-2xl font-black w-8 text-center text-gray-900 dark:text-white">{quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="w-12 h-12 rounded-xl bg-white dark:bg-unizy-dark flex items-center justify-center text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            useCartStore.getState().addToCart(meal, quantity);
                            // Simple visual feedback before redirect or staying
                            const btn = document.getElementById('add-to-order-btn');
                            const originalText = btn.innerHTML;
                            btn.innerHTML = '✨ Added to Cart!';
                            btn.classList.add('bg-green-500');
                            btn.classList.remove('bg-brand-600');
                            setTimeout(() => {
                                router.push(`/delivery/merchant/${meal.merchantId}`);
                            }, 800);
                        }}
                        id="add-to-order-btn"
                        className="flex-1 w-full sm:w-auto h-16 bg-brand-600 hover:bg-brand-700 text-white rounded-[1.5rem] font-black text-lg shadow-xl shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                        {isRTL ? 'إضافة للطلب' : 'Add to Order'}
                        <span className="opacity-50">•</span>
                        <span>{(meal.price * quantity).toFixed(2)} {meal.currency}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
