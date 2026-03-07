'use client';

import { useState, useEffect } from 'react';
import { prisma } from '@/lib/prisma';
import { toast } from 'react-hot-toast';
import {
    Users,
    Search,
    Filter,
    Shield,
    MoreVertical,
    CheckCircle,
    XCircle,
    AlertCircle,
    Mail,
    UserCircle
} from 'lucide-react';
import Image from 'next/image';

// This would typically be a server-side fetching component/page
export default function UserManagementPortal() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        // In a real implementation, we'd fetch from a server action here
        // simulate fetching
        setTimeout(() => {
            setLoading(false);
        }, 800);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'VERIFIED': return 'text-emerald-400 bg-emerald-500/10';
            case 'PENDING': return 'text-amber-400 bg-amber-500/10';
            case 'BANNED': return 'text-rose-400 bg-rose-500/10';
            default: return 'text-zinc-400 bg-zinc-500/10';
        }
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-brand-500" />
                        User Management
                    </h1>
                    <p className="text-zinc-500 mt-1">Audit identities, manage roles, and enforce safety across the campus.</p>
                </div>

                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold transition flex items-center gap-2">
                        Export CSV
                    </button>
                </div>
            </header>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Students', value: '4.2k', icon: Users, color: 'text-blue-400' },
                    { label: 'Verified', value: '3.1k', icon: CheckCircle, color: 'text-emerald-400' },
                    { label: 'Pending Audit', value: '128', icon: AlertCircle, color: 'text-amber-400' },
                    { label: 'Flagged/Banned', value: '12', icon: Shield, color: 'text-rose-400' },
                ].map((stat, i) => (
                    <div key={i} className="p-4 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{stat.label}</p>
                            <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                        </div>
                        <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        placeholder="Search by name, email, or student ID..."
                        className="w-full pl-11 pr-4 py-3 bg-zinc-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 font-bold text-sm outline-none"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="ALL">All Roles</option>
                        <option value="STUDENT">Students</option>
                        <option value="MERCHANT">Merchants</option>
                        <option value="DRIVER">Drivers</option>
                    </select>
                    <button className="p-3 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition">
                        <Filter className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>

            {/* User List */}
            <div className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-900/50 text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Verification</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {/* Placeholder rows for UI demonstration */}
                        {[
                            { name: 'Omar Ryan', email: 'omar@unizy.app', role: 'STUDENT', status: 'ACTIVE', verified: 'VERIFIED', img: null },
                            { name: 'Sarah Ahmed', email: 'sarah.a@uni.edu', role: 'DRIVER', status: 'ACTIVE', verified: 'PENDING', img: null },
                            { name: 'Tech Solutions', email: 'merch@tech.com', role: 'MERCHANT', status: 'ACTIVE', verified: 'VERIFIED', img: null },
                            { name: 'Bad Actor', email: 'scam@gmail.com', role: 'STUDENT', status: 'SUSPENDED', verified: 'REJECTED', img: null }
                        ].map((user, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-black text-xs">
                                        {user.img ? <Image src={user.img} alt="" width={40} height={40} /> : <UserCircle className="w-6 h-6 text-zinc-600" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{user.name}</p>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {user.email}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[10px] font-black px-2 py-1 rounded bg-zinc-800 text-zinc-400 uppercase tracking-wider">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1.5 ${user.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(user.verified)}`}>
                                        {user.verified}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="p-2 hover:bg-zinc-800 rounded-lg transition opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="w-4 h-4 text-zinc-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
