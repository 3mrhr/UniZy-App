"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Clock, Info, Search, Star, UtensilsCrossed, CalendarDays, Wallet, ChefHat, Heart, ChevronRight, Leaf, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MEAL_CATEGORIES = [
    { id: 'daily', en: 'Daily Offers', ar: 'عروض اليوم', icon: CalendarDays },
    { id: 'budget', en: 'Budget Meals', ar: 'وجبات اقتصادية', icon: Wallet },
    { id: 'healthy', en: 'Healthy', ar: 'أكل صحي', icon: Leaf },
    { id: 'protein', en: 'High Protein', ar: 'عالي البروتين', icon: ChefHat },
];

export default function MealsPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [activeCategory, setActiveCategory] = useState('daily');
    const [searchQuery, setSearchQuery] = useState('');
    const [meals, setMeals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const router = useRouter();
    const [selectedMeal, setSelectedMeal] = useState(null);
    const [isOrdering, setIsOrdering] = useState(false);

    React.useEffect(() => {
        const fetchMeals = async () => {
            setIsLoading(true);
            try {
                const { getActiveMeals } = await import('@/app/actions/meals');
                const result = await getActiveMeals(activeCategory, searchQuery);
                if (result.success && result.meals) {
                    setMeals(result.meals);
                }
            } catch (error) {
                console.error("Failed to fetch meals", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchMeals();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [activeCategory, searchQuery]);

    const handleOrder = async (meal) => {
        setIsOrdering(true);
        try {
            const { orderMeal } = await import('@/app/actions/meals');
            const res = await orderMeal({ mealId: meal.id, quantity: 1 });
            if (res.success) {
                toast.success(isRTL ? "تم الطلب بنجاح!" : "Order placed successfully!");
                setSelectedMeal(null);
                router.push(`/activity/tracking/${res.order.id}`);
            } else {
                toast.error(res.error || (isRTL ? "حدث خطأ أثناء الطلب" : "Failed to place order"));
            }
        } catch (err) {
            toast.error(isRTL ? "حدث خطأ أثناء الطلب" : "Failed to place order");
            console.error(err);
        } finally {
            setIsOrdering(false);
        }
    };

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
                    <h3 className="font-bold text-lg mb-1">{isRTL ? 'خطط الوجبات الأسبوعية' : 'Meal Plans'}</h3>
                    <p className="text-orange-50 text-sm">{isRTL ? 'وفر حتى 30% مع الاشتراك الشهري.' : 'Save up to 30% and never worry about cooking.'}</p>
                </div>
                <Link href="/meals/plans" className="bg-white text-orange-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:scale-105 transition-transform shrink-0">
                    {isRTL ? 'اشترك الآن' : 'Subscribe'}
                </Link>
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
                {isLoading ? (
                    // Loading Skeletons
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse flex flex-col h-full">
                            <div className="h-48 bg-gray-200 dark:bg-gray-700 w-full mb-4"></div>
                            <div className="p-5 flex-1 flex flex-col space-y-3">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                <div className="mt-auto pt-4 flex justify-between items-center">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : meals.map((meal) => (
                    <div key={meal.id} className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow group flex flex-col">
                        {/* Image Area */}
                        <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {meal.image ? (
                                <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <UtensilsCrossed className="w-12 h-12 text-gray-400" />
                                </div>
                            )}
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
                                        {isRTL ? (meal.arName || meal.name) : meal.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meal.merchant?.name || 'Local Kitchen'}</p>
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
                                <button onClick={() => setSelectedMeal(meal)} className="bg-orange-50 dark:bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white font-medium px-4 py-2 rounded-xl transition-colors">
                                    {isRTL ? 'شراء' : 'Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {!isLoading && meals.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                        <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{isRTL ? 'لا توجد وجبات تطابق بحثك حالياً.' : 'No meals match your search currently.'}</p>
                    </div>
                )}
            </div>

            {/* Quick Checkout Modal */}
            {selectedMeal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="relative h-40 bg-gray-100 dark:bg-gray-800">
                            {selectedMeal.image ? (
                                <img src={selectedMeal.image} alt={selectedMeal.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-orange-50 dark:bg-orange-900/20">
                                    <UtensilsCrossed className="w-12 h-12 text-orange-200 dark:text-orange-800" />
                                </div>
                            )}
                            <button onClick={() => setSelectedMeal(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{isRTL ? (selectedMeal.arName || selectedMeal.name) : selectedMeal.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">{selectedMeal.merchant?.name}</p>

                            <div className="flex justify-between items-center mb-6 py-4 border-y border-gray-100 dark:border-white/5">
                                <span className="font-bold text-gray-700 dark:text-gray-300">{isRTL ? 'المجموع' : 'Total'}</span>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">{selectedMeal.price} <span className="text-sm font-bold text-gray-400">{selectedMeal.currency}</span></span>
                            </div>

                            <button
                                onClick={() => handleOrder(selectedMeal)}
                                disabled={isOrdering}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/30 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed">
                                {isOrdering ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    isRTL ? 'تأكيد الطلب' : 'Confirm Order'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
