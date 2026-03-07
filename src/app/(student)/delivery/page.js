'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { getVerifiedMerchants } from '@/app/actions/merchants';
import { createCustomDelivery } from '@/app/actions/delivery';
import { Package, Search, ShoppingBag, Utensils, Zap, Clock, Star, MapPin, ChevronRight, Send, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function DeliveryContent() {
    const { dict } = useLanguage();
    const router = useRouter();
    const d = dict?.delivery || {};
    const c = dict?.common || {};

    const [customRequest, setCustomRequest] = useState('');
    const [vendors, setVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const categories = [
        { id: 'fastfood', name: d?.categories?.fastFood || 'Fast Food', icon: <Utensils size={18} /> },
        { id: 'healthy', name: d?.categories?.healthy || 'Healthy', icon: <Zap size={18} /> },
        { id: 'groceries', name: d?.categories?.groceries || 'Groceries', icon: <ShoppingBag size={18} /> },
        { id: 'drinks', name: d?.categories?.coffeeAndDrinks || 'Drinks', icon: <Clock size={18} /> },
    ];

    const quickPrompts = [
        { label: "Bookstore", emoji: "📚" },
        { label: "Pharmacy", emoji: "💊" },
        { label: "Print Shop", emoji: "🖨️" },
        { label: "Gift", emoji: "🎁" }
    ];

    useEffect(() => {
        const fetchMerchants = async () => {
            setIsLoading(true);
            try {
                const res = await getVerifiedMerchants(selectedCategory);
                if (res.success) {
                    setVendors(res.data || []);
                }
            } catch (e) {
                console.error('Failed to fetch merchants:', e);
            }
            setIsLoading(false);
        };
        fetchMerchants();
    }, [selectedCategory]);

    const handleCustomSubmit = async (e) => {
        e.preventDefault();
        if (!customRequest.trim()) return;

        setIsLoading(true);
        const res = await createCustomDelivery(customRequest, '', 'User Location');
        if (res.success) {
            toast.success('Request Sent to Couriers! 🛵');
            setCustomRequest('');
            router.push(`/activity/tracking/${res.data.id}`);
        } else {
            toast.error(res.error || 'Failed to send request');
        }
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-unizy-navy pb-32 transition-colors duration-300">

            {/* Header & Hero */}
            <div className="relative overflow-hidden bg-white dark:bg-unizy-dark pt-12 pb-20 px-6 border-b border-gray-100 dark:border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full -ml-32 -mb-32" />

                <div className="max-w-7xl mx-auto relative">
                    <div className="flex items-center justify-between mb-10 translate-y-2 animate-fade-in-down">
                        <div className="flex items-center gap-4">
                            <Link href="/students" className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-unizy-navy flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border border-gray-100 dark:border-white/5">
                                <span className="text-lg">←</span>
                            </Link>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Everything <span className="text-brand-600">Delivery</span></h1>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 rounded-full">
                            <Zap size={14} className="text-brand-600 animate-pulse" />
                            <span className="text-[10px] font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest">Active System</span>
                        </div>
                    </div>

                    {/* Section 1: Order Anything (Enhanced) */}
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">What can we get you?</h2>
                            <p className="text-sm text-gray-500 font-medium">Type anything from anywhere and our couriers will handle it.</p>
                        </div>

                        <form onSubmit={handleCustomSubmit} className="relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-brand-500 group-focus-within:animate-bounce">
                                <Send size={20} />
                            </div>
                            <input
                                type="text"
                                value={customRequest}
                                onChange={(e) => setCustomRequest(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent rounded-[2.5rem] pl-16 pr-32 py-8 text-lg font-bold shadow-sm focus:border-brand-500/50 focus:bg-white dark:focus:bg-unizy-dark transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="I want coffee from the library..."
                            />
                            <button
                                type="submit"
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-brand-500/30 transition-all active:scale-95"
                            >
                                GO
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2 mt-6 justify-center">
                            {quickPrompts.map(prompt => (
                                <button
                                    key={prompt.label}
                                    onClick={() => setCustomRequest(`Get ${prompt.label} from `)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-unizy-dark hover:bg-brand-50 dark:hover:bg-brand-900/10 border border-gray-100 dark:border-white/5 rounded-full text-xs font-bold text-gray-600 dark:text-gray-400 transition-all hover:scale-105 active:scale-95"
                                >
                                    <span>{prompt.emoji}</span>
                                    {prompt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Merchant Discovery (Available Places) */}
            <main className="px-6 max-w-7xl mx-auto w-full -mt-8 relative z-10">

                {/* Categories horizontal scroll */}
                <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar mb-8">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            className={`snap-center shrink-0 flex items-center gap-3 px-8 py-5 rounded-[2rem] shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${selectedCategory === cat.id ? 'bg-brand-600 text-white shadow-brand-600/20' : 'bg-white dark:bg-unizy-dark text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-white/5 hover:border-brand-500'}`}
                        >
                            <span className={`${selectedCategory === cat.id ? 'text-white' : 'text-brand-600'}`}>{cat.icon}</span>
                            <span className="text-sm font-black uppercase tracking-widest">{cat.name}</span>
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Available Places</h2>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Verified Local Merchants</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-unizy-dark p-2 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <button className="px-6 py-2.5 rounded-xl text-xs font-black uppercase bg-gray-50 dark:bg-unizy-navy text-gray-900 dark:text-white">Popular</button>
                        <button className="px-6 py-2.5 rounded-xl text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors">Distance</button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center"><div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div></div>
                ) : vendors.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center bg-white dark:bg-unizy-dark rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
                        <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-unizy-navy flex items-center justify-center text-4xl mb-6 grayscale opacity-50">🏪</div>
                        <h3 className="font-black text-xl mb-2 text-gray-900 dark:text-white">{d.noMerchants || "No merchants found"}</h3>
                        <p className="text-gray-500 text-sm max-w-xs">{d.tryDifferentCategory || "Try exploring a different category or ordering anything custom above!"}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {vendors.map(vendor => (
                            <Link
                                href={`/delivery/merchant/${vendor.id}`}
                                key={vendor.id}
                                className="group bg-white dark:bg-unizy-dark rounded-[2.5rem] p-4 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                            >
                                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-unizy-navy/50">
                                    {vendor.profileImage ? (
                                        <Image src={vendor.profileImage} alt={vendor.name} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🥘</div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/95 dark:bg-unizy-dark/95 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-brand-600 shadow-xl border border-white/20">
                                        {vendor.tag}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 backdrop-blur-md w-10 h-10 rounded-2xl flex items-center justify-center text-white transition-colors cursor-pointer">
                                        <HelpCircle size={18} />
                                    </div>
                                </div>

                                <div className="mt-6 px-2">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-none group-hover:text-brand-600 transition-colors">{vendor.name}</h3>
                                        <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1.5 rounded-xl border border-yellow-400/20">
                                            <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] text-yellow-700 dark:text-yellow-400 font-black">{(vendor.rating || 5.0).toFixed(1)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400">
                                        <span className="flex items-center gap-1.5"><Clock size={12} className="text-brand-500" /> {vendor.time}</span>
                                        <span className="flex items-center gap-1.5"><Zap size={12} className="text-emerald-500" /> Free</span>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-unizy-dark bg-gray-200" />
                                            ))}
                                            <div className="text-[10px] font-black text-gray-400 pl-4 pt-1">+12 ordering now</div>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-unizy-navy flex items-center justify-center text-gray-400 group-hover:bg-brand-600 group-hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function DeliveryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen items-center flex justify-center bg-gray-50 dark:bg-unizy-navy">
            <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
        </div>}>
            <DeliveryContent />
        </Suspense>
    );
}
