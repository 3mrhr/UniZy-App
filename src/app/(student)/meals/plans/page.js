'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Check, Calendar, CalendarDays, Wallet, Leaf, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = [
    {
        id: 'weekly_standard',
        name: 'Weekly Standard',
        arName: 'باقة أسبوعية أساسية',
        price: 450,
        currency: 'EGP',
        duration: '1 Week',
        mealsPerDay: 1,
        features: ['1 Main meal daily', 'Free delivery', 'Skip weekends open', 'Basic customization'],
        icon: Calendar,
        color: 'blue'
    },
    {
        id: 'monthly_pro',
        name: 'Monthly Pro',
        arName: 'باقة شهرية احترافية',
        price: 1800,
        currency: 'EGP',
        duration: '1 Month',
        mealsPerDay: 2,
        features: ['2 Meals daily (Lunch & Dinner)', 'Priority delivery', 'Full customization', 'Pause anytime', 'Free desserts on weekends'],
        icon: CalendarDays,
        color: 'orange',
        recommended: true
    },
    {
        id: 'monthly_healthy',
        name: 'Monthly Healthy',
        arName: 'باقة شهرية صحية',
        price: 2100,
        currency: 'EGP',
        duration: '1 Month',
        mealsPerDay: 2,
        features: ['2 Calorie-counted meals daily', 'Nutritionist consulted', 'Fresh organic salads', 'Pause anytime'],
        icon: Leaf,
        color: 'green'
    }
];

export default function MealPlansPage() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState(PLANS[1].id);
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async () => {
        setIsSubscribing(true);
        const plan = PLANS.find(p => p.id === selectedPlan);

        try {
            // Reusing createOrder for a generic checkout log in the MVP
            const { createOrder } = await import('@/app/actions/orders');

            const result = await createOrder('MEALS', {
                type: 'SUBSCRIPTION',
                plan: plan.name,
                duration: plan.duration,
                mealsPerDay: plan.mealsPerDay
            }, plan.price);

            if (result.success) {
                toast.success('Successfully subscribed to plan!');
                router.push(`/activity/tracking/${result.order.id}`);
            } else {
                toast.error(result.error || 'Subscription failed');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            toast.error('An error occurred during subscription');
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32">
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 py-4 px-6 md:px-12">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white">Meal Plans</h1>
                        <p className="text-xs text-gray-500 font-bold">Subscribe and save</p>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-8">

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Never worry about cooking again</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Choose a plan that fits your lifestyle. Get fresh, hot meals delivered right to your dorm or faculty daily.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {PLANS.map((plan) => {
                        const isSelected = selectedPlan === plan.id;
                        const Icon = plan.icon;

                        return (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`relative cursor-pointer rounded-3xl p-6 transition-all border-2 ${isSelected ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-500/10 shadow-xl shadow-orange-500/20 scale-105 z-10' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-unizy-dark hover:border-orange-300'}`}
                            >
                                {plan.recommended && (
                                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                                        <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                        {isSelected && <Check size={14} className="text-white" />}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                                <p className="text-xs font-bold text-gray-400 mb-6">{plan.duration}</p>

                                <div className="mb-6">
                                    <span className="text-3xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                                    <span className="text-sm font-bold text-gray-500"> {plan.currency}</span>
                                </div>

                                <ul className="space-y-3">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                            <Check size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Info Block */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-6 border border-blue-100 dark:border-blue-900/30 flex items-start gap-4 mb-10">
                    <div className="bg-white dark:bg-blue-800/50 p-2 rounded-xl shrink-0">
                        <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Pause or Skip Anytime</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">Heading home for the weekend? You can skip days or pause your subscription entirely from your dashboard. Missed days will be credited back to your account.</p>
                    </div>
                </div>

                <button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                    className="w-full sm:w-auto mx-auto block bg-orange-500 hover:bg-orange-600 text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSubscribing ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Processing...</span>
                        </div>
                    ) : (
                        'Subscribe Now'
                    )}
                </button>

            </main>
        </div>
    );
}
