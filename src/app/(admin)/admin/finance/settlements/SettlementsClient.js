"use client";

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, RefreshCw } from 'lucide-react';

export default function SettlementsClient({ initialSettlements, totalPages, currentPage, currentStatus }) {
    const router = useRouter();

    const handleFilter = (e) => {
        const val = e.target.value;
        router.push(`?page=1${val ? '&status=' + val : ''}`);
    };

    return (
        <div className="bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex gap-4 mb-6">
                <select
                    value={currentStatus}
                    onChange={handleFilter}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending Payout</option>
                    <option value="PAID">Paid</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <th className="pb-3 px-4">Period</th>
                            <th className="pb-3 px-4">Provider</th>
                            <th className="pb-3 px-4">Gross/Comm</th>
                            <th className="pb-3 px-4">Net Payout</th>
                            <th className="pb-3 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {!initialSettlements || initialSettlements.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-8 text-center text-gray-500">
                                    No settlements found.
                                </td>
                            </tr>
                        ) : (
                            initialSettlements.map((s) => (
                                <tr key={s.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-gray-900 dark:text-gray-200">
                                            {new Date(s.periodStart).toLocaleDateString()} - {new Date(s.periodEnd).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-gray-900 dark:text-gray-200">
                                            {s.provider?.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {s.provider?.email}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {s.grossAmount} EGP
                                        </p>
                                        <span className="text-xs text-red-500">-{s.commissionAmount} EGP (Comm)</span>
                                    </td>
                                    <td className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400">
                                        {s.netAmount} {s.currency}
                                    </td>
                                    <td className="py-3 px-4">
                                        {s.status === 'PENDING' && (
                                            <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md text-xs font-medium">
                                                <Clock className="w-3 h-3" /> Pending Payout
                                            </span>
                                        )}
                                        {s.status === 'PAID' && (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md text-xs font-medium">
                                                <CheckCircle2 className="w-3 h-3" /> Paid
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        {currentPage > 1 && (
                            <button onClick={() => router.push(`?page=${currentPage - 1}${currentStatus ? '&status=' + currentStatus : ''}`)} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Prev</button>
                        )}
                        {currentPage < totalPages && (
                            <button onClick={() => router.push(`?page=${currentPage + 1}${currentStatus ? '&status=' + currentStatus : ''}`)} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Next</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
