'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ShieldAlert,
    Filter,
    Search,
    Clock,
    CheckCircle2,
    AlertTriangle,
    User,
    ChevronRight,
    RefreshCw,
    XCircle,
    Eye
} from 'lucide-react';
import { getReports } from '@/app/actions/trust';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('PENDING');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchReports = async () => {
        setLoading(true);
        const res = await getReports({ status: filterStatus });
        if (res.success) {
            setReports(res.reports);
        } else {
            toast.error(res.error || 'Failed to fetch reports');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReports();
    }, [filterStatus]);

    const filteredReports = reports.filter(r =>
        r.targetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reporter?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
            case 'INVESTIGATING': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
            case 'RESOLVED': return 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
            case 'DISMISSED': return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
            default: return 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800 dark:border-gray-700';
        }
    };

    const getTypeEmoji = (type) => {
        switch (type) {
            case 'HOUSING': return '🏠';
            case 'MERCHANT': return '🏪';
            case 'DRIVER': return '🚗';
            case 'HUB_POST': return '📝';
            case 'USER': return '👤';
            default: return '🚩';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert className="text-red-500 w-6 h-6" />
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Trust & Safety</h1>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Manage user reports and moderate platform activity</p>
                    </div>
                    <button
                        onClick={fetchReports}
                        className="p-3 bg-white dark:bg-unizy-dark rounded-2xl border border-gray-200 dark:border-white/10 text-gray-500 hover:text-brand-600 transition-colors shadow-sm"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500">
                                <Clock size={16} />
                            </div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Pending</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{reports.filter(r => r.status === 'PENDING').length}</p>
                    </div>
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-500">
                                <Search size={16} />
                            </div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Active</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{reports.filter(r => r.status === 'INVESTIGATING').length}</p>
                    </div>
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center text-green-500">
                                <CheckCircle2 size={16} />
                            </div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Resolved</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{reports.filter(r => r.status === 'RESOLVED').length}</p>
                    </div>
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-500">
                                <XCircle size={16} />
                            </div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Dismissed</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{reports.filter(r => r.status === 'DISMISSED').length}</p>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search reports by ID, reason, or reporter..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white dark:bg-unizy-dark border-2 border-transparent focus:border-brand-500 rounded-2xl py-3.5 pl-12 pr-6 outline-none shadow-sm transition-all text-sm font-medium"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === status
                                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                                        : 'bg-white dark:bg-unizy-dark text-gray-500 border border-gray-200 dark:border-white/10'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reports Queue */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-20 text-center">
                            <RefreshCw className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold">Refreshing report queue...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="py-20 text-center bg-white dark:bg-unizy-dark rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Queue is Clear</h3>
                            <p className="text-gray-500 text-sm">No {filterStatus.toLowerCase()} reports to review right now.</p>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <Link
                                href={`/admin/reports/${report.id}`}
                                key={report.id}
                                className="block bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-brand-200 dark:hover:border-brand-900/40 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                                            {getTypeEmoji(report.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(report.status)}`}>
                                                    {report.status}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                    #{report.id.slice(0, 8)}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                                                {report.reason}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-medium">
                                                <User size={12} />
                                                <span>Reported by {report.reporter?.name}</span>
                                                <span>•</span>
                                                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 ml-auto md:ml-0">
                                        <div className="text-right hidden md:block">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Action Taken</p>
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                {report.actionTaken || 'Pending Review'}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
