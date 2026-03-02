"use client";

import React, { useState } from 'react';
import { Percent, ShieldAlert, Home, Truck, ShoppingBag, Utensils, Tag, Settings } from 'lucide-react';
import CommissionManager from './CommissionManager';

export default function GlobalCommissionsDashboard() {
    const [activeTab, setActiveTab] = useState('HOUSING');

    const tabs = [
        { id: 'HOUSING', label: 'Housing', icon: Home, color: 'bg-emerald-600' },
        { id: 'TRANSPORT', label: 'Transport', icon: ShoppingBag, color: 'bg-blue-600' },
        { id: 'DELIVERY', label: 'Delivery', icon: Truck, color: 'bg-orange-600' },
        { id: 'DEALS', label: 'Deals', icon: Tag, color: 'bg-pink-600' },
        { id: 'MEALS', label: 'Meals', icon: Utensils, color: 'bg-red-600' },
        { id: 'SERVICES', label: 'Home Services', icon: Settings, color: 'bg-indigo-600' },
        { id: 'CLEANING', label: 'Cleaning', icon: Settings, color: 'bg-cyan-600' },
    ];

    const activeTabData = tabs.find(t => t.id === activeTab);

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Percent className="w-8 h-8 text-brand-600" />
                        Global Commission Core
                    </h1>
                    <p className="text-gray-500 mt-1">Super Admin dashboard controlling the revenue splits between UniZy and third-party providers (Drivers, Merchants, Landlords).</p>
                </div>

                <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl text-purple-700 dark:text-purple-400 font-bold border border-purple-100 dark:border-purple-800/50">
                    <ShieldAlert className="w-5 h-5" />
                    <span className="text-sm">Global Write Access</span>
                </div>
            </div>

            {/* Module Tabs Navigation */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-2 flex flex-wrap gap-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 font-bold text-sm rounded-lg transition-all ${isActive
                                    ? `${tab.color} text-white shadow-md`
                                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Active Module Commission Manager */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CommissionManager
                    moduleName={activeTab}
                    title={`${activeTabData.label} Revenue Split Rules`}
                    description={`Review and edit the chronological timeline of commission rules governing the ${activeTabData.label.toLowerCase()} provider payouts.`}
                    colorClass={activeTabData.color}
                />
            </div>
        </div>
    );
}
