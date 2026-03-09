"use client";

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateRefundStatus } from '@/app/actions/refunds';
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function RefundsClient({ initialRefunds, totalPages, currentPage, currentStatus }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleFilter = (e) => {
        const val = e.target.value;
        router.push(`?page=1${val ? '&status=' + val : ''}`);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        if (!confirm(`Are you sure you want to mark this refund as ${newStatus}?`)) return;

        startTransition(async () => {
            const res = await updateRefundStatus(id, newStatus);
            if (res.success) {
                toast.success('Refund updated successfully');
                router.refresh();
            } else {
                toast.error(res.error || 'Failed to update status.');
            }
        });
    };

    return (
        <div className="bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            {/* Filter */}
            <div className="flex gap-4 mb-6">
                <select
                    value={currentStatus}
                    onChange={handleFilter}
                    disabled={isPending}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
                >
                    <option value="">All Statuses</option>
                    <option value="REQUESTED">Requested</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PROCESSED">Processed</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <th className="pb-3 px-4">Txn Code</th>
                            <th className="pb-3 px-4">User</th>
                            <th className="pb-3 px-4">Type & Amount</th>
                            <th className="pb-3 px-4 w-1/4">Reason</th>
                            <th className="pb-3 px-4">Status</th>
                            <th className="pb-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {!initialRefunds || initialRefunds.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-gray-500">
                                    No refund requests found.
                                </td>
                            </tr>
                        ) : (
                            initialRefunds.map((refund) => (
                                <tr key={refund.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                    <td className="py-3 px-4 font-mono text-xs text-brand-600 dark:text-brand-400">
                                        {refund.transaction?.txnCode || "N/A"}
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-gray-900 dark:text-gray-200">
                                            {refund.requestedBy?.name || 'Unknown'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {refund.requestedBy?.email}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="font-bold text-gray-900 dark:text-gray-100">
                                            {refund.amount} {refund.currency}
                                        </p>
                                        <span className="text-xs text-gray-500 uppercase tracking-widest">{refund.type}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-gray-600 dark:text-gray-400 text-xs italic line-clamp-2">
                                            "{refund.reason}"
                                        </p>
                                    </td>
                                    <td className="py-3 px-4">
                                        {refund.status === 'REQUESTED' && (
                                            <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-1 rounded-md text-xs font-medium">
                                                <Clock className="w-3 h-3" /> Requested
                                            </span>
                                        )}
                                        {refund.status === 'APPROVED' && (
                                            <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-md text-xs font-medium">
                                                <CheckCircle2 className="w-3 h-3" /> Approved
                                            </span>
                                        )}
                                        {refund.status === 'PROCESSED' && (
                                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded-md text-xs font-medium">
                                                <RefreshCw className="w-3 h-3" /> Processed
                                            </span>
                                        )}
                                        {refund.status === 'REJECTED' && (
                                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-md text-xs font-medium">
                                                <XCircle className="w-3 h-3" /> Rejected
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {refund.status === 'REQUESTED' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    disabled={isPending}
                                                    onClick={() => handleStatusUpdate(refund.id, 'APPROVED')}
                                                    className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg text-xs font-medium transition disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    disabled={isPending}
                                                    onClick={() => handleStatusUpdate(refund.id, 'REJECTED')}
                                                    className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-xs font-medium transition disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {refund.status === 'APPROVED' && (
                                            <button
                                                disabled={isPending}
                                                onClick={() => handleStatusUpdate(refund.id, 'PROCESSED')}
                                                className="px-3 py-1 w-full text-center bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg text-xs font-medium transition disabled:opacity-50"
                                            >
                                                Mark Processed
                                            </button>
                                        )}
                                        {(refund.status === 'PROCESSED' || refund.status === 'REJECTED') && (
                                            <span className="text-xs text-gray-400">Locked</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        {currentPage > 1 && (
                            <button onClick={() => router.push(`?page=${currentPage - 1}${currentStatus ? '&status=' + currentStatus : ''}`)} className="px-3 py-1 border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Prev</button>
                        )}
                        {currentPage < totalPages && (
                            <button onClick={() => router.push(`?page=${currentPage + 1}${currentStatus ? '&status=' + currentStatus : ''}`)} className="px-3 py-1 border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Next</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
