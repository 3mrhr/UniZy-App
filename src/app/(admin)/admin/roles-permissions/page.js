"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { getUsers, updateUserRole } from '@/app/actions/admin';

export default function RolesPermissionsPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    const AVAILABLE_ROLES = [
        'STUDENT', 'DRIVER', 'MERCHANT', 'PROVIDER', 'SUPPORT',
        'ADMIN_HOUSING', 'ADMIN_TRANSPORT', 'ADMIN_DELIVERY', 'ADMIN_COMMERCE', 'ADMIN_SUPER'
    ];

    useEffect(() => {
        // Fetch users from backend
        const fetchUsers = async () => {
            setIsLoading(true);
            const res = await getUsers();
            if (res.success) {
                setUsers(res.data);
            } else {
                alert(res.error || 'Failed to load users');
            }
            setIsLoading(false);
        };
        fetchUsers();
    }, []);

    const handleSaveRole = async (userId) => {
        // Optimistic UI Update
        const previousUsers = [...users];
        setUsers(users.map(u => u.id === userId ? { ...u, role: selectedRole } : u));
        setEditingUserId(null);

        // Call server action
        const res = await updateUserRole(userId, selectedRole);
        if (!res.success) {
            alert(res.error || 'Failed to update role');
            setUsers(previousUsers); // Revert on failure
        }
    };

    const startEditing = (user) => {
        setEditingUserId(user.id);
        setSelectedRole(user.role);
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-brand-600" />
                        Roles & Permissions
                    </h1>
                    <p className="text-gray-500 mt-1">Manage system access and assign administrative modules.</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="bg-transparent border-none outline-none w-full text-gray-900 dark:text-white font-medium placeholder:font-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-xl shadow-brand-500/5 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                                <th className="p-4 text-xs font-black tracking-wider text-gray-500 uppercase">User</th>
                                <th className="p-4 text-xs font-black tracking-wider text-gray-500 uppercase">Current Role</th>
                                <th className="p-4 text-xs font-black tracking-wider text-gray-500 uppercase">Access Scope</th>
                                <th className="p-4 text-xs font-black tracking-wider text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 font-bold">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 font-bold">No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white">{user.name}</span>
                                                <span className="text-sm text-gray-500">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {editingUserId === user.id ? (
                                                <select
                                                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-brand-500"
                                                    value={selectedRole}
                                                    onChange={(e) => setSelectedRole(e.target.value)}
                                                >
                                                    {AVAILABLE_ROLES.map(role => (
                                                        <option key={role} value={role}>{role.replace('_', ' ')}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider uppercase ${user.role.includes('ADMIN') ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                    user.role === 'STUDENT' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {user.role.replace('_', ' ')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {user.role === 'ADMIN_SUPER' ? 'Full System Access' :
                                                user.role === 'ADMIN_HOUSING' ? 'Housing Module Only' :
                                                    user.role === 'ADMIN_TRANSPORT' ? 'Transport Module Only' :
                                                        user.role === 'ADMIN_DELIVERY' ? 'Delivery Module Only' :
                                                            user.role === 'ADMIN_COMMERCE' ? 'Deals & Meals Only' :
                                                                'Standard User Access'}
                                        </td>
                                        <td className="p-4 text-right">
                                            {editingUserId === user.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSaveRole(user.id)}
                                                        className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUserId(null)}
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(user)}
                                                    className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
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
