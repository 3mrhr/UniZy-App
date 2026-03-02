'use client';

import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import ThemeLangControls from '@/components/ThemeLangControls';
import Image from 'next/image';
import { DollarSign } from 'lucide-react';

export default function ProviderClient({ settlements }) {
    const { dict } = useLanguage();

    const totalRevenue = settlements.reduce((sum, s) => sum + s.netAmount, 0);

    // Mock listings
    const myListings = [
        { id: '1', title: 'Cozy Studio near Science Faculty', status: 'Active', views: 124, leads: 8, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80' },
        { id: '2', title: 'Shared Room in Luxury Dorm', status: 'Pending', views: 45, leads: 2, image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&q=80' },
    ];

    // Mock leads
    const leads = [
        { id: 'l1', name: 'Ahmed Khalil', phone: '01012345678', property: 'Cozy Studio', time: '2h ago', status: 'New' },
        { id: 'l2', name: 'Sara Mohamed', phone: '01198765432', property: 'Cozy Studio', time: '5h ago', status: 'Contacted' },
        { id: 'l3', name: 'Youssef Ali', phone: '01234543210', property: 'Shared Room', time: 'Yesterday', status: 'Viewing Set' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy transition-colors pb-24">

            {/* Provider Top Header */}
            <header className="bg-white dark:bg-unizy-dark px-6 py-6 shadow-sm border-b border-gray-100 dark:border-white/5 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 text-lg">
                        H
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">Housing Hub</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Verified Provider
                        </p>
                    </div>
                </div>
                <ThemeLangControls />
            </header>

            <main className="px-6 py-8 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8">

                {/* Left Column: Quick Actions & Stats */}
                <div className="lg:col-span-1 flex flex-col gap-6 animate-fade-in-up">
                    <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-[2rem] shadow-xl shadow-indigo-500/20 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group">
                        <span className="text-3xl group-hover:rotate-12 transition-transform">➕</span>
                        <span className="font-black text-sm uppercase tracking-wider">List New Property</span>
                    </button>

                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-3xl">
                            <DollarSign className="w-8 h-8 text-indigo-500 mb-1" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Earnings</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">EGP {totalRevenue}</p>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-3xl">
                            <span className="text-2xl mb-1">📱</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Leads</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">45</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6">Recent Leads</h3>
                        <div className="space-y-6">
                            {leads.map(lead => (
                                <div key={lead.id} className="flex justify-between items-start border-b border-gray-50 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{lead.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Property: {lead.property}</p>
                                        <p className="text-[10px] text-indigo-500 font-bold mt-1 uppercase tracking-tighter">{lead.status}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg text-xs">💬</button>
                                        <button className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg text-xs">📞</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Listings Manager */}
                <div className="lg:col-span-2 flex flex-col gap-6 animate-fade-in delay-200">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">My Properties</h2>
                        <button className="text-indigo-600 font-bold text-sm hover:underline">View All</button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {myListings.map(listing => (
                            <div key={listing.id} className="group bg-white dark:bg-unizy-dark rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-300">
                                <div className="relative h-40 w-full overflow-hidden">
                                    <img src={listing.image} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${listing.status === 'Active' ? 'bg-green-500/90 text-white' : 'bg-orange-500/90 text-white'}`}>
                                        {listing.status}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-black text-gray-900 dark:text-white leading-tight mb-4">{listing.title}</h3>
                                    <div className="grid grid-cols-2 gap-4 border-t border-gray-50 dark:border-white/5 pt-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Views</p>
                                            <p className="font-black text-gray-900 dark:text-white">{listing.views}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Leads</p>
                                            <p className="font-black text-gray-900 dark:text-white">{listing.leads}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-6">
                                        <button className="py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 font-bold text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 transition-colors">Edit</button>
                                        <button className="py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 font-bold text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors">Insights</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
