'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ShieldCheck, UserPlus, Search, MoreVertical, ChevronDown, Truck, Home, ShoppingBag, UserCheck } from 'lucide-react';

const MOCK_USERS = [
    { id: 1, name: 'Omar Hassan', email: 'omar@unizy.com', role: 'ADMIN', status: 'Active', joined: '2026-01-10', university: 'Assiut University' },
    { id: 2, name: 'Ahmed Kareem', email: 'ahmed@driver.com', role: 'DRIVER', status: 'Active', joined: '2026-01-15', university: null },
    { id: 3, name: 'Sarah Mohamed', email: 'sarah@student.com', role: 'STUDENT', status: 'Active', joined: '2026-02-01', university: 'Assiut University' },
    { id: 4, name: 'Nour El-Din', email: 'nour@provider.com', role: 'PROVIDER', status: 'Pending', joined: '2026-02-10', university: null },
    { id: 5, name: 'Fatma Ali', email: 'fatma@merchant.com', role: 'MERCHANT', status: 'Active', joined: '2026-02-14', university: null },
    { id: 6, name: 'Khaled Mahmoud', email: 'khaled@student.com', role: 'STUDENT', status: 'Suspended', joined: '2026-02-20', university: 'Sphinx University' },
    { id: 7, name: 'Youssef Tarek', email: 'youssef@driver.com', role: 'DRIVER', status: 'Active', joined: '2026-02-22', university: null },
    { id: 8, name: 'Mariam Saeed', email: 'mariam@student.com', role: 'STUDENT', status: 'Active', joined: '2026-02-25', university: 'Assiut University' },
];

const ROLE_COLORS = {
    ADMIN: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
    STUDENT: { bg: 'bg-brand-100 dark:bg-brand-900/20', text: 'text-brand-600 dark:text-brand-400' },
    DRIVER: { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
    PROVIDER: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
    MERCHANT: { bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
};

const STATUS_COLORS = {
    Active: 'text-green-500',
    Pending: 'text-yellow-500',
    Suspended: 'text-red-500',
};

export default function AdminRolesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [users, setUsers] = useState(MOCK_USERS);

    const filteredUsers = users.filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'ALL' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'STUDENT').length,
        drivers: users.filter(u => u.role === 'DRIVER').length,
        merchants: users.filter(u => u.role === 'MERCHANT').length,
        providers: users.filter(u => u.role === 'PROVIDER').length,
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Role <span className="text-brand-600">Management</span></h1>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">User accounts & permissions</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total Users', value: stats.total, icon: Users, color: 'brand' },
                    { label: 'Students', value: stats.students, icon: UserCheck, color: 'indigo' },
                    { label: 'Drivers', value: stats.drivers, icon: Truck, color: 'blue' },
                    { label: 'Merchants', value: stats.merchants, icon: ShoppingBag, color: 'orange' },
                    { label: 'Providers', value: stats.providers, icon: Home, color: 'emerald' },
                ].map((s) => (
                    <div key={s.label} className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-center">
                        <s.icon className={`w-5 h-5 mx-auto mb-2 text-${s.color}-500`} />
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users by name or email..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 outline-none focus:border-brand-500 text-gray-900 dark:text-white font-bold"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 outline-none focus:border-brand-500 text-gray-900 dark:text-white font-bold appearance-none cursor-pointer"
                >
                    <option value="ALL">All Roles</option>
                    <option value="STUDENT">Students</option>
                    <option value="DRIVER">Drivers</option>
                    <option value="MERCHANT">Merchants</option>
                    <option value="PROVIDER">Providers</option>
                    <option value="ADMIN">Admins</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined</th>
                                <th className="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => {
                                const roleColor = ROLE_COLORS[user.role] || ROLE_COLORS.STUDENT;
                                return (
                                    <tr key={user.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center">
                                                    <span className="font-black text-brand-600 text-sm">{user.name.split(' ').map(n => n[0]).join('')}</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${roleColor.bg} ${roleColor.text}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-bold ${STATUS_COLORS[user.status]}`}>● {user.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-500">{user.joined}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
                        <p className="font-bold text-gray-400">No users match your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}
