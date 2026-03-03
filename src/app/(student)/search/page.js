'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, X, SlidersHorizontal, Home, ShoppingBag, UtensilsCrossed, Tag, ArrowUpDown, ChevronDown } from 'lucide-react';
import { globalSearch } from '@/app/actions/search';

const CATEGORIES = [
    { key: 'all', label: 'All', icon: Search },
    { key: 'housing', label: 'Housing', icon: Home },
    { key: 'deal', label: 'Deals', icon: Tag },
    { key: 'meal', label: 'Meals', icon: UtensilsCrossed },
];

const TYPE_COLORS = {
    housing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-500' },
    deal: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500' },
    meal: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-500' },
};

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [category, setCategory] = useState('all');
    const [sortBy, setSortBy] = useState('relevance');
    const [showFilters, setShowFilters] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const performSearch = useCallback(async () => {
        if (!query.trim() || query.trim().length < 2) return;
        setIsLoading(true);
        setHasSearched(true);
        try {
            const data = await globalSearch(query, { category, minPrice, maxPrice, sortBy });
            setResults(data.results || []);
            setTotal(data.total || 0);
        } catch {
            setResults([]);
        }
        setIsLoading(false);
    }, [query, category, minPrice, maxPrice, sortBy]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length >= 2) {
                performSearch();
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [query, category, sortBy, performSearch]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-24">
            {/* Fixed Search Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5">
                <div className="max-w-3xl mx-auto px-4 pt-6 pb-4">
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); performSearch(); } }}
                            placeholder="Search housing, deals, meals..."
                            autoFocus
                            className="w-full pl-14 pr-24 py-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-unizy-navy outline-none transition-all text-gray-900 dark:text-white font-bold text-lg"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                            {query && (
                                <button onClick={() => { setQuery(''); setResults([]); setHasSearched(false); }} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all">
                                    <X size={18} />
                                </button>
                            )}
                            <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl transition-all ${showFilters ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400'}`}>
                                <SlidersHorizontal size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-none">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = category === cat.key;
                            return (
                                <button
                                    key={cat.key}
                                    onClick={() => setCategory(cat.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                >
                                    <Icon size={16} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Expanded Filters */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl border border-gray-100 dark:border-white/5 animate-fade-in">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Min Price</label>
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-unizy-dark border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Max Price</label>
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        placeholder="10000"
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-unizy-dark border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-unizy-dark border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-brand-500 appearance-none cursor-pointer"
                                    >
                                        <option value="relevance">Relevance</option>
                                        <option value="price_low">Price: Low → High</option>
                                        <option value="price_high">Price: High → Low</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={performSearch}
                                className="mt-3 w-full bg-brand-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-brand-700 transition-all"
                            >
                                Apply Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Area */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                {/* Results Count */}
                {hasSearched && !isLoading && (
                    <p className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-4">
                        {total > 0 ? `${total} result${total > 1 ? 's' : ''} found` : 'No results found'}
                    </p>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white dark:bg-unizy-dark rounded-2xl p-4 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-gray-200 dark:bg-white/10 rounded-xl shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-100 dark:bg-white/5 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Results Grid */}
                {!isLoading && results.length > 0 && (
                    <div className="space-y-3">
                        {results.map((item) => {
                            const colors = TYPE_COLORS[item.type] || TYPE_COLORS.deal;
                            return (
                                <Link
                                    key={`${item.type}-${item.id}`}
                                    href={item.url}
                                    className="block bg-white dark:bg-unizy-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 hover:border-brand-200 dark:hover:border-brand-900/30 hover:shadow-lg transition-all group"
                                >
                                    <div className="flex gap-4">
                                        {/* Image / Placeholder */}
                                        <div className={`w-20 h-20 rounded-xl shrink-0 flex items-center justify-center overflow-hidden ${colors.bg}`}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className={`text-2xl font-black ${colors.text}`}>
                                                    {item.type === 'housing' ? '🏠' : item.type === 'deal' ? '🏷️' : '🍽️'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-black text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors truncate">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                                                        {item.subtitle}
                                                    </p>
                                                </div>
                                                <span className={`${colors.badge} text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shrink-0`}>
                                                    {item.type}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-baseline gap-1">
                                                    {item.originalPrice && item.originalPrice > (item.price || 0) && (
                                                        <span className="text-xs text-gray-400 line-through font-bold">
                                                            {item.originalPrice} {item.currency}
                                                        </span>
                                                    )}
                                                    {item.price && (
                                                        <span className="font-black text-brand-600">
                                                            {item.price} <span className="text-xs font-bold text-gray-400">{item.currency}{item.type === 'housing' ? '/mo' : ''}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                {item.provider && (
                                                    <span className="text-xs font-bold text-gray-400 truncate max-w-[120px]">
                                                        by {item.provider}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && hasSearched && results.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full mx-auto flex items-center justify-center mb-6">
                            <Search className="text-gray-300 dark:text-gray-600" size={40} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">No results found</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">
                            Try a different search term or adjust your filters
                        </p>
                    </div>
                )}

                {/* Initial State */}
                {!hasSearched && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-brand-50 dark:bg-brand-900/10 rounded-3xl mx-auto flex items-center justify-center mb-8">
                            <Search className="text-brand-400" size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Discover UniZy</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto mb-8">
                            Search across housing, local deals, and meals — all in one place
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {['Apartment near campus', 'Pizza deals', 'Budget meals', 'Shared room', 'Gym offers'].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => setQuery(term)}
                                    className="px-4 py-2 rounded-xl bg-white dark:bg-unizy-dark border border-gray-100 dark:border-white/5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:border-brand-300 hover:text-brand-600 transition-all"
                                >
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
