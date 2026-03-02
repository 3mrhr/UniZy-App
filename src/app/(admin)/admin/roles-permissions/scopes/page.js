"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Info, CheckCircle2, Search, Filter } from 'lucide-react';
import { getUsers } from '@/app/actions/admin';
import Link from 'next/link';

export default function PermissionScopesPage() {
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const modules = [
        { id: 'HOUSING', label: 'Housing', color: 'bg-emerald-500' },
        { id: 'TRANSPORT', label: 'Transport', color: 'bg-blue-500' },
        { id: 'DELIVERY', label: 'Delivery', color: 'bg-orange-500' },
        { id: 'DEALS', label: 'Deals', color: 'bg-pink-500' },
        { id: 'MEALS', label: 'Meals', color: 'bg-red-500' },
        { id: 'SERVICES', label: 'Services', color: 'bg-indigo-500' },
        { id: 'CLEANING', label: 'Cleaning', color: 'bg-cyan-500' },
    ];

    useEffect(() => {
        const fetchStaff = async () => {
            setIsLoading(true);
            const res = await getUsers();
            if (res.success) {
                // Filter to only show admins
                const admins = res.data.filter(u => u.role.includes('ADMIN'));
                setStaff(admins);
            }
            setIsLoading(false);
        };
        fetchStaff();
    }, []);

    const hasScope = (user, moduleId) => {
        if (user.role === 'ADMIN_SUPER') return true; // Super Admins have implied global scope

        let scopes = [];
        try {
            scopes = typeof user.scopes === 'string' ? JSON.parse(user.scopes) : (user.scopes || []);
        } catch (e) {
            console.error("Error parsing scopes", e);
        }

        return scopes && scopes.includes(moduleId);
    };

    const filteredStaff = staff.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-brand-600" />
                        Permission Scopes Matrix
                    </h1>
                    <p className="text-gray-500 mt-1">Visualize which staff members have access to which modular controls.</p>
                </div>
                <Link
                    href="/admin/staff"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-500/30"
                >
                    Edit Assignments
                </Link>
            </div>

            {/* Quick Stats / Search */}
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex gap-4 items-center shadow-sm">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter matrix by staff name or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                    />
                </div>

                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                    <Info className="w-4 h-4" />
                    <span>Super Admins automatically have global scope access across all modules.</span>
                </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-[#1E293B] z-10 min-w-[200px] border-r border-gray-100 dark:border-gray-800">
                                    Admin Staff
                                </th>
                                {modules.map(mod => (
                                    <th key={mod.id} className="px-4 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-center min-w-[100px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className={`w-3 h-3 rounded-full ${mod.color}`}></div>
                                            {mod.label}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={modules.length + 1} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50 dark:bg-gray-800/20">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-4"></div>
                                            <p className="font-bold">Loading matrix data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={modules.length + 1} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50 dark:bg-gray-800/20">
                                        No staff members match the filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredStaff.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white dark:bg-[#1E293B] border-r border-gray-100 dark:border-gray-800 z-10 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'ADMIN_SUPER' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}>
                                                        {user.role.replace('ADMIN_', '')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {modules.map(mod => {
                                            const granted = hasScope(user, mod.id);
                                            return (
                                                <td key={mod.id} className={`px-4 py-4 text-center transition-colors ${granted ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}`}>
                                                    {granted ? (
                                                        <CheckCircle2 className={`w-5 h-5 mx-auto ${user.role === 'ADMIN_SUPER' ? 'text-purple-400 opacity-50' : 'text-brand-500'}`} />
                                                    ) : (
                                                        <span className="text-gray-200 dark:text-gray-800 font-bold">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
