"use client";

import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, MoreHorizontal, Check, X, Search } from 'lucide-react';
import { getUsers, updateUserRole } from '@/app/actions/admin';

export default function StaffManagementPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedScopes, setSelectedScopes] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        const res = await getUsers();
        if (res.success) {
            // Filter to only show admin-related users
            const admins = res.data.filter(u => u.role.includes('ADMIN'));
            setUsers(admins);
        }
        setIsLoading(false);
    };

    const handleEditClick = (user) => {
        setEditingUser(user.id);
        setSelectedRole(user.role);

        // Parse scopes if they exist
        let parsedScopes = [];
        if (user.scopes) {
            try {
                parsedScopes = typeof user.scopes === 'string' ? JSON.parse(user.scopes) : user.scopes;
            } catch (e) {
                console.error("Error parsing scopes", e);
            }
        }
        setSelectedScopes(parsedScopes || []);
    };

    const handleScopeToggle = (scope) => {
        if (selectedScopes.includes(scope)) {
            setSelectedScopes(selectedScopes.filter(s => s !== scope));
        } else {
            setSelectedScopes([...selectedScopes, scope]);
        }
    };

    const handleSave = async (userId) => {
        setIsSaving(true);
        const res = await updateUserRole(userId, selectedRole, selectedScopes);
        if (res.success) {
            setUsers(users.map(u =>
                u.id === userId ? { ...u, role: selectedRole, scopes: JSON.stringify(selectedScopes) } : u
            ));
            setEditingUser(null);
        } else {
            alert(res.error || 'Failed to update user');
        }
        setIsSaving(false);
    };

    const availableModules = [
        { id: 'HOUSING', label: 'Housing' },
        { id: 'TRANSPORT', label: 'Transport' },
        { id: 'DELIVERY', label: 'Delivery' },
        { id: 'DEALS', label: 'Deals' },
        { id: 'MEALS', label: 'Meals' },
        { id: 'SERVICES', label: 'Services' },
        { id: 'CLEANING', label: 'Cleaning' },
    ];

    const formatScopes = (scopesJson) => {
        if (!scopesJson) return <span className="text-gray-400 italic">Global Scope</span>;
        try {
            const parsed = typeof scopesJson === 'string' ? JSON.parse(scopesJson) : scopesJson;
            if (!parsed || parsed.length === 0) return <span className="text-gray-400 italic">None</span>;
            return parsed.map(s => (
                <span key={s} className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-600 mr-1 mb-1">
                    {s}
                </span>
            ));
        } catch (e) {
            return <span className="text-gray-400 italic">Invalid Scope Data</span>;
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-8 h-8 text-brand-600" />
                        Staff & Module Admins
                    </h1>
                    <p className="text-gray-500 mt-1">Manage staff members and assign their modular permission scopes.</p>
                </div>
            </div>

            {/* Quick Stats / Search */}
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex gap-4 items-center shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Staff</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{users.length}</p>
                </div>

                <div className="relative flex-1 max-w-sm hidden sm:block">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search staff by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Staff Member</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Assigned Role</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Module Scopes</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 bg-gray-50/50 dark:bg-gray-800/20">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-4"></div>
                                            <p className="font-bold">Loading staff directory...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 bg-gray-50/50 dark:bg-gray-800/20">
                                        No staff members found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingUser === user.id ? (
                                                <select
                                                    value={selectedRole}
                                                    onChange={(e) => setSelectedRole(e.target.value)}
                                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none"
                                                >
                                                    <option value="ADMIN_SUPER">Super Admin</option>
                                                    <option value="ADMIN_OPERATIONS">Operations Admin</option>
                                                    <option value="ADMIN_FINANCE">Finance Admin</option>
                                                    <option value="ADMIN_COMMERCE">Commerce Admin</option>
                                                    <option value="ADMIN_HOUSING">Housing Admin</option>
                                                    <option value="ADMIN_TRANSPORT">Transport Admin</option>
                                                    <option value="ADMIN_DELIVERY">Delivery Admin</option>
                                                    <option value="SUPPORT_AGENT">Support Agent</option>
                                                    <option value="STUDENT">Demote to Student</option>
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                                                    ${user.role === 'ADMIN_SUPER' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/30' :
                                                        user.role.startsWith('ADMIN_') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' :
                                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
                                                >
                                                    {user.role.replace('ADMIN_', '')}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 max-w-xs">
                                            {editingUser === user.id ? (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {availableModules.map(mod => (
                                                        <button
                                                            key={mod.id}
                                                            onClick={() => handleScopeToggle(mod.id)}
                                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors border
                                                                ${selectedScopes.includes(mod.id)
                                                                    ? 'bg-brand-500 text-white border-brand-500'
                                                                    : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            {mod.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                    {formatScopes(user.scopes)}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingUser === user.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSave(user.id)}
                                                        disabled={isSaving}
                                                        className="p-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                                                        title="Save"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUser(null)}
                                                        disabled={isSaving}
                                                        className="p-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                                        title="Cancel"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="text-gray-400 hover:text-brand-600 transition-colors"
                                                    title="Edit Scopes & Role"
                                                >
                                                    <MoreHorizontal className="w-5 h-5 ml-auto" />
                                                </button>
                                            )}
                                        </td>
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
