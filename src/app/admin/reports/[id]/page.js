'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft,
    ShieldAlert,
    User,
    Calendar,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Flag,
    Eye,
    Trash2,
    Ban,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { getReports, resolveReport, banUser } from '@/app/actions/trust';
import toast from 'react-hot-toast';

export default function ReportDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchReportDetail = async () => {
        setLoading(true);
        const res = await getReports(); // Fetch all and find specifically for MVP simplicity
        if (res.success) {
            const found = res.reports.find(r => r.id === id);
            if (found) {
                setReport(found);
            } else {
                toast.error('Report not found');
                router.push('/admin/reports');
            }
        } else {
            toast.error(res.error || 'Failed to fetch report');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (id) fetchReportDetail();
    }, [id]);

    const handleAction = async (status, actionTaken) => {
        setIsSubmitting(true);
        const res = await resolveReport(id, { status, actionTaken });
        if (res.success) {
            toast.success(`Report ${status.toLowerCase()} as ${actionTaken}`);
            fetchReportDetail();
        } else {
            toast.error(res.error || 'Failed to update report');
        }
        setIsSubmitting(false);
    };

    const handleBan = async () => {
        if (!report?.targetUserId) return;
        const confirmBan = confirm("Are you sure you want to ban this user? This will also mark the report as RESOLVED.");
        if (!confirmBan) return;

        setIsSubmitting(true);
        const res = await banUser(report.targetUserId, `Reported for: ${report.reason}`);
        if (res.success) {
            await handleAction('RESOLVED', 'USER_BANNED');
        } else {
            toast.error(res.error || 'Failed to ban user');
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-unizy-navy">
                <RefreshCw className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        );
    }

    if (!report) return null;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
            case 'INVESTIGATING': return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
            case 'RESOLVED': return 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
            case 'DISMISSED': return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
            default: return 'bg-gray-50 text-gray-500 border-gray-100 dark:bg-gray-800 dark:border-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => router.push('/admin/reports')}
                    className="flex items-center gap-2 text-gray-500 hover:text-brand-600 font-bold text-sm mb-6 transition-colors group"
                >
                    <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                    Back to Queue
                </button>

                <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden mb-8">
                    {/* Top Status Bar */}
                    <div className="px-8 py-6 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-white dark:bg-unizy-dark px-3 py-1 rounded-full border border-gray-100 dark:border-white/5">
                                #{report.id.slice(0, 12)}
                            </span>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusStyle(report.status)}`}>
                                {report.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(report.createdAt).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Report Reason & Details */}
                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl">
                                    <ShieldAlert size={28} />
                                </div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                    {report.reason}
                                </h1>
                            </div>

                            <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5">
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Reporter's Details</p>
                                <p className="text-gray-800 dark:text-gray-200 leading-relaxed font-medium italic">
                                    "{report.details || 'No additional details provided by the reporter.'}"
                                </p>
                            </div>
                        </div>

                        {/* Profiles Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            {/* Reporter Card */}
                            <div className="p-6 bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Reporter</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-black text-xl">
                                        {report.reporter?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{report.reporter?.name}</p>
                                        <p className="text-xs text-gray-500">{report.reporter?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Target User Card */}
                            {report.targetUser && (
                                <div className="p-6 bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Target User</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-black text-xl">
                                            {report.targetUser?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{report.targetUser?.name}</p>
                                            <p className="text-xs text-gray-500">{report.targetUser?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Preview / Target Reference */}
                        <div className="bg-gray-50 dark:bg-white/5 rounded-3xl p-6 border border-gray-100 dark:border-white/5 mb-10">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Reported {report.type}</p>
                                <Link
                                    href={
                                        report.type === 'HOUSING' ? `/housing/${report.targetId}` :
                                            report.type === 'HUB_POST' ? `/hub` :
                                                '#'
                                    }
                                    className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                                >
                                    <Eye size={14} /> View Content
                                </Link>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-unizy-dark rounded-xl border border-gray-100 dark:border-white/5 text-gray-400">
                                    <ExternalLink size={18} />
                                </div>
                                <code className="text-[10px] font-mono text-gray-500 break-all select-all">
                                    ID: {report.targetId}
                                </code>
                            </div>
                        </div>

                        {/* Action Taken (If Resolved) */}
                        {report.status !== 'PENDING' && (
                            <div className="mb-10 p-6 bg-green-50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30 rounded-3xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle2 className="text-green-600" size={20} />
                                    <p className="text-sm font-black text-green-700 dark:text-green-400 uppercase tracking-widest">Action Taken</p>
                                </div>
                                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                                    {report.actionTaken === 'NONE' ? 'Report Dismissed (No Action)' : report.actionTaken}
                                </p>
                            </div>
                        )}

                        {/* Admin Action Cockpit */}
                        {report.status === 'PENDING' || report.status === 'INVESTIGATING' ? (
                            <div className="border-t border-gray-100 dark:border-white/5 pt-10">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">Moderation Actions</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAction('RESOLVED', 'CONTENT_REMOVED')}
                                        disabled={isSubmitting}
                                        className="p-5 bg-white dark:bg-unizy-dark border-2 border-amber-500/20 hover:border-amber-500 text-amber-600 rounded-3xl flex items-center gap-4 transition-all group active:scale-95"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                            <Trash2 size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-sm">Remove Content</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Violation: Guidelines</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleBan}
                                        disabled={isSubmitting || !report.targetUserId}
                                        className="p-5 bg-white dark:bg-unizy-dark border-2 border-red-500/20 hover:border-red-500 text-red-600 rounded-3xl flex items-center gap-4 transition-all group active:scale-95 disabled:opacity-30 disabled:grayscale"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                                            <Ban size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-sm">Ban User</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Severe Violation</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAction('RESOLVED', 'WARNING_SENT')}
                                        disabled={isSubmitting}
                                        className="p-5 bg-white dark:bg-unizy-dark border-2 border-blue-500/20 hover:border-blue-500 text-blue-600 rounded-3xl flex items-center gap-4 transition-all group active:scale-95"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-sm">Send Warning</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">Minor Violation</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => handleAction('DISMISSED', 'NONE')}
                                        disabled={isSubmitting}
                                        className="p-5 bg-white dark:bg-unizy-dark border-2 border-gray-200 dark:border-white/10 hover:border-gray-500 text-gray-500 rounded-3xl flex items-center gap-4 transition-all group active:scale-95"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-gray-500 group-hover:text-white transition-colors">
                                            <XCircle size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-sm">Dismiss Report</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">No Violation Found</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
