"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { assignDriver, updateDispatchStatus } from '@/app/actions/dispatch';
import { Car, Package, Bike, AlertTriangle, Edit3 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DispatchClient({ initialDispatches, totalPages, currentPage, currentModule, currentStatus }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleFilter = (param, value) => {
        const p = new URLSearchParams(window.location.search);
        p.set('page', '1');
        if (value) p.set(param, value);
        else p.delete(param);
        router.push(`?${p.toString()}`);
    };

    const handleAssignDriver = async (dispatchId) => {
        const driverId = prompt('Enter the new Driver ID to assign (must be role DRIVER):');
        if (!driverId) return;

        startTransition(async () => {
            const res = await assignDriver(dispatchId, driverId);
            if (res.success) {
                toast.success('Driver assigned successfully!');
            } else {
                toast.error(res.error || 'Failed to assign driver.');
            }
        });
    };

    const handleUpdateStatus = async (dispatchId) => {
        const newStatus = prompt('Enter new status (PENDING, ASSIGNED, ACCEPTED, PICKED_UP, COMPLETED, CANCELLED, FAILED):');
        if (!newStatus) return;

        let reason = null;
        if (newStatus === 'FAILED' || newStatus === 'CANCELLED') {
            reason = prompt('Enter reason for failure/cancellation:');
        }

        startTransition(async () => {
            const res = await updateDispatchStatus(dispatchId, newStatus.toUpperCase(), reason);
            if (res.success) {
                toast.success('Status updated.');
            } else {
                toast.error(res.error || 'Failed to update status.');
            }
        });
    };

    const tabs = [
        { id: '', label: 'All Dispatches', icon: Package },
        { id: 'TRANSPORT', label: 'Transport', icon: Car },
        { id: 'FOOD', label: 'Food Delivery', icon: Bike },
        { id: 'SERVICES', label: 'Freelance & Services', icon: AlertTriangle }
    ];

    return (
        <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map(tab => {
                    const active = currentModule === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleFilter('module', tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors whitespace-nowrap ${active
                                ? 'bg-brand-600 text-white shadow-md'
                                : 'bg-white dark:bg-unizy-dark text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex gap-4 mb-6">
                    <select
                        value={currentStatus}
                        onChange={(e) => handleFilter('status', e.target.value)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending (No Driver)</option>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="ACCEPTED">Accepted by Driver</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled/Failed</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                                <th className="pb-3 px-4">Dispatch ID</th>
                                <th className="pb-3 px-4">Order Info</th>
                                <th className="pb-3 px-4">Driver</th>
                                <th className="pb-3 px-4">Status & ETA</th>
                                <th className="pb-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {!initialDispatches || initialDispatches.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                        No tracking data available for filters.
                                    </td>
                                </tr>
                            ) : (
                                initialDispatches.map((d) => (
                                    <tr key={d.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                        <td className="py-3 px-4">
                                            <p className="font-mono text-xs text-gray-500">#{d.id.substring(0, 8)}</p>
                                            <p className="text-[10px] font-bold text-brand-600 mt-1">{d.order?.module}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-900 dark:text-gray-200">
                                                Order #{d.orderId.substring(0, 8)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {d.order?.user?.name}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4">
                                            {d.driver ? (
                                                <>
                                                    <p className="font-medium text-gray-900 dark:text-gray-200">
                                                        {d.driver.name}
                                                    </p>
                                                    {d.isOverride && (
                                                        <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded font-bold">OVERRIDE</span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-gray-400 italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-gray-800 dark:text-gray-200">{d.status}</p>
                                            {d.delayReason && (
                                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                                    <AlertTriangle className="w-3 h-3" /> {d.delayReason}
                                                </p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    disabled={isPending}
                                                    onClick={() => handleUpdateStatus(d.id)}
                                                    className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 rounded-lg transition"
                                                    title="Update Status"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    disabled={isPending}
                                                    onClick={() => handleAssignDriver(d.id)}
                                                    className="px-3 py-1 bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-100 rounded-lg text-xs font-bold transition disabled:opacity-50"
                                                >
                                                    Assign Driver
                                                </button>
                                            </div>
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
                                <button onClick={() => {
                                    const p = new URLSearchParams(window.location.search);
                                    p.set('page', currentPage - 1);
                                    router.push(`?${p.toString()}`);
                                }} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Prev</button>
                            )}
                            {currentPage < totalPages && (
                                <button onClick={() => {
                                    const p = new URLSearchParams(window.location.search);
                                    p.set('page', currentPage + 1);
                                    router.push(`?${p.toString()}`);
                                }} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Next</button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
