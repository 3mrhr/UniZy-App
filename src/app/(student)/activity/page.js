"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Clock, Package, ShoppingBag, Utensils, Home as HomeIcon, CheckCircle2, XCircle, ChevronRight, Tags } from 'lucide-react';
import Link from 'next/link';
import { getUserTransactions } from '@/app/actions/transactions';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function ActivityPage() {
    const { dict } = useLanguage();
    const t = dict?.activity || {};
    const c = dict?.common || {};
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('ALL');

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const res = await getUserTransactions({ type: filterCategory });
                if (res.success) {
                    setTransactions(res.transactions || []);
                } else {
                    setTransactions([]);
                }
            } catch (e) {
                console.error('Failed to fetch activity:', e);
                setTransactions([]);
            }
            setIsLoading(false);
        };
        fetchHistory();
    }, [filterCategory]);

    const getIconForType = (type) => {
        switch (type) {
            case 'SERVICE': return <Package className="w-5 h-5 text-indigo-500" />;
            case 'CLEANING': return <Package className="w-5 h-5 text-cyan-500" />;
            case 'DEALS': return <Tags className="w-5 h-5 text-pink-500" />;
            case 'MEALS': return <Utensils className="w-5 h-5 text-orange-500" />;
            case 'HOUSING': return <HomeIcon className="w-5 h-5 text-blue-500" />;
            case 'TRANSPORT': return <Clock className="w-5 h-5 text-green-500" />;
            case 'DELIVERY': return <ShoppingBag className="w-5 h-5 text-yellow-500" />;
            default: return <Activity className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30">Pending</span>;
            case 'CONFIRMED': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/30">Confirmed</span>;
            case 'IN_PROGRESS': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-600 dark:bg-purple-900/30">In Progress</span>;
            case 'COMPLETED': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-50 text-green-600 dark:bg-green-900/30">Completed</span>;
            case 'CANCELLED': return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-50 text-red-600 dark:bg-red-900/30">Cancelled</span>;
            default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600 dark:bg-gray-800">{status}</span>;
        }
    };

    const getTitleForTransaction = (txn) => {
        if (txn.type === 'SERVICE' && txn.serviceBooking?.provider) return `Service: ${txn.serviceBooking.provider.category.replace('_', ' ')}`;
        if (txn.type === 'CLEANING' && txn.cleaningBooking?.package) return `Cleaning: ${txn.cleaningBooking.package.name}`;
        if (txn.type === 'DEALS' && txn.deal) return `Deal Redeemed: ${txn.deal.title}`;
        if (txn.type === 'MEALS' && txn.meal) return `Meal Order: ${txn.meal.name}`;
        if (txn.type === 'DELIVERY' && txn.order) {
            try {
                const details = JSON.parse(txn.order.details || '{}');
                return `Delivery from ${details.vendor || 'Restaurant'}`;
            } catch { return 'Delivery Order'; }
        }
        if (txn.type === 'HOUSING' && txn.housing) return `Housing: ${txn.housing.title}`;
        return `Transaction ${txn.txnCode}`;
    };

    const getSubtitleForTransaction = (txn) => {
        if (txn.type === 'SERVICE' && txn.serviceBooking) return `${txn.serviceBooking.date} at ${txn.serviceBooking.timeSlot}`;
        if (txn.type === 'CLEANING' && txn.cleaningBooking) return `${txn.cleaningBooking.date} at ${txn.cleaningBooking.timeSlot}`;
        if (txn.type === 'DEALS' && txn.deal) return `From ${txn.deal.merchant.name}`;
        if (txn.type === 'MEALS' && txn.meal) return `From ${txn.meal.merchant.name}`;
        if (txn.type === 'DELIVERY' && txn.order) {
            const items = txn.order.orderItems?.map(i => `${i.nameSnapshot} x${i.qty}`).join(', ');
            return items || 'Delivery Items';
        }
        return new Date(txn.createdAt).toLocaleDateString('en-EG');
    };

    const filterOptions = [
        { id: 'ALL', label: t.title || 'All Activity' },
        { id: 'SERVICE', label: dict?.services?.title || 'Services' },
        { id: 'CLEANING', label: dict?.services?.cleaning || 'Cleaning' },
        { id: 'MEALS', label: dict?.meals?.title || 'Meals' },
        { id: 'DEALS', label: dict?.deals?.title || 'Deals' },
        { id: 'HOUSING', label: dict?.housing?.title || 'Housing' },
        { id: 'TRANSPORT', label: dict?.transport?.title || 'Transport' },
        { id: 'DELIVERY', label: dict?.delivery?.title || 'Delivery' },
    ];

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-8 h-8 text-brand-600" />
                    {t.title || 'My Activity'}
                </h1>
                <p className="text-gray-500 mt-1">{t.noOrdersDesc || 'Track all your bookings, orders, and service statuses in one place.'}</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide gap-2">
                {filterOptions.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => setFilterCategory(opt.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterCategory === opt.id
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                            : 'bg-white dark:bg-[#1E293B] text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500 font-bold bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800">
                        {c.loading || 'Loading your activity history...'}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col items-center">
                        <Activity className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t.noOrders || 'No activity found'}</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                            You haven't made any {filterCategory !== 'ALL' ? filterCategory.toLowerCase() : ''} bookings or orders yet.
                        </p>
                        {(() => {
                            let ctaLink = "/hub";
                            let ctaText = "Browse the Hub";
                            if (filterCategory === 'TRANSPORT') { ctaLink = "/transport"; ctaText = "Book a Ride"; }
                            else if (filterCategory === 'MEALS' || filterCategory === 'DELIVERY') { ctaLink = "/meals"; ctaText = "Order Food"; }
                            else if (filterCategory === 'HOUSING') { ctaLink = "/housing"; ctaText = "Find a Home"; }
                            else if (filterCategory === 'SERVICE' || filterCategory === 'CLEANING') { ctaLink = "/services"; ctaText = "Book a Service"; }

                            return (
                                <Link href={ctaLink} className="px-8 py-3 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95">
                                    {ctaText}
                                </Link>
                            );
                        })()}
                    </div>
                ) : (
                    transactions.map((txn) => {
                        // For DELIVERY, the link goes to the live tracking page
                        const linkHref = txn.type === 'DELIVERY' && txn.orderId ? `/activity/tracking/${txn.orderId}` : `/activity/${txn.id}`;
                        return (
                            <Link
                                href={linkHref}
                                key={txn.id}
                                className="block bg-white dark:bg-[#1E293B] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-brand-500 dark:hover:border-brand-500 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                        {getIconForType(txn.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                {getTitleForTransaction(txn)}
                                            </h3>
                                            {getStatusBadge(txn.order ? txn.order.status : txn.status)}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500 truncate">
                                                {getSubtitleForTransaction(txn)}
                                            </p>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white flex items-center">
                                                {txn.amount > 0 ? `${txn.amount} ${txn.currency}` : 'Quote Request'}
                                                {['DELIVERY', 'TRANSPORT', 'CLEANING'].includes(txn.type) && (txn.order?.status !== 'COMPLETED' && txn.status !== 'COMPLETED') && (
                                                    <ChevronRight className="w-4 h-4 ml-1 text-gray-300 group-hover:text-brand-500 transition-colors" />
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
