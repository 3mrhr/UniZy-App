'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, User, Wrench, ArrowLeft, Phone } from 'lucide-react';
import Link from 'next/link';
import { getAdminServiceBookings, updateServiceBookingStatus } from '@/app/actions/services';
import { toast } from 'react-hot-toast';

const STATUS_COLORS = {
    PENDING: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
    CONFIRMED: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
    IN_PROGRESS: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
    COMPLETED: 'bg-green-100 dark:bg-green-900/20 text-green-600',
    CANCELLED: 'bg-red-100 dark:bg-red-900/20 text-red-600',
};

export default function AdminServiceBookingsPage() {
    const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, completedBookings: 0, activeProviders: 0 });
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await getAdminServiceBookings();
                if (res.stats) setStats(res.stats);
                if (res.recentBookings) setBookings(res.recentBookings);
            } catch (error) {
                console.error(error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleConfirm = async (id) => {
        const prev = [...bookings];
        setBookings(prev.map(b => b.id === id ? { ...b, status: 'CONFIRMED' } : b));
        try {
            const res = await updateServiceBookingStatus(id, 'CONFIRMED');
            if (!res.success) {
                setBookings(prev);
                toast.error(res.error || 'Failed to confirm booking');
            } else {
                toast.success('Booking confirmed');
                setStats(s => ({ ...s, pendingBookings: Math.max(0, s.pendingBookings - 1) }));
            }
        } catch { setBookings(prev); }
    };

    const handleComplete = async (id) => {
        const prev = [...bookings];
        setBookings(prev.map(b => b.id === id ? { ...b, status: 'COMPLETED' } : b));
        try {
            const res = await updateServiceBookingStatus(id, 'COMPLETED');
            if (!res.success) {
                setBookings(prev);
                toast.error(res.error || 'Failed to complete booking');
            } else {
                toast.success('Booking completed');
                setStats(s => ({ ...s, completedBookings: s.completedBookings + 1 }));
            }
        } catch { setBookings(prev); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Link href="/admin/services" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-brand-500 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Providers
            </Link>

            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Home Service <span className="text-brand-600">Bookings</span></h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Manage repair & maintenance requests</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'brand' },
                    { label: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'orange' },
                    { label: 'Completed', value: stats.completedBookings, icon: CheckCircle, color: 'green' },
                    { label: 'Active Pros', value: stats.activeProviders, icon: Wrench, color: 'purple' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 text-center shadow-sm">
                        <s.icon className={`w-5 h-5 mx-auto mb-2 text-${s.color}-500`} />
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Bookings List */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Calendar className="text-brand-500" size={20} />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Active Booking Requests</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500 font-bold">Loading bookings...</div>
                    ) : bookings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-bold">No active service bookings found.</div>
                    ) : bookings.map(b => (
                        <div key={b.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h4 className="font-black text-gray-900 dark:text-white">{b.provider?.name || 'Unknown Provider'}</h4>
                                        <span className="text-[10px] font-black bg-gray-100 dark:bg-gray-800 text-gray-600 px-2 py-0.5 rounded-lg uppercase">{b.provider?.category || 'SERVICE'}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${STATUS_COLORS[b.status] || STATUS_COLORS.PENDING}`}>{b.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 font-bold mt-1 flex-wrap">
                                        <span className="flex items-center gap-1"><User size={12} className="text-brand-500" /> Client: {b.user?.name || 'Unknown User'} ({b.user?.phone || 'No Phone'})</span>
                                        <span className="flex items-center gap-1"><Phone size={12} className="text-blue-500" /> Pro: {b.provider?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 font-bold mt-2">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> Date: {b.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> Time: {b.timeSlot}</span>
                                    </div>
                                    {b.notes && (
                                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg italic">
                                            "{b.notes}"
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 sm:flex-col items-end shrink-0 mt-4 sm:mt-0">
                                    {b.status === 'PENDING' && (
                                        <button onClick={() => handleConfirm(b.id)} className="w-full sm:w-auto px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-200 transition-all">
                                            Confirm Booking
                                        </button>
                                    )}
                                    {b.status === 'CONFIRMED' && (
                                        <button onClick={() => handleComplete(b.id)} className="w-full sm:w-auto px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl text-xs font-bold hover:bg-green-200 transition-all">
                                            Mark Completed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
