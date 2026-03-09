"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, History, User, X } from 'lucide-react';
import { getAuditLogs } from '@/app/actions/audit';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterModule, setFilterModule] = useState('ALL');

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            const res = await getAuditLogs({ module: filterModule });
            if (res.success) {
                setLogs(res.data);
            } else {
                console.error(res.error);
            }
            setIsLoading(false);
        };
        fetchLogs();
    }, [filterModule]);

    const displayLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-EG', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    const [selectedLog, setSelectedLog] = useState(null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <History className="w-8 h-8 text-brand-600" />
                        System Audit Logs
                    </h1>
                    <p className="text-gray-500 mt-1">Immutable record of all administrative actions and system events.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 shadow-sm">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            className="bg-transparent border-none outline-none text-sm font-bold text-gray-900 dark:text-white"
                            value={filterModule}
                            onChange={(e) => setFilterModule(e.target.value)}
                        >
                            <option value="ALL">All Modules</option>
                            <option value="USERS">Users & Roles</option>
                            <option value="HOUSING">Housing</option>
                            <option value="HUB">Hub</option>
                            <option value="TRANSPORT">Transport</option>
                            <option value="DELIVERY">Delivery</option>
                            <option value="FINANCE">Finance</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search logs by action, admin name, or details..."
                    className="bg-transparent border-none outline-none w-full text-gray-900 dark:text-white font-medium placeholder:font-normal"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Audit Log Table */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-xl shadow-brand-500/5 border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800">
                                <th className="p-4 text-xs font-black tracking-wider text-gray-500 uppercase">Timestamp</th>
                                <th className="p-4 text-xs font-black tracking-wider text-gray-500 uppercase">Action</th>
                                <th className="p-4 text-xs font-black tracking-wider text-gray-500 uppercase">Module</th>
                                <th className="p-4 text-xs font-black tracking-wider text-gray-500 uppercase">Admin User</th>
                                <th className="p-4 text-xs font-black tracking-wider text-gray-500 uppercase">Target / Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 font-bold">Loading audit logs...</td>
                                </tr>
                            ) : displayLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 font-bold">No logs matched your search.</td>
                                </tr>
                            ) : (
                                displayLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        onClick={() => setSelectedLog(log)}
                                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer group"
                                    >
                                        <td className="p-4 text-sm text-gray-500 font-mono">
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black tracking-wider bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${log.module === 'USERS' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30' :
                                                log.module === 'FINANCE' ? 'bg-green-50 text-green-600 dark:bg-green-900/30' :
                                                    log.module === 'HUB' ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/30' :
                                                        'bg-gray-50 text-gray-600 dark:bg-gray-800'
                                                }`}>
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-3 h-3" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px]" title={log.admin.name}>
                                                        {log.admin.name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 truncate max-w-[120px]" title={log.admin.email}>
                                                        {log.admin.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 max-w-xs">
                                                {log.targetId && (
                                                    <span className="text-xs font-mono text-gray-500 truncate" title={log.targetId}>
                                                        ID: {log.targetId}
                                                    </span>
                                                )}
                                                {log.details && (
                                                    <span className="text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded line-clamp-2 font-mono" title={log.details}>
                                                        {log.details}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* JSON Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1E293B] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-brand-600" />
                                    Audit Detail Inspector
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Reference ID: {selectedLog.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Action Type</p>
                                        <p className="text-sm font-black text-brand-600 truncate">{selectedLog.action}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Module</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{selectedLog.module}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Admin Actor</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{selectedLog.admin.name}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">{formatDate(selectedLog.createdAt)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-2xl p-6 relative">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">JSON Body (Raw Context)</p>
                                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
                                    {selectedLog.details ? JSON.stringify(JSON.parse(selectedLog.details), null, 4) : '// No additional details provided'}
                                </pre>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-6 py-2.5 bg-brand-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
