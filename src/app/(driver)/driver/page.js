'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import ThemeLangControls from '@/components/ThemeLangControls';

export default function DriverDashboard() {
    const { dict } = useLanguage();
    const t = dict?.driver || {};
    const [isOnline, setIsOnline] = useState(false);
    const [activeJob, setActiveJob] = useState(null);

    // Mock earnings data
    const stats = [
        { label: "Today's Earnings", value: "EGP 340", icon: "💰" },
        { label: "Rides Today", value: "8", icon: "🚗" },
        { label: "Rating", value: "4.9", icon: "⭐" },
    ];

    const toggleOnline = () => {
        setIsOnline(!isOnline);
        if (!isOnline) {
            // Simulate receiving a job after 3 seconds of being online
            setTimeout(() => {
                setActiveJob({
                    id: '101',
                    type: 'Ride Request',
                    customer: 'Sara A.',
                    pickup: 'Engineering Faculty',
                    dropoff: 'Al Zahraa District',
                    fare: 'EGP 42',
                    distance: '2.4 km'
                });
            }, 3000);
        } else {
            setActiveJob(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-unizy-navy transition-colors pb-24">

            {/* Driver Top Header */}
            <header className="bg-white dark:bg-unizy-dark px-6 py-6 shadow-sm border-b border-gray-100 dark:border-white/5 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
                        D
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">Driver Hub</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {isOnline ? '● Online & Searching' : '○ Offline'}
                        </p>
                    </div>
                </div>
                <ThemeLangControls />
            </header>

            <main className="px-6 py-8 max-w-lg mx-auto w-full flex flex-col gap-6">

                {/* Status Toggle Card */}
                <div className={`p-8 rounded-[2.5rem] shadow-xl transition-all duration-500 flex flex-col items-center gap-6 border-4 ${isOnline ? 'bg-brand-600 border-brand-400/30' : 'bg-white dark:bg-unizy-dark border-transparent shadow-gray-200/50 dark:shadow-none'}`}>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-transform duration-700 ${isOnline ? 'bg-white scale-110 rotate-[360deg]' : 'bg-gray-100 dark:bg-unizy-navy/50'}`}>
                        {isOnline ? '🚖' : '💤'}
                    </div>
                    <div className="text-center">
                        <h2 className={`text-2xl font-black mb-2 transition-colors ${isOnline ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {isOnline ? 'You are Online' : 'You are Offline'}
                        </h2>
                        <p className={`text-sm font-medium ${isOnline ? 'text-brand-100' : 'text-gray-400'}`}>
                            {isOnline ? 'Ready to accept new requests' : 'Tap to start earning today'}
                        </p>
                    </div>
                    <button
                        onClick={toggleOnline}
                        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isOnline ? 'bg-white text-brand-600 hover:bg-gray-100' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20'}`}
                    >
                        {isOnline ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-unizy-dark p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
                            <span className="text-xl mb-2">{stat.icon}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">{stat.label}</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Job Request Popup (Mock) */}
                {activeJob && (
                    <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 shadow-2xl border-2 border-brand-500 animate-bounce-slow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="flex justify-between items-start mb-6 relative">
                            <div>
                                <span className="bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                                    {activeJob.type}
                                </span>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none">{activeJob.customer}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-brand-600 dark:text-brand-400">{activeJob.fare}</p>
                                <p className="text-[10px] font-bold text-gray-400">{activeJob.distance}</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 relative">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate tracking-tight">{activeJob.pickup}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate tracking-tight">{activeJob.dropoff}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative">
                            <button
                                onClick={() => setActiveJob(null)}
                                className="py-4 rounded-xl font-bold text-sm bg-gray-100 dark:bg-unizy-navy/50 text-gray-500 hover:bg-gray-200 dark:hover:bg-unizy-navy transition-colors"
                            >
                                Decline
                            </button>
                            <button className="py-4 rounded-xl font-bold text-sm bg-brand-600 text-white hover:bg-brand-700 shadow-xl shadow-brand-500/20 active:scale-95 transition-all">
                                Accept
                            </button>
                        </div>
                    </div>
                )}

                {/* Recent Activity List */}
                {!activeJob && (
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
                        <div className="space-y-6">
                            {[1, 2, 3].map(item => (
                                <div key={item} className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-unizy-navy/50 flex items-center justify-center text-lg">
                                            🏁
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Drop-off Complete</p>
                                            <p className="text-[10px] text-gray-400">Faculty of Arts • 2h ago</p>
                                        </div>
                                    </div>
                                    <p className="font-black text-gray-900 dark:text-white text-sm">+EGP 35</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
