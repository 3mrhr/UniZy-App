"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { processPayout } from '@/app/actions/finance';
import { Clock, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PayoutsClient({ initialSettlements, totalPages, currentPage }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handlePayout = async (settlementId) => {
        const method = prompt('Enter payout method (e.g. BANK_TRANSFER, WALLET, CASH):', 'BANK_TRANSFER');
        if (!method) return;

        const reference = prompt('Enter reference number (optional):');

        startTransition(async () => {
            const res = await processPayout(settlementId, method.toUpperCase(), reference);
            if (res.success) {
                toast.success('Payout processed successfully!');
                router.refresh();
            } else {
                toast.error(res.error || 'Failed to process payout.');
            }
        });
    };

    return (
        <div className="bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <th className="pb-3 px-4">Period</th>
                            <th className="pb-3 px-4">Provider</th>
                            <th className="pb-3 px-4">Net Payout Amount</th>
                            <th className="pb-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {!initialSettlements || initialSettlements.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-gray-500">
                                    No pending settlements require payout.
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
                                        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">
                                            {s.provider?.role}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {s.netAmount} {s.currency}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            disabled={isPending}
                                            onClick={() => handlePayout(s.id)}
                                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 inline-flex items-center gap-2"
                                        >
                                            <CreditCard className="w-4 h-4" /> Process Payout
                                        </button>
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
                            <button onClick={() => router.push(`?page=${currentPage - 1}`)} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Prev</button>
                        )}
                        {currentPage < totalPages && (
                            <button onClick={() => router.push(`?page=${currentPage + 1}`)} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Next</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
