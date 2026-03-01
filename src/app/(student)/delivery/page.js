'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from '@/i18n/LanguageProvider';

export default function DeliveryPage() {
    const { dict } = useLanguage();
    const t = dict?.landing?.delivery || "Delivery";
    const homeDict = dict?.home || {};

    const categories = [
        { id: 'fastfood', name: 'Fast Food', icon: '🍔' },
        { id: 'healthy', name: 'Healthy', icon: '🥗' },
        { id: 'dessert', name: 'Desserts', icon: '🍰' },
        { id: 'groceries', name: 'Groceries', icon: '🛒' },
        { id: 'drinks', name: 'Coffee & Drinks', icon: '☕' },
    ];

    const vendors = [
        { id: 1, name: 'Campus Burgers', rating: '4.8', time: '15-25 min', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', tag: 'Bestseller' },
        { id: 2, name: 'Fresh Greens', rating: '4.5', time: '20-30 min', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', tag: 'Healthy' },
        { id: 3, name: 'Sweet Cravings', rating: '4.9', time: '10-20 min', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', tag: 'New' },
        { id: 4, name: 'Daily Mart', rating: '4.7', time: '30-40 min', image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', tag: 'Essentials' },
    ];

    const [isOrdering, setIsOrdering] = useState(false);

    const handleOrder = async (vendor) => {
        setIsOrdering(true);
        const { createOrder } = await import('@/app/actions/orders');
        const result = await createOrder('DELIVERY', {
            vendor: vendor.name,
            items: ['Mock Item 1', 'Mock Item 2']
        }, 150.00); // Fixed price for mock MVP

        setIsOrdering(false);
        if (result.success) {
            alert('Order placed successfully! Track it in your Activity Center.');
        } else {
            alert(result.error || 'Failed to place order');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32 transition-colors duration-300">

            {/* Search Header */}
            <header className="px-6 py-10 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-8 translate-y-2 animate-fade-in-down">
                    <Link href="/students" className="w-10 h-10 rounded-full bg-white dark:bg-unizy-dark flex items-center justify-center shadow-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <span className="text-lg">←</span>
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{homeDict.delivery || "Delivery"}</h1>
                </div>

                <div className="relative group animate-fade-in delay-100 mb-8">
                    <div className="absolute inset-y-0 left-5 rtl:left-auto rtl:right-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors text-xl">
                        🔍
                    </div>
                    <input
                        type="text"
                        className="w-full bg-white dark:bg-unizy-dark border-none rounded-[2rem] pl-14 rtl:pl-4 rtl:pr-14 p-6 text-lg font-medium shadow-2xl shadow-gray-200/50 dark:shadow-none focus:ring-4 focus:ring-brand-500/10 focus:bg-white dark:focus:bg-unizy-navy transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="Search for food or products..."
                    />
                </div>

                {/* Categories horizontal scroll */}
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar animate-fade-in delay-200">
                    {categories.map(cat => (
                        <button key={cat.id} className="snap-center shrink-0 flex items-center gap-2 px-6 py-4 bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-brand-500 transition-all hover:scale-105 active:scale-95 group">
                            <span className="text-2xl group-hover:rotate-12 transition-transform">{cat.icon}</span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{cat.name}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Vendors Grid */}
            <main className="px-6 max-w-7xl mx-auto w-full">
                <div className="flex justify-between items-end mb-8 animate-fade-in delay-300">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Popular Near You</h2>
                    <button className="text-brand-600 font-bold text-sm hover:underline">{dict?.common?.viewAll || "View All"}</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up delay-400">
                    {vendors.map(vendor => (
                        <div key={vendor.id} className="group flex flex-col gap-4 bg-white dark:bg-unizy-dark rounded-[2.5rem] p-4 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-300">
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden">
                                <Image src={vendor.image} alt={vendor.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-unizy-dark/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-brand-600 shadow-xl">
                                    {vendor.tag}
                                </div>
                                <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white dark:bg-unizy-dark shadow-xl flex items-center justify-center text-xl hover:scale-110 active:scale-90 transition-transform">
                                    ❤️
                                </button>
                            </div>

                            <div className="px-2">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-none truncate">{vendor.name}</h3>
                                    <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg">
                                        <span className="text-xs text-yellow-600 font-black">⭐ {vendor.rating}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 dark:text-gray-500">
                                    <span className="flex items-center gap-1">🕒 {vendor.time}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                    <span>Free Delivery</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleOrder(vendor)}
                                disabled={isOrdering}
                                className={`w-full bg-gray-50 dark:bg-unizy-navy/50 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 transition-all py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-900 dark:text-white hover:text-white ${isOrdering ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                {isOrdering ? '...' : 'Order Now'}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
