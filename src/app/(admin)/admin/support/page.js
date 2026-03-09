"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Search, MessageSquare, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { getAdminTickets, updateTicketStatus } from '@/app/actions/support';

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchTickets = async () => {
            setIsLoading(true);
            try {
                const res = await getAdminTickets();
                if (res.success && res.tickets) {
                    setTickets(res.tickets);
                }
            } catch (error) {
                console.error(error);
            }
            setIsLoading(false);
        };
        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter(t => {
        const subjectMatch = (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase());
        const studentMatch = (t.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const idMatch = (t.id || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSearch = subjectMatch || studentMatch || idMatch;
        const matchesStatus = filterStatus === 'all' || (t.status || '').toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const handleResolve = async (id) => {
        const prev = [...tickets];
        setTickets(prev.map(t => t.id === id ? { ...t, status: 'RESOLVED' } : t));
        try {
            const res = await updateTicketStatus(id, 'RESOLVED');
            if (!res.success) {
                setTickets(prev);
                alert(res.error || 'Failed to resolve ticket');
            }
        } catch { setTickets(prev); }
    };

    const getStatusBadge = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'open': return <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold uppercase">Open</span>;
            case 'in_progress': return <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-bold uppercase">In Progress</span>;
            case 'resolved': return <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold uppercase">Resolved</span>;
            default: return <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase">{status}</span>;
        }
    };

    const unresolvedCount = tickets.filter(t => t.status !== 'RESOLVED').length;
    const resolvedTotal = tickets.filter(t => t.status === 'RESOLVED').length;

    const getSLABadge = (updatedAt) => {
        const diff = Date.now() - new Date(updatedAt).getTime();
        const mins = Math.floor(diff / 60000);

        if (mins < 30) return <span className="text-[10px] font-black text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">SLA: {mins}m</span>;
        if (mins < 120) return <span className="text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">SLA: {mins}m</span>;
        return <span className="text-[10px] font-black text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded animate-pulse">SLA BREACH ({mins}m)</span>;
    };

    const sosTickets = tickets.filter(t => t.category === 'TRANSPORT_SOS' && t.status !== 'RESOLVED');

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Support Helpdesk</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and resolve student inquiries and issues.</p>
                </div>
            </div>

            {/* Emergency SOS War Room Section */}
            {sosTickets.length > 0 && (
                <div className="bg-red-500 dark:bg-red-600 p-6 rounded-3xl shadow-xl shadow-red-500/20 border-b-4 border-red-700 animate-in fade-in slide-in-from-top duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-white p-2 rounded-xl animate-pulse">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-white font-black text-lg leading-none uppercase tracking-tighter">Active Emergencies (SOS)</h2>
                            <p className="text-white/80 text-xs font-bold mt-1">Found {sosTickets.length} critical alerts requiring immediate dispatch intervention.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sosTickets.map(ticket => (
                            <Link key={ticket.id} href={`/admin/support/${ticket.id}`} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl border border-white/20 transition-all flex justify-between items-center group">
                                <div className="truncate pr-4">
                                    <p className="text-white font-black text-sm truncate">{ticket.subject}</p>
                                    <p className="text-white/60 text-[10px] font-bold mt-0.5">{ticket.user?.name} • {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: 'Unresolved Tickets', value: unresolvedCount, color: 'text-red-500' },
                    { label: 'Avg Response Time', value: '12m', color: 'text-amber-500' },
                    { label: 'Resolution Rate', value: '94%', color: 'text-green-500' },
                    { label: 'CSAT Score', value: '4.8/5.0', color: 'text-blue-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-unizy-dark p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
                        <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-unizy-dark p-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/5 flex gap-4 mt-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tickets by ID, student name, or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-[var(--unizy-primary)] outline-none dark:text-white"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[var(--unizy-primary)] outline-none dark:text-white"
                >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            {/* Tickets Table */}
            <div className="bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">Ticket ID / Time</th>
                                <th className="p-4 font-bold">Student</th>
                                <th className="p-4 font-bold">Category</th>
                                <th className="p-4 font-bold">Subject</th>
                                <th className="p-4 font-bold text-center">Status</th>
                                <th className="p-4 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {isLoading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500 font-bold">Loading tickets...</td></tr>
                            ) : filteredTickets.map((ticket) => (
                                <tr key={ticket.id} onClick={() => window.location.href = `/admin/support/${ticket.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                                    <td className="p-4 whitespace-nowrap">
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">#{ticket.id.slice(-6).toUpperCase()}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{ticket.user?.name || 'Unknown'}</p>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{ticket.category}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {ticket.priority === 'HIGH' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                                            <div className="flex flex-col">
                                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">{ticket.subject}</p>
                                                {getSLABadge(ticket.updatedAt)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center whitespace-nowrap">
                                        {getStatusBadge(ticket.status)}
                                    </td>
                                    <td className="p-4 text-right">
                                        {ticket.status !== 'RESOLVED' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleResolve(ticket.id);
                                                }}
                                                className="text-[var(--unizy-primary)] font-bold text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
                                            >
                                                Resolve
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400 font-bold">
                                        No tickets match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
