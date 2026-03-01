'use client';

import { useState } from 'react';

export default function AdminRoles() {
    // Mock user database
    const [users, setUsers] = useState([
        { id: 1, name: 'Omar Hassan', email: 'omar@unizy.com', role: 'SUPERADMIN' },
        { id: 2, name: 'Ahmed K.', email: 'ahmed@delivery.unizy.com', role: 'DELIVERYSUPERADMIN' },
        { id: 3, name: 'Sara M.', email: 'sara@housing.unizy.com', role: 'HOUSINGSUPERADMIN' },
        { id: 4, name: 'Mahmoud S.', email: 'student1@gmail.com', role: 'STUDENT' },
        { id: 5, name: 'Mona A.', email: 'mona@transport.unizy.com', role: 'TRANSPORTSUPERADMIN' },
    ]);

    const availableRoles = [
        { value: 'STUDENT', label: 'Default Student' },
        { value: 'DELIVERYSUPERADMIN', label: 'Delivery Module Admin' },
        { value: 'HOUSINGSUPERADMIN', label: 'Housing Module Admin' },
        { value: 'TRANSPORTSUPERADMIN', label: 'Transport Module Admin' },
        { value: 'SUPERADMIN', label: 'Global Superadmin (Danger)' },
    ];

    const handleRoleChange = (userId, newRole) => {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Module Administrators</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Delegate module control to specific team members.</p>
            </div>

            <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden animate-fade-in">
                <div className="p-8 border-b border-slate-50 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-brand-500">🛡️</span> Access Control Matrix
                    </h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-slate-50 dark:bg-unizy-navy/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-brand-500 outline-none w-64 text-slate-900 dark:text-white"
                        />
                        <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-unizy-navy/30 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                <th className="p-6 font-bold">User Name</th>
                                <th className="p-6 font-bold">Email</th>
                                <th className="p-6 font-bold">Current Access Level</th>
                                <th className="p-6 font-bold w-1/4">Assign Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-unizy-navy/20 transition-colors">
                                    <td className="p-6">
                                        <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                    </td>
                                    <td className="p-6">
                                        {user.role === 'SUPERADMIN' && (
                                            <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-black px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800 tracking-widest uppercase">
                                                Global Superadmin
                                            </span>
                                        )}
                                        {user.role.includes('SUPERADMIN') && user.role !== 'SUPERADMIN' && (
                                            <span className="bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-black px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800 tracking-widest uppercase">
                                                {user.role.replace('SUPERADMIN', '')} Admin
                                            </span>
                                        )}
                                        {user.role === 'STUDENT' && (
                                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase">
                                                Basic Access
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-unizy-navy border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-brand-500 font-medium"
                                        >
                                            {availableRoles.map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
