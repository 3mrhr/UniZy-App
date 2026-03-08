'use client';

import React from 'react';
import { Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function HousingFilters({ activeType, onTypeChange, dict }) {
    const h = dict?.housing || {};

    const types = [
        { key: 'All', label: h?.filters?.all || 'All' },
        { key: 'Studio', label: h?.filters?.studio || 'Studio' },
        { key: 'Shared', label: h?.filters?.shared || 'Shared' },
        { key: 'Apartment', label: h?.filters?.apartment || 'Apartment' },
        { key: 'Female Only', label: h?.filters?.femaleOnly || 'Female Only' },
        { key: 'Male Only', label: h?.filters?.maleOnly || 'Male Only' }
    ];

    return (
        <div className="flex flex-col gap-6 mb-12">
            {/* Search and Primary Filters Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* Search Bar - Large Bento Tile */}
                <div className="lg:col-span-8 group">
                    <div className="relative h-16 bg-white/40 dark:bg-unizy-dark/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl flex items-center px-6 shadow-glass hover:shadow-glass-intense transition-all duration-300 group-hover:bg-white/60 dark:group-hover:bg-unizy-dark/60">
                        <Search className="w-6 h-6 text-brand-500 mr-4 group-focus-within:scale-110 transition-transform duration-300" />
                        <input
                            type="text"
                            placeholder={h.searchPlaceholder || "Search for your next home..."}
                            className="bg-transparent border-none outline-none w-full text-lg font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>
                </div>

                {/* Quick Stats/Filter Info - Small Bento Tile */}
                <div className="lg:col-span-4 flex gap-4">
                    <div className="flex-1 bg-brand-500/10 dark:bg-brand-500/5 backdrop-blur-md border border-brand-500/20 rounded-3xl flex flex-col justify-center px-6 py-4 shadow-glass transition-all hover:scale-[1.02]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-1">LIVE HOUSING</span>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">124+</span>
                        </div>
                    </div>
                    <button className="h-16 w-16 bg-white/40 dark:bg-unizy-dark/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl flex items-center justify-center shadow-glass hover:shadow-brand-500/20 hover:scale-110 transition-all duration-300 group">
                        <SlidersHorizontal className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-brand-500" />
                    </button>
                </div>
            </div>

            {/* Type Horizontal Scroll */}
            <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                {types.map((type) => (
                    <button
                        key={type.key}
                        onClick={() => onTypeChange(type.key)}
                        className={`whitespace-nowrap px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-500 border ${activeType === type.key
                                ? "bg-brand-600 text-white border-brand-500 shadow-glass-intense scale-105"
                                : "bg-white/30 dark:bg-unizy-dark/30 backdrop-blur-md text-gray-500 dark:text-gray-400 border-white/40 dark:border-white/10 hover:bg-white/50 dark:hover:bg-unizy-dark/50"
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
