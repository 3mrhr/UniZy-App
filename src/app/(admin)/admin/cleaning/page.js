'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, CheckCircle, Clock, User, Package, AlertTriangle } from 'lucide-react';
import { getAdminCleaningStats, updateCleaningBookingStatus } from '@/app/actions/cleaning';

const STATUS_COLORS = {
    PENDING: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
    CONFIRMED: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
    IN_PROGRESS: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
    COMPLETED: 'bg-green-100 dark:bg-green-900/20 text-green-600',
    CANCELLED: 'bg-red-100 dark:bg-red-900/20 text-red-600',
};

export default function AdminCleaningPage() {
    const [stats, setStats] = useState({ totalBookings: 0, pendingBookings: 0, completedBookings: 0, activePackages: 0 });
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await getAdminCleaningStats();
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
            const res = await updateCleaningBookingStatus(id, 'CONFIRMED');
            if (!res.success) {
                setBookings(prev);
                alert(res.error || 'Failed to confirm booking');
            } else {
                setStats(s => ({ ...s, pendingBookings: Math.max(0, s.pendingBookings - 1) }));
            }
        } catch { setBookings(prev); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Cleaning <span className="text-emerald-600">Services</span></h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Manage bookings & cleaners</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar, color: 'brand' },
                    { label: 'Pending', value: stats.pendingBookings, icon: Clock, color: 'orange' },
                    { label: 'Completed', value: stats.completedBookings, icon: CheckCircle, color: 'green' },
                    { label: 'Packages', value: stats.activePackages, icon: Package, color: 'purple' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                        <s.icon className={`w-5 h-5 mx-auto mb-2 text-${s.color}-500`} />
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Sparkles className="text-emerald-500" size={20} />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Recent Bookings</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500 font-bold">Loading bookings...</div>
                    ) : bookings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-bold">No recent bookings found.</div>
                    ) : bookings.map(b => (
                        <div key={b.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-gray-900 dark:text-white">{b.package.name}</h4>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${STATUS_COLORS[b.status] || STATUS_COLORS.PENDING}`}>{b.status}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 font-bold mt-1">
                                        <span className="flex items-center gap-1"><User size={10} /> {b.user.name}</span>
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {b.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={10} /> {b.timeSlot}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">📍 {b.address}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-lg font-black text-emerald-600">{b.package.price} EGP</p>
                                    {b.status === 'PENDING' && (
                                        <button onClick={() => handleConfirm(b.id)} className="mt-2 px-4 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl text-xs font-bold hover:bg-green-200 transition-all">
                                            Confirm
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
