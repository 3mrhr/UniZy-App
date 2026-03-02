"use client";

import React, { useState, useTransition } from 'react';
import { createRefundRequest } from '@/app/actions/refunds';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

export default function SupportRefundsClient({ eligibleTransactions, previousRefunds }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selectedTxn, setSelectedTxn] = useState(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundType, setRefundType] = useState('FULL');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedTxn) return setError('Please select a transaction to refund.');
        if (!reason.trim()) return setError('Please provide a reason for the refund.');
        if (refundType === 'PARTIAL' && !refundAmount) return setError('Please specify the partial refund amount.');

        const maxAmount = eligibleTransactions.find(t => t.id === selectedTxn)?.amount || 0;
        const amountToRefund = refundType === 'FULL' ? maxAmount : parseFloat(refundAmount);

        if (amountToRefund > maxAmount) return setError(`Amount cannot exceed the original transaction value of ${maxAmount} EGP.`);
        if (amountToRefund <= 0) return setError('Amount must be greater than zero.');

        startTransition(async () => {
            const res = await createRefundRequest({
                transactionId: selectedTxn,
                amount: amountToRefund,
                type: refundType,
                reason
            });

            if (res.error) {
                setError(res.error);
            } else {
                setSuccess('Refund request submitted successfully! Our support team will review it shortly.');
                setSelectedTxn(null);
                setReason('');
                setRefundAmount('');
                setRefundType('FULL');
                router.refresh();
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Request Form */}
            <div className="bg-white dark:bg-unizy-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Submit New Request</h2>

                {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl mb-4 text-sm">{error}</div>}
                {success && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-4 text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Transaction</label>
                        <select
                            required
                            disabled={isPending}
                            value={selectedTxn || ''}
                            onChange={(e) => {
                                setSelectedTxn(e.target.value);
                                if (e.target.value) {
                                    const txn = eligibleTransactions.find(t => t.id === e.target.value);
                                    if (refundType === 'FULL' && txn) setRefundAmount(txn.amount);
                                }
                            }}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="">-- Choose a recent paid transaction --</option>
                            {eligibleTransactions.map(txn => (
                                <option key={txn.id} value={txn.id}>
                                    {txn.txnCode} • {txn.type} ({txn.amount} EGP) - {new Date(txn.createdAt).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                        {eligibleTransactions.length === 0 && (
                            <p className="text-xs text-gray-400 mt-1">You have no eligible paid transactions that can be refunded.</p>
                        )}
                    </div>

                    {selectedTxn && (
                        <>
                            <div className="flex gap-4">
                                <label className="flex-1 flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="FULL"
                                        checked={refundType === 'FULL'}
                                        onChange={(e) => {
                                            setRefundType('FULL');
                                            setRefundAmount(eligibleTransactions.find(t => t.id === selectedTxn)?.amount || '');
                                        }}
                                        className="text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Full Refund</span>
                                </label>
                                <label className="flex-1 flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="PARTIAL"
                                        checked={refundType === 'PARTIAL'}
                                        onChange={(e) => {
                                            setRefundType('PARTIAL');
                                            setRefundAmount('');
                                        }}
                                        className="text-brand-600 focus:ring-brand-500"
                                    />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">Partial Refund</span>
                                </label>
                            </div>

                            {refundType === 'PARTIAL' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount to Refund (EGP)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        step="0.01"
                                        disabled={isPending}
                                        value={refundAmount}
                                        onChange={(e) => setRefundAmount(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        placeholder={`e.g. 50.00 (Max: ${eligibleTransactions.find(t => t.id === selectedTxn)?.amount})`}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
                                <textarea
                                    required
                                    disabled={isPending}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px]"
                                    placeholder="Please explain why you are requesting a refund..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isPending || !selectedTxn}
                                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition disabled:opacity-50"
                            >
                                {isPending ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </>
                    )}
                </form>
            </div>

            {/* Previous Requests */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pl-1">Your Request History</h2>
                <div className="bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="pb-3 px-6 pt-4">Date</th>
                                    <th className="pb-3 px-6 pt-4">Transaction</th>
                                    <th className="pb-3 px-6 pt-4">Amount</th>
                                    <th className="pb-3 px-6 pt-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {previousRefunds.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">
                                            No past refund requests.
                                        </td>
                                    </tr>
                                ) : (
                                    previousRefunds.map((ref) => (
                                        <tr key={ref.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                            <td className="py-4 px-6 text-gray-500">
                                                {new Date(ref.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs text-brand-600 dark:text-brand-400">
                                                {ref.transaction?.txnCode || "N/A"}
                                            </td>
                                            <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-100">
                                                {ref.amount} {ref.currency} <span className="text-xs text-gray-400 ml-1">({ref.type})</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {ref.status === 'REQUESTED' && (
                                                    <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md text-xs font-medium">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </span>
                                                )}
                                                {ref.status === 'APPROVED' && (
                                                    <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md text-xs font-medium">
                                                        <CheckCircle2 className="w-3 h-3" /> Approved
                                                    </span>
                                                )}
                                                {ref.status === 'PROCESSED' && (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md text-xs font-medium">
                                                        <RefreshCw className="w-3 h-3" /> Processed
                                                    </span>
                                                )}
                                                {ref.status === 'REJECTED' && (
                                                    <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md text-xs font-medium">
                                                        <XCircle className="w-3 h-3" /> Rejected
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
