'use client';


import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Wrench, Star, Phone, MapPin, Users } from 'lucide-react';
import { getAdminProviders, approveProvider, rejectProvider } from '@/app/actions/services';

export default function AdminServicesPage() {
    const [providers, setProviders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await getAdminProviders();
                if (res.providers) {
                    setProviders(res.providers);
                    setStats(res.stats || { total: 0, verified: 0, pending: 0 });
                }
            } catch (e) {
                console.error(e);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        const prev = [...providers];
        setProviders(prev.map(p => p.id === id ? { ...p, verified: true } : p));
        try {
            const res = await approveProvider(id);
            if (!res.success) {
                setProviders(prev);
                alert(res.error || 'Failed to approve');
            } else {
                setStats(s => ({ ...s, verified: s.verified + 1, pending: Math.max(0, s.pending - 1) }));
            }
        } catch { setProviders(prev); }
    };

    const handleReject = async (id) => {
        if (!confirm('Are you sure you want to reject and delete this provider?')) return;
        const prev = [...providers];
        setProviders(prev.filter(p => p.id !== id));
        try {
            const res = await rejectProvider(id);
            if (!res.success) {
                setProviders(prev);
                alert(res.error || 'Failed to reject');
            } else {
                setStats(s => ({ ...s, total: Math.max(0, s.total - 1), pending: Math.max(0, s.pending - 1) }));
            }
        } catch { setProviders(prev); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Sub-page Navigation */}
            <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/admin/services/pricing" className="px-4 py-2 bg-white dark:bg-unizy-dark rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-all border border-gray-100 dark:border-white/5">Pricing</Link>
                <Link href="/admin/services/commissions" className="px-4 py-2 bg-white dark:bg-unizy-dark rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-all border border-gray-100 dark:border-white/5">Commissions</Link>
            </div>

            <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Service <span className="text-brand-600">Providers</span></h1>
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Manage home service registrations</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Providers', value: stats.total, icon: Wrench, color: 'brand' },
                    { label: 'Verified', value: stats.verified, icon: CheckCircle, color: 'green' },
                    { label: 'Pending', value: stats.pending, icon: Shield, color: 'orange' },
                ].map(s => (
                    <div key={s.label} className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                        <s.icon className={`w-5 h-5 mx-auto mb-2 text-${s.color}-500`} />
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Provider List */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Wrench className="text-brand-500" size={20} />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">All Providers</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500 font-bold">Loading providers...</div>
                    ) : providers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-bold">No providers found.</div>
                    ) : providers.map(p => (
                        <div key={p.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-gray-900 dark:text-white">{p.name}</h4>
                                        <span className="text-[10px] font-black bg-gray-100 dark:bg-gray-800 text-gray-600 px-2 py-0.5 rounded-lg uppercase">{p.category}</span>
                                        {p.verified ? (
                                            <span className="text-[10px] font-black bg-green-100 dark:bg-green-900/20 text-green-600 px-2 py-0.5 rounded-lg uppercase">Verified</span>
                                        ) : (
                                            <span className="text-[10px] font-black bg-orange-100 dark:bg-orange-900/20 text-orange-600 px-2 py-0.5 rounded-lg uppercase">Pending</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{p.description || 'No description provided.'}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-bold flex-wrap">
                                        <span className="flex items-center gap-1"><Phone size={10} /> {p.phone}</span>
                                        <span className="flex items-center gap-1"><MapPin size={10} /> {p.location || 'Assiut'}</span>
                                        <span className="flex items-center gap-1"><Star size={10} className="text-amber-500" /> {p.rating?.toFixed(1) || '0.0'} ({p.reviewCount || 0})</span>
                                        <span className="flex items-center gap-1"><Users size={10} /> {p._count?.bookings || 0} bookings</span>
                                    </div>
                                </div>
                                {!p.verified && (
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={() => handleApprove(p.id)} className="p-2.5 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl hover:bg-green-200 transition-all" title="Approve">
                                            <CheckCircle size={16} />
                                        </button>
                                        <button onClick={() => handleReject(p.id)} className="p-2.5 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-200 transition-all" title="Reject">
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
