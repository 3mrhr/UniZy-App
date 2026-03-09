'use client';

import React from 'react';
import Link from 'next/link';
import { Home, Car, Utensils, Truck, Sparkles, Wrench, Ticket, ArrowRight, TrendingUp } from 'lucide-react';

const MODULES = [
    { id: 'housing', label: 'Housing', icon: Home, color: 'blue', description: 'Student Accommodation & Residencies' },
    { id: 'transport', label: 'Transport', icon: Car, color: 'emerald', description: 'UniRide & Campus Shuttle' },
    { id: 'meals', label: 'Meals', icon: Utensils, color: 'orange', description: 'Merchant Marketplace & Dining' },
    { id: 'delivery', label: 'Delivery', icon: Truck, color: 'purple', description: 'Package & Item Logistics' },
    { id: 'cleaning', label: 'Cleaning', icon: Sparkles, color: 'cyan', description: 'Dorm & Apartment Maintenance' },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'amber', description: 'Technical Support & Repair' },
    { id: 'deals', label: 'Discounts', icon: Ticket, color: 'rose', description: 'Redemptions & Partner Vouchers' },
];

export default function FinanceModulesOverview() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white italic">Module Intelligence</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Siloed financial performance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MODULES.map((m) => (
                    <Link
                        key={m.id}
                        href={`/admin/finance/modules/${m.id}`}
                        className="group bg-white dark:bg-[#1E293B] p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:border-brand-500/30 transition-all shadow-sm flex flex-col justify-between"
                    >
                        <div>
                            <div className={`w-12 h-12 rounded-2xl bg-${m.color}-500/10 flex items-center justify-center text-${m.color}-600 mb-4 group-hover:scale-110 transition-transform`}>
                                <m.icon className="w-6 h-6" />
                            </div>
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{m.label}</h3>
                            <p className="text-[10px] text-gray-400 font-bold leading-relaxed mt-1">{m.description}</p>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                <TrendingUp className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Link>
                ))}

                {/* System Stats / Summary Card */}
                <div className="bg-gradient-to-br from-brand-600 to-indigo-600 p-8 rounded-[2.5rem] text-white flex flex-col justify-center relative overflow-hidden shadow-xl shadow-brand-500/20">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp size={120} />
                    </div>
                    <h3 className="text-xl font-black italic mb-2">Omni-Channel Flow</h3>
                    <p className="text-white/70 text-xs font-medium leading-relaxed mb-6">Real-time aggregation across all campus utility sectors.</p>
                    <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 w-max px-4 py-2 rounded-xl backdrop-blur-md">
                        7/7 Sectors Online
                    </div>
                </div>
            </div>
        </div>
    );
}
