'use client';

import React from 'react';
import Link from 'next/link';
import {
    Utensils,
    Home,
    Wallet,
    Car,
    AlertCircle,
    Settings,
    ArrowUpRight
} from 'lucide-react';

import {
    Utensils,
    Home,
    Wallet,
    Car,
    AlertCircle,
    ArrowUpRight,
    Users,
    Zap
} from 'lucide-react';

const services = [
    {
        id: 'dining',
        title: 'Meals & Delivery',
        description: 'Order from campus favorites.',
        icon: Utensils,
        href: '/marketplace',
        color: 'from-orange-500 to-red-500',
        size: 'md:col-span-2 md:row-span-2 col-span-2 row-span-1',
    },
    {
        id: 'housing',
        title: 'Housing',
        description: 'Find your next home.',
        icon: Home,
        href: '/housing',
        color: 'from-blue-500 to-indigo-600',
        size: 'col-span-1 row-span-1',
    },
    {
        id: 'roommates',
        title: 'Roommates',
        description: 'Find the perfect match.',
        icon: Users,
        href: '/hub/roommate',
        color: 'from-pink-500 to-rose-600',
        size: 'col-span-1 row-span-1',
    },
    {
        id: 'transport',
        title: 'Transport',
        description: 'Ride and Commute.',
        icon: Car,
        href: '/transport',
        color: 'from-emerald-500 to-teal-600',
        size: 'col-span-1 row-span-1',
    },
    {
        id: 'rewards',
        title: 'Rewards',
        description: 'UniZy Coins.',
        icon: Zap,
        href: '/rewards',
        color: 'from-amber-400 to-orange-500',
        size: 'col-span-1 row-span-1',
    },
];

export default function ServiceBentoGrid() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-1 mb-10 auto-rows-[120px]">
            {services.map((service) => (
                <Link
                    key={service.id}
                    href={service.href}
                    className={`${service.size} group relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5`}
                >
                    {/* Background Layer */}
                    <div className={`absolute inset-0 opacity-[0.08] dark:opacity-[0.12] bg-gradient-to-br ${service.color} group-hover:opacity-20 transition-opacity duration-500`} />
                    <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between z-10">
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-2xl text-white bg-gradient-to-br ${service.color} shadow-lg shadow-black/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                <service.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="p-2 rounded-full bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                                <ArrowUpRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </div>
                        </div>

                        <div className="mt-auto">
                            <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
                                {service.title}
                            </h3>
                            <p className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-1 opacity-80">
                                {service.description}
                            </p>
                        </div>
                    </div>

                    {/* Decorative Gradient Glow */}
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-br ${service.color}`} />
                </Link>
            ))}

            {/* SOS Special Card */}
            <Link
                href="/support/sos"
                className="col-span-2 md:col-span-4 h-16 bg-red-500/10 dark:bg-red-500/5 backdrop-blur-md rounded-[2rem] flex items-center justify-between px-8 border border-red-500/20 group hover:bg-red-500 transition-all duration-500"
            >
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-500 group-hover:text-white transition-colors animate-pulse" />
                    <span className="font-black text-red-600 dark:text-red-400 group-hover:text-white transition-colors uppercase tracking-widest text-xs sm:text-sm">Emergency Assistance (SOS)</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-red-500 group-hover:text-white transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
        </div>
    );
}
