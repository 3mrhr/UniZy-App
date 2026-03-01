"use client";

import React, { useState } from 'react';
import { AlertCircle, Search, MessageSquare, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

const MOCK_TICKETS = [
    {
        id: '#TK-8910',
        student: 'Sara Ahmed',
        category: 'Order Issue',
        subject: 'Missing item in delivery',
        status: 'open',
        priority: 'high',
        time: '10 mins ago',
    },
    {
        id: '#TK-8909',
        student: 'Omar Hassan',
        category: 'Account',
        subject: 'Cannot update phone number',
        status: 'in_progress',
        priority: 'medium',
        time: '1 hour ago',
    },
    {
        id: '#TK-8908',
        student: 'Youssef Kamal',
        category: 'Billing',
        subject: 'Double charged for ride',
        status: 'open',
        priority: 'high',
        time: '2 hours ago',
    },
    {
        id: '#TK-8902',
        student: 'Nour El Din',
        category: 'General',
        subject: 'How to use reward points?',
        status: 'resolved',
        priority: 'low',
        time: 'Yesterday',
    }
];

export default function AdminSupportPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredTickets = MOCK_TICKETS.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'open': return <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold uppercase">Open</span>;
            case 'in_progress': return <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-bold uppercase">In Progress</span>;
            case 'resolved': return <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold uppercase">Resolved</span>;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Support Helpdesk</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage and resolve student inquiries and issues.</p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: 'Unresolved Tickets', value: '14', color: 'text-red-500' },
                    { label: 'Avg Response Time', value: '4m 12s', color: 'text-amber-500' },
                    { label: 'Resolved Today', value: '45', color: 'text-green-500' },
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
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                                    <td className="p-4 whitespace-nowrap">
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{ticket.id}</p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {ticket.time}</p>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{ticket.student}</p>
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{ticket.category}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {ticket.priority === 'high' && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">{ticket.subject}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center whitespace-nowrap">
                                        {getStatusBadge(ticket.status)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-[var(--unizy-primary)] font-bold text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            Resolve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
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
