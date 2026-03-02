"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Circle, Clock, Receipt, MapPin, Building, Package, User, CreditCard, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getTransactionDetails } from '@/app/actions/transactions';
import { getPaymentByTransaction } from '@/app/actions/payments';

export default function TransactionDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [transaction, setTransaction] = useState(null);
    const [payment, setPayment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            if (params.id) {
                const res = await getTransactionDetails(params.id);
                if (res.success) {
                    setTransaction(res.transaction);

                    // fetch payment
                    const paymentRes = await getPaymentByTransaction(res.transaction.id);
                    if (paymentRes.payment) {
                        setPayment(paymentRes.payment);
                    }
                }
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Transaction not found or you don't have access.</p>
                <button onClick={() => router.back()} className="text-brand-600 font-bold hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10';
            case 'CONFIRMED': return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10';
            case 'IN_PROGRESS': return 'text-purple-500 bg-purple-50 dark:bg-purple-500/10';
            case 'COMPLETED': return 'text-green-500 bg-green-50 dark:bg-green-500/10';
            case 'CANCELLED': return 'text-red-500 bg-red-50 dark:bg-red-500/10';
            default: return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10';
        }
    };

    // Helper to render specific details based on transaction type
    const renderSpecificDetails = () => {
        if (transaction.type === 'SERVICE' && transaction.serviceBooking) {
            const sb = transaction.serviceBooking;
            return (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{sb.provider?.name || 'Unknown Provider'}</span>
                        <span className="text-xs text-gray-400">({sb.provider?.category})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Scheduled: <strong className="text-gray-900 dark:text-white">{sb.date} at {sb.timeSlot}</strong></span>
                    </div>
                    {sb.notes && (
                        <div className="text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-gray-500 italic">
                            "{sb.notes}"
                        </div>
                    )}
                </div>
            );
        }

        if (transaction.type === 'CLEANING' && transaction.cleaningBooking) {
            const cb = transaction.cleaningBooking;
            return (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span>Package: <strong className="text-gray-900 dark:text-white">{cb.package?.name}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>Scheduled: <strong className="text-gray-900 dark:text-white">{cb.date} at {cb.timeSlot}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{cb.address}</span>
                    </div>
                </div>
            );
        }

        if (transaction.type === 'MEALS' && transaction.meal) {
            return (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span>Kitchen: <strong className="text-gray-900 dark:text-white">{transaction.meal.merchant?.name}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Receipt className="w-4 h-4 text-gray-400" />
                        <span>Order details: {transaction.notes || '1x Item'}</span>
                    </div>
                </div>
            )
        }

        return null;
    };

    return (
        <div className="max-w-2xl mx-auto pb-24 space-y-6">
            {/* Header / Nav */}
            <div className="flex items-center mb-6 text-gray-500">
                <Link href="/activity" className="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center pr-4 border-r border-gray-200 dark:border-gray-800">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="pl-4">
                    <h1 className="text-xs font-bold uppercase tracking-wider text-gray-400">Transaction ID</h1>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{transaction.txnCode}</p>
                </div>
            </div>

            {/* Main Info Card */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${getStatusColor(transaction.status).split(' ')[0].replace('text-', 'bg-')}`} />

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase mb-3 ${getStatusColor(transaction.status)}`}>
                            {transaction.status.replace('_', ' ')}
                        </span>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                            {transaction.type}
                        </h2>
                        <p className="text-gray-500 mt-1">
                            {new Date(transaction.createdAt).toLocaleString('en-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                        <p className="text-3xl font-black text-brand-600">
                            {transaction.amount > 0 ? `${transaction.amount} ${transaction.currency}` : '--'}
                        </p>
                    </div>
                </div>

                {renderSpecificDetails()}
            </div>

            {/* Payment / Receipt Section */}
            {payment && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pl-1 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        Payment Details
                    </h3>
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Status</p>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase
                                    ${payment.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        payment.status === 'FAILED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}
                                >
                                    {payment.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                                    {payment.status === 'FAILED' && <XCircle className="w-3 h-3" />}
                                    {payment.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                    {payment.status}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">Method</p>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    {payment.method === 'COD' ? 'Cash on Delivery' : payment.method}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-1">Amount</p>
                                <p className="font-bold text-gray-900 dark:text-white">
                                    {payment.amount} {payment.currency}
                                </p>
                            </div>
                        </div>

                        {payment.paidAt && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500">
                                Paid on: {new Date(payment.paidAt).toLocaleString('en-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                        )}
                        {payment.failedReason && (
                            <div className="mt-4 pt-4 border-t border-red-100 dark:border-gray-800 text-sm text-red-600 dark:text-red-400">
                                Issue: {payment.failedReason}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Timeline View */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 pl-1">Status Timeline</h3>
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-8 pl-6">
                        {transaction.history?.length > 0 ? (
                            transaction.history.map((event, idx) => {
                                const isLatest = idx === 0;
                                return (
                                    <div key={event.id} className="relative">
                                        <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 border-white dark:border-[#1E293B] flex items-center justify-center
                                            ${isLatest ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}`
                                        }>
                                            {isLatest ? <CheckCircle2 className="w-4 h-4 text-white absolute" /> : <Circle className="w-2 h-2 text-white absolute" />}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${isLatest ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                                Status changed to {event.newStatus}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(event.createdAt).toLocaleString('en-EG', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                            {event.reason && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                                                    "{event.reason}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-sm text-gray-500">No history available.</p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
