'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    ChevronRight,
    RefreshCw,
    MoreHorizontal,
    Flag
} from 'lucide-react';
import { getAdminTickets, claimTicket } from '@/app/actions/support';
import toast from 'react-hot-toast';

export default function AdminSupportDashboard() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        category: ''
    });

    useEffect(() => {
        fetchTickets();
    }, [filters]);

    const fetchTickets = async () => {
        setIsLoading(true);
        const res = await getAdminTickets(filters);
        if (res.success) {
            setTickets(res.tickets);
        } else {
            toast.error(res.error || 'Failed to fetch tickets');
        }
        setIsLoading(false);
    };

    const handleClaim = async (id) => {
        const res = await claimTicket(id);
        if (res.success) {
            toast.success('Ticket claimed successfully');
            fetchTickets();
        } else {
            toast.error(res.error || 'Failed to claim ticket');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'RESOLVED': return 'text-green-600 bg-green-50 border-green-200';
            case 'CLOSED': return 'text-gray-600 bg-gray-50 border-gray-200';
            case 'IN_PROGRESS': return 'text-orange-600 bg-orange-50 border-orange-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'URGENT': return 'text-red-600 bg-red-50';
            case 'HIGH': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Support Queue</h1>
                    <p className="text-gray-500 font-medium">Manage and resolve student help requests.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchTickets}
                        className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-unizy-primary' : ''}`} />
                    </button>
                    <div className="bg-unizy-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-unizy-primary/20 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        <span>{tickets.filter(t => t.status === 'OPEN').length} Active Tickets</span>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <section className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute top-1/2 -translate-y-1/2 left-4 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-unizy-primary"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="bg-gray-50 border-none rounded-xl py-3 px-5 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-unizy-primary min-w-[140px]"
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="bg-gray-50 border-none rounded-xl py-3 px-5 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-unizy-primary min-w-[140px]"
                    >
                        <option value="">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>

                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* Ticket Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Student</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Subject / Category</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Priority</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Created</th>
                            <th className="px-6 py-5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            [1, 2, 3].map(i => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="7" className="px-6 py-8"><div className="h-6 bg-gray-50 rounded-lg w-full"></div></td>
                                </tr>
                            ))
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                                {ticket.user.profileImage ? (
                                                    <img src={ticket.user.profileImage} alt={ticket.user.name} className="w-full h-full object-cover" />
                                                ) : <User size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{ticket.user.name}</p>
                                                <p className="text-[10px] text-gray-400">{ticket.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{ticket.subject}</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-unizy-primary"></span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{ticket.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        {ticket.assignedAgent ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white font-bold">
                                                    {ticket.assignedAgent.name[0]}
                                                </div>
                                                <span className="text-xs font-bold text-gray-600">{ticket.assignedAgent.name}</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleClaim(ticket.id)}
                                                className="text-xs font-bold text-unizy-primary hover:underline"
                                            >
                                                Claim Ticket
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-xs text-gray-400 font-medium">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <Link
                                            href={`/admin/support/${ticket.id}`}
                                            className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-unizy-primary hover:bg-unizy-primary/5 transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center">
                                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Flag className="w-10 h-10 text-gray-200" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 mb-1">Queue is empty</h3>
                                    <p className="text-gray-500 text-sm">All tickets have been addressed. Good job!</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
