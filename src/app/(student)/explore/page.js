"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Home, Truck, ShoppingBag, Tag, UtensilsCrossed, Sparkles, Wrench, Search } from "lucide-react";

const MODULES = [
    { id: 'housing', label: 'Housing', arLabel: 'سكن', description: 'Find rooms and apartments', icon: Home, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', href: '/housing' },
    { id: 'transport', label: 'Transport', arLabel: 'مواصلات', description: 'Book rides to campus', icon: Truck, color: 'from-cyan-500 to-blue-600', shadow: 'shadow-cyan-500/20', href: '/transport' },
    { id: 'delivery', label: 'Delivery', arLabel: 'توصيل', description: 'Send parcels fast', icon: ShoppingBag, color: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/20', href: '/delivery' },
    { id: 'deals', label: 'Deals', arLabel: 'عروض', description: 'Student discounts', icon: Tag, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', href: '/deals' },
    { id: 'meals', label: 'Meals', arLabel: 'وجبات', description: 'Campus meal plans', icon: UtensilsCrossed, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', href: '/meals' },
    { id: 'services', label: 'Home Services', arLabel: 'خدمات منزلية', description: 'Repair and maintenance', icon: Wrench, color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20', href: '/services' },
    { id: 'cleaning', label: 'Cleaning', arLabel: 'تنظيف', description: 'Book a cleaner', icon: Sparkles, color: 'from-purple-500 to-purple-700', shadow: 'shadow-purple-500/20', href: '/services/cleaning' },
];

export default function ExploreHubPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-unizy-navy pb-24 transition-colors">
            {/* Minimal Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 pt-6 pb-6 shadow-sm">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Explore UniZy</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">Discover all services available on campus.</p>

                    <Link href="/search" className="mt-6 flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-3.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors group">
                        <Search size={20} className="text-slate-400 group-hover:text-brand-500 transition-colors" />
                        <span className="text-slate-500 font-bold text-sm">{isRTL ? 'ما الذي تبحث عنه؟' : 'What are you looking for?'}</span>
                    </Link>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {MODULES.map((mod) => (
                        <Link
                            key={mod.id}
                            href={mod.href}
                            className="bg-white dark:bg-[#1E293B] rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:scale-105 transition-all duration-300 group flex flex-col items-center text-center"
                        >
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mod.color} shadow-lg ${mod.shadow} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <mod.icon size={26} className="text-white" />
                            </div>
                            <h3 className="font-black text-slate-900 dark:text-white text-[15px] mb-1 leading-tight">
                                {isRTL ? mod.arLabel : mod.label}
                            </h3>
                            <p className="text-[11px] font-bold text-slate-400 leading-snug px-1">
                                {mod.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
