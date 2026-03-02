"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, ArrowRight, Activity, X } from 'lucide-react';
import { getAdminTransactions } from '@/app/actions/transactions';

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTxns = async () => {
            setIsLoading(true);
            const res = await getAdminTransactions({ type: filterType, status: filterStatus });
            if (res.success) {
                setTransactions(res.transactions);
            }
            setIsLoading(false);
        };
        fetchTxns();
    }, [filterType, filterStatus]);

    const filteredTransactions = transactions.filter(t =>
        t.txnCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
            case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'IN_PROGRESS': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-200';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getOriginText = (txn) => {
        if (txn.type === 'SERVICE') return 'Home Services';
        if (txn.type === 'CLEANING') return 'Cleaning Services';
        if (txn.type === 'DEALS') return `Deal: ${txn.deal?.title}`;
        if (txn.type === 'MEALS') return `Meal: ${txn.meal?.name}`;
        if (txn.type === 'HOUSING') return 'Housing Listing Request';
        return txn.type;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8 text-brand-600" />
                        Global Transactions Center
                    </h1>
                    <p className="text-gray-500 mt-1">Monitor all bookings, deal redemptions, and service orders across the platform.</p>
                </div>
            </div>

            {/* Quick Stats / Filters */}
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 items-center justify-between shadow-sm">

                {/* Search */}
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by TXN, Name, or Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 sm:flex-none">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer w-full"
                        >
                            <option value="ALL">All Types</option>
                            <option value="SERVICE">Services</option>
                            <option value="CLEANING">Cleaning</option>
                            <option value="MEALS">Meals</option>
                            <option value="DEALS">Deals</option>
                            <option value="HOUSING">Housing</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 sm:flex-none">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer w-full"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Transaction Code</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Type / Origin</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 bg-gray-50/50 dark:bg-gray-800/20">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-4"></div>
                                            <p className="font-bold">Loading system transactions...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 bg-gray-50/50 dark:bg-gray-800/20">
                                        <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                        <p className="font-bold text-gray-900 dark:text-white">No transactions found</p>
                                        <p className="text-sm">Try adjusting your filters or search term.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                {txn.txnCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{txn.user?.name || 'Unknown'}</span>
                                                <span className="text-xs text-gray-500">{txn.user?.email || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black tracking-wider uppercase text-gray-400">{txn.type}</span>
                                                <span className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={getOriginText(txn)}>
                                                    {getOriginText(txn)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-brand-600">
                                                {txn.amount > 0 ? `${txn.amount} ${txn.currency}` : '--'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusBadge(txn.status)}`}>
                                                {txn.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                            {new Date(txn.createdAt).toLocaleDateString('en-EG', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
