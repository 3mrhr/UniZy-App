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
    const [selectedVariants, setSelectedVariants] = useState({});
    const [selectedAddons, setSelectedAddons] = useState({});
    const [isOrdering, setIsOrdering] = useState(false);

    // Subscription State
    const [activeSubscription, setActiveSubscription] = useState(null);
    const [availablePlans, setAvailablePlans] = useState([]);
    const [showPlans, setShowPlans] = useState(false);
    const [isPurchasingPlan, setIsPurchasingPlan] = useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const { getActiveMeals, getActiveSubscription, getMealPlans } = await import('@/app/actions/meals');
                const [mealsRes, subRes, plansRes] = await Promise.all([
                    getActiveMeals(activeCategory, searchQuery),
                    getActiveSubscription(),
                    getMealPlans()
                ]);

                if (mealsRes.success) setMeals(mealsRes.meals);
                if (subRes.success) setActiveSubscription(subRes.subscription);
                if (plansRes.success) setAvailablePlans(plansRes.plans);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchData();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [activeCategory, searchQuery]);

    const calculateTotal = (meal) => {
        if (!meal) return 0;
        let total = meal.price;
        meal.variantGroups?.forEach(group => {
            const selectedId = selectedVariants[group.id];
            const option = group.options.find(o => o.id === selectedId);
            if (option) total += option.priceDelta;
        });
        meal.addonGroups?.forEach(group => {
            const selectedIds = selectedAddons[group.id] || [];
            selectedIds.forEach(id => {
                const option = group.options.find(o => o.id === id);
                if (option) total += option.priceDelta;
            });
        });
        return total;
    };

    const handleOrder = async (meal, useCredits = false) => {
        if (useCredits && (!activeSubscription || activeSubscription.remainingCredits < 1)) {
            toast.error(isRTL ? "ليس لديك رصيد كافٍ" : "Insufficient credits");
            return;
        }

        setIsOrdering(true);
        try {
            const variantsArray = Object.entries(selectedVariants).map(([groupId, optionId]) => ({ groupId, optionId }));
            const addonsArray = [];
            Object.entries(selectedAddons).forEach(([groupId, optionIds]) => {
                optionIds.forEach(optionId => addonsArray.push({ groupId, optionId }));
            });

            const { orderMeal } = await import('@/app/actions/meals');
            const res = await orderMeal({
                mealId: meal.id,
                quantity: 1,
                variants: variantsArray,
                addons: addonsArray,
                useCredits
            });

            if (res.success) {
                toast.success(isRTL ? "تم إضافة الطلب بنجاح!" : "Order placed successfully!");
                setSelectedMeal(null);
                router.push(`/activity/tracking/${res.order.id}`);
            } else {
                toast.error(res.error || (isRTL ? "حدث خطأ" : "Order failed"));
            }
        } catch (err) {
            toast.error(isRTL ? "حدث خطأ" : "Order failed");
            console.error(err);
        } finally {
            setIsOrdering(false);
        }
    };

    const handlePurchasePlan = async (planId) => {
        setIsPurchasingPlan(true);
        try {
            const { purchaseSubscription } = await import('@/app/actions/meals');
            const res = await purchaseSubscription(planId);
            if (res.success) {
                toast.success(isRTL ? "تم تفعيل الاشتراك!" : "Subscription activated!");
                setShowPlans(false);
                setActiveSubscription(res.subscription);
            } else {
                toast.error(res.error || "Purchase failed");
            }
        } catch (err) {
            toast.error("An error occurred");
        } finally {
            setIsPurchasingPlan(false);
        }
    };

    const toggleAddon = (groupId, optionId, maxSelect) => {
        setSelectedAddons(prev => {
            const current = prev[groupId] || [];
            if (current.includes(optionId)) return { ...prev, [groupId]: current.filter(id => id !== optionId) };
            if (current.length >= maxSelect && maxSelect === 1) return { ...prev, [groupId]: [optionId] };
            if (current.length >= maxSelect) return prev;
            return { ...prev, [groupId]: [...current, optionId] };
        });
    };

    return (
        <main className="min-h-screen pb-24 bg-[var(--background)] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 animate-fade-in text-gray-900 dark:text-white">
            {/* Header + Search */}
            <div className="mb-8 relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shadow-lg border border-orange-500/20">
                            <UtensilsCrossed className="w-7 h-7 text-orange-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">UniZy Kitchen</h1>
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mt-1">Campus Dining Reimagined</p>
                        </div>
                    </div>

                    {/* Active Subscription Widget */}
                    {activeSubscription && (
                        <div className="glass-frosted px-6 py-4 rounded-[1.5rem] border-none shadow-xl flex items-center gap-4 animate-spring">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <Leaf className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Plan</p>
                                <p className="text-sm font-black">
                                    {activeSubscription.remainingCredits} Credits Left
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-5' : 'left-5'} w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors z-20`} />
                    <input
                        type="text"
                        placeholder="Search for healthy meals..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full glass-frosted border-2 border-transparent focus:border-orange-500/30 rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold transition-all outline-none text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Daily Healthy Hero / Subscription Banner */}
            {!activeSubscription && (activeCategory === 'healthy' || activeCategory === 'all') && (
                <div className="glass-frosted rounded-[2.5rem] p-8 mb-10 overflow-hidden relative group border-none shadow-3xl">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 blur-[100px] transition-all"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-3">
                                <Star size={10} fill="currentColor" /> Daily Healthy
                            </div>
                            <h3 className="font-black text-2xl mb-2">Sustainable Eating, Discounted</h3>
                            <p className="text-gray-500 text-sm font-medium">Subscribe and get healthy meals delivered daily for as low as 45 EGP.</p>
                        </div>
                        <button onClick={() => setShowPlans(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/30 transition-all">
                            View Healthy Plans
                        </button>
                    </div>
                </div>
            )}

            {/* Categories */}
            <div className="mb-10 flex overflow-x-auto gap-4 hide-scrollbar">
                {['all', ...MEAL_CATEGORIES.map(c => c.id)].map(id => (
                    <button key={id} onClick={() => setActiveCategory(id)} className={`px-6 py-4 rounded-2xl font-black text-xs uppercase transition-all duration-500 shrink-0 ${activeCategory === id ? 'bg-orange-500 text-white shadow-2xl animate-spring' : 'glass-frosted text-gray-500 hover:bg-orange-500/5'}`}>
                        {id === 'all' ? 'All' : MEAL_CATEGORIES.find(c => c.id === id).en}
                    </button>
                ))}
            </div>

            {/* Meals Feed */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    [...Array(6)].map((_, i) => <div key={i} className="glass-frosted rounded-[2.5rem] h-96 animate-pulse" />)
                ) : meals.map(meal => (
                    <div key={meal.id} className="glass-frosted rounded-[2.5rem] overflow-hidden group hover:scale-[1.02] transition-all duration-500 relative">
                        <div className="h-60 overflow-hidden bg-gray-100">
                            {meal.image ? <img src={meal.image} className="w-full h-full object-cover group-hover:scale-110 duration-1000" /> : <div className="h-full flex items-center justify-center"><UtensilsCrossed className="w-16 h-16 text-gray-200" /></div>}
                        </div>
                        <div className="p-7">
                            <h3 className="font-black text-xl mb-2">{meal.name}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{meal.merchant?.name}</p>
                            <div className="flex items-center justify-between mt-6">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black">{meal.price} {meal.currency}</span>
                                    {meal.category === 'healthy' && <span className="text-[10px] text-emerald-500 font-bold uppercase">Healthy Credit eligible</span>}
                                </div>
                                <button onClick={() => setSelectedMeal(meal)} className="bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-2xl shadow-xl hover:scale-105 transition-all">Customize & Buy</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Customization Modal */}
            {selectedMeal && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl z-[2000] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-unizy-navy w-full max-w-lg rounded-[3rem] overflow-hidden shadow-4xl animate-spring flex flex-col relative max-h-[90vh]">
                        <div className="relative h-64 shrink-0 overflow-hidden">
                            {selectedMeal.image ? <img src={selectedMeal.image} className="w-full h-full object-cover" /> : <div className="h-full bg-orange-500/5 flex items-center justify-center"><UtensilsCrossed className="w-20 h-20 text-orange-200" /></div>}
                            <button onClick={() => setSelectedMeal(null)} className="absolute top-6 right-6 w-12 h-12 glass-frosted rounded-full flex items-center justify-center"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-8 overflow-y-auto">
                            <h3 className="font-black text-3xl mb-8">{selectedMeal.name}</h3>
                            <div className="space-y-6">
                                {selectedMeal.variantGroups?.map(g => (
                                    <div key={g.id}>
                                        <p className="text-[10px] font-black uppercase text-gray-400 mb-4">{g.name}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {g.options.map(o => (
                                                <button key={o.id} onClick={() => setSelectedVariants(prev => ({ ...prev, [g.id]: o.id }))} className={`px-4 py-3 rounded-xl text-xs font-black ${selectedVariants[g.id] === o.id ? 'bg-orange-500 text-white' : 'glass-frosted hover:bg-orange-500/5'}`}>{o.name}</button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-8 glass-frosted border-t border-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <p className="text-[9px] font-black text-gray-400 uppercase">Total</p>
                                    <p className="text-4xl font-black">{calculateTotal(selectedMeal)} <span className="text-sm">EGP</span></p>
                                </div>
                                {activeSubscription && activeSubscription.remainingCredits > 0 && selectedMeal.category === 'healthy' && (
                                    <button onClick={() => handleOrder(selectedMeal, true)} className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse border-2 border-emerald-400">Use 1 Credit</button>
                                )}
                            </div>
                            <button onClick={() => handleOrder(selectedMeal)} disabled={isOrdering} className="w-full bg-orange-500 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all">Confirm Order</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Selection Modal */}
            {showPlans && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xl z-[2000] flex items-center justify-center p-4 text-gray-900 dark:text-white">
                    <div className="bg-white dark:bg-unizy-navy w-full max-w-2xl rounded-[3rem] p-10 shadow-4xl animate-spring relative">
                        <button onClick={() => setShowPlans(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"><X size={24} /></button>
                        <h2 className="text-3xl font-black mb-2">Choose Your Healthy Plan</h2>
                        <p className="text-gray-500 mb-10">Healthy, macro-balanced meals at unbeatable prices.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availablePlans.map(plan => (
                                <div key={plan.id} className="glass-frosted p-8 rounded-[2rem] border-2 border-transparent hover:border-emerald-500/20 transition-all flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center"><CalendarDays className="text-emerald-500" /></div>
                                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-tighter bg-emerald-500/10 px-3 py-1 rounded-full">{plan.frequency}</span>
                                    </div>
                                    <h4 className="text-xl font-black mb-2">{plan.name}</h4>
                                    <p className="text-sm text-gray-500 mb-8 flex-1">{plan.description || `${plan.credits} healthy meals included.`}</p>
                                    <div className="flex items-baseline gap-2 mb-8">
                                        <span className="text-4xl font-black">{plan.price}</span>
                                        <span className="text-xs font-black text-gray-400">EGP</span>
                                    </div>
                                    <button onClick={() => handlePurchasePlan(plan.id)} disabled={isPurchasingPlan} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all">Subscribe Now</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
