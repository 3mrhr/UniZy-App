'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from '@/i18n/LanguageProvider';

export default function TransportPage() {
    const { dict } = useLanguage();
    const t = dict?.landing?.transport || "Transport";
    const homeDict = dict?.home || {};

    const [pickup, setPickup] = useState('My Current Location');
    const [destination, setDestination] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('standard');

    const vehicles = [
        { id: 'standard', name: 'Standard', price: 'EGP 45', time: '3 min', icon: '🚗' },
        { id: 'premium', name: 'Premium', price: 'EGP 75', time: '5 min', icon: '✨' },
        { id: 'scooter', name: 'Scooter', price: 'EGP 25', time: '2 min', icon: '🛵' },
        { id: 'bus', name: 'Shuttle Bus', price: 'EGP 10', time: '12 min', icon: '🚌' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-unizy-navy transition-colors duration-300 pb-20 sm:pb-0">

            {/* Header */}
            <header className="px-6 py-8 max-w-7xl mx-auto w-full flex items-center gap-4">
                <Link href="/students" className="w-10 h-10 rounded-full bg-white dark:bg-unizy-dark flex items-center justify-center shadow-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <span className="text-lg">←</span>
                </Link>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{homeDict.transport || "Transport"}</h1>
            </header>

            <main className="flex-1 px-6 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8 pb-24">

                {/* Left Panel: Booking Form */}
                <div className="lg:col-span-1 flex flex-col gap-6 animate-fade-in-up">
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5">
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute top-1/2 -mt-2 left-4 w-4 h-4 rounded-full border-2 border-brand-500 bg-white dark:bg-unizy-navy"></div>
                                <div className="absolute top-1/2 mt-6 left-[1.125rem] w-[2px] h-10 bg-gray-200 dark:bg-white/10"></div>
                                <input
                                    type="text"
                                    value={pickup}
                                    onChange={(e) => setPickup(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-unizy-navy/50 border-none rounded-2xl pl-12 p-4 text-sm font-medium focus:ring-2 focus:ring-brand-500 transition-all outline-none text-gray-900 dark:text-white"
                                    placeholder="Pickup point"
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute top-1/2 -mt-2 left-4 w-4 h-4 bg-orange-500 rounded-sm"></div>
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-unizy-navy/50 border-none rounded-2xl pl-12 p-4 text-sm font-medium focus:ring-2 focus:ring-brand-500 transition-all outline-none text-gray-900 dark:text-white"
                                    placeholder="Where to?"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 overflow-hidden">
                        <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Select Vehicle</h3>
                        <div className="space-y-3">
                            {vehicles.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVehicle(v.id)}
                                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 ${selectedVehicle === v.id ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10' : 'border-transparent bg-gray-50 dark:bg-unizy-navy/30 hover:bg-gray-100 dark:hover:bg-unizy-navy/50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{v.icon}</span>
                                        <div className="text-left">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{v.name}</h4>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{v.time} away</p>
                                        </div>
                                    </div>
                                    <span className="font-black text-brand-600 dark:text-brand-400">{v.price}</span>
                                </button>
                            ))}
                        </div>

                        <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-5 rounded-[1.5rem] mt-6 shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95">
                            Book {vehicles.find(v => v.id === selectedVehicle)?.name}
                        </button>
                    </div>
                </div>

                {/* Right Panel: Map Mockup */}
                <div className="lg:col-span-2 relative min-h-[400px] lg:min-h-full bg-gray-200 dark:bg-unizy-dark/30 rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 group animate-fade-in delay-200">
                    {/* Mock Map Background */}
                    <div className="absolute inset-0 saturate-50 opacity-50 dark:opacity-20 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center"></div>

                    {/* Map UI Elements */}
                    <div className="absolute top-8 right-8 flex flex-col gap-2">
                        <button className="w-12 h-12 rounded-2xl bg-white dark:bg-unizy-dark shadow-xl flex items-center justify-center text-xl font-bold dark:text-white">+</button>
                        <button className="w-12 h-12 rounded-2xl bg-white dark:bg-unizy-dark shadow-xl flex items-center justify-center text-xl font-bold dark:text-white">−</button>
                    </div>

                    {/* Floating Live Indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-unizy-dark px-6 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 border border-gray-100 dark:border-white/5 animate-bounce-slow">
                        <div className="w-3 h-3 rounded-full bg-brand-500 animate-pulse"></div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Searching for nearby drivers...</p>
                    </div>
                </div>

            </main>
        </div>
    );
}
