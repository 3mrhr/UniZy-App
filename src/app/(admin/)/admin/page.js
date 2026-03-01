'use client';

import { useState } from 'react';

export default function AdminDashboard() {
    const stats = [
        { label: "Total Users", value: "8,249", change: "+124", isPositive: true },
        { label: "Active Housing Leads", value: "342", change: "+18", isPositive: true },
        { label: "Orders Today", value: "1,204", change: "-42", isPositive: false },
        { label: "Revenue (Today)", value: "EGP 42,500", change: "+EGP 3,200", isPositive: true },
    ];

    // Global settings state (Mock for MVP)
    const [settings, setSettings] = useState({
        transportBaseFare: '15',
        transportCommission: '10',
        deliveryPlatformFee: '5',
        housingListingFee: '150',
        housingCommission: '5',
        systemStatus: 'active' // active, maintenance
    });

    const handleSaveSettings = () => {
        // In Phase 6, this will call a Server Action to update the DB
        alert('Global settings saved successfully!');
    };

    return (
        <div className="flex flex-col gap-8 pb-12">

            {/* Page Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Superadmin Control Center</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Global overview and platform configuration.</p>
                </div>
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    System Online
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6 animate-fade-in-up">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-unizy-dark p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col gap-2 relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                        {/* Decorative background glow */}
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-50 dark:bg-brand-900/20 rounded-full blur-2xl group-hover:bg-brand-100 dark:group-hover:bg-brand-800/30 transition-colors"></div>

                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest relative z-10">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">{stat.value}</h3>

                        <div className={`inline-flex items-center gap-1 text-xs font-bold mt-1 relative z-10 ${stat.isPositive ? 'text-green-500' : 'text-rose-500'}`}>
                            {stat.isPositive ? '↑' : '↓'} {stat.change} today
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-8 mb-8">
                {/* Global Configuration Panel */}
                <div className="col-span-3 lg:col-span-2 bg-white dark:bg-unizy-dark rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 p-8 flex flex-col animate-fade-in delay-200">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-50 dark:border-white/5 pb-4">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="text-brand-500">⚙️</span> Global Pricing & Fees
                        </h2>
                        <button
                            onClick={handleSaveSettings}
                            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/30 active:scale-95 transition-all"
                        >
                            Save Changes
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Transport Module Settings */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-brand-500 uppercase tracking-widest bg-brand-50 dark:bg-brand-900/20 py-2 px-4 rounded-lg inline-block">Transport Module</h3>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Base Fare (EGP)</label>
                                <input
                                    type="number"
                                    value={settings.transportBaseFare}
                                    onChange={(e) => setSettings({ ...settings, transportBaseFare: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Minimum price charged before distance calculation.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Platform Commission (%)</label>
                                <input
                                    type="number"
                                    value={settings.transportCommission}
                                    onChange={(e) => setSettings({ ...settings, transportCommission: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Housing & Delivery Settings */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 py-2 px-4 rounded-lg inline-block">Housing & Delivery</h3>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Housing Listing Fee (EGP)</label>
                                <input
                                    type="number"
                                    value={settings.housingListingFee}
                                    onChange={(e) => setSettings({ ...settings, housingListingFee: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">One-time fee charged to landlords per approved listing.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Delivery Platform Fee (EGP)</label>
                                <input
                                    type="number"
                                    value={settings.deliveryPlatformFee}
                                    onChange={(e) => setSettings({ ...settings, deliveryPlatformFee: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-orange-500 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Fixed fee added to every food delivery order.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Panel: System Control */}
                <div className="col-span-3 lg:col-span-1 flex flex-col gap-6 animate-fade-in delay-300">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-unizy-dark dark:to-unizy-navy p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Platform Status</h3>

                        <div className="space-y-4 relative z-10">
                            <label className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all ${settings.systemStatus === 'active' ? 'border-brand-500 bg-brand-500/20' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-700'}`}>
                                <div>
                                    <p className="font-bold">Active / Normal</p>
                                    <p className="text-[10px] text-slate-400 mt-1">All modules operating normally.</p>
                                </div>
                                <input
                                    type="radio"
                                    name="status"
                                    checked={settings.systemStatus === 'active'}
                                    onChange={() => setSettings({ ...settings, systemStatus: 'active' })}
                                    className="w-5 h-5 text-brand-500"
                                />
                            </label>

                            <label className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all ${settings.systemStatus === 'maintenance' ? 'border-rose-500 bg-rose-500/20' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-700'}`}>
                                <div>
                                    <p className="font-bold text-rose-400">Maintenance Mode</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Blocks new logins and orders.</p>
                                </div>
                                <input
                                    type="radio"
                                    name="status"
                                    checked={settings.systemStatus === 'maintenance'}
                                    onChange={() => setSettings({ ...settings, systemStatus: 'maintenance' })}
                                    className="w-5 h-5 text-rose-500"
                                />
                            </label>
                        </div>
                    </div>

                    <button className="bg-white dark:bg-unizy-dark p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm hover:border-brand-300 dark:hover:border-brand-500/50 transition-colors flex items-center justify-center gap-3">
                        <span className="text-xl">👥</span> Manage Module Admins
                    </button>
                </div>

            </div>

        </div>
    );
}
