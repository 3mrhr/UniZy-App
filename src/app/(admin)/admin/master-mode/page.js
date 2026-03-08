"use client";

import React, { useState, useEffect, useTransition } from 'react';
import {
    Search, ShieldAlert, Trash2, Edit3, UserSlash,
    CheckCircle, XCircle, Loader2, Database, ExternalLink,
    Filter, MoreVertical, ShieldCheck, Mail, MapPin, Calendar
} from 'lucide-react';
import { globalSearch } from '@/app/actions/search';
import { shadowBanUser } from '@/app/actions/hub';
import toast from 'react-hot-toast';

const ENTITY_TYPES = [
    { id: 'all', label: 'All Entities' },
    { id: 'user', label: 'Users' },
    { id: 'meal', label: 'Meals' },
    { id: 'housing', label: 'Housing' },
    { id: 'order', label: 'Orders' },
];

export default function MasterModePage() {
    const [query, setQuery] = useState('');
    const [type, setType] = useState('all');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (query.length < 2) return;
        setLoading(true);
        const res = await globalSearch(query, { category: type === 'all' ? undefined : type });
        setResults(res.results || []);
        setLoading(false);
    };

    const handleShadowBan = async (userId) => {
        if (!confirm("Are you sure? This user won't know they're banned but their posts will be hidden.")) return;
        const res = await shadowBanUser(userId);
        if (res.success) {
            toast.success("User shadow banned from Hub");
        } else {
            toast.error(res.error || "Failed to shadow ban");
        }
    };

    const handleDelete = async (entityType, entityId) => {
        if (!confirm(`CRITICAL: Permanent delete ${entityType} ID: ${entityId}? This cannot be undone.`)) return;
        // In a real app, this would call a generic delete action
        toast.error("Global delete requires secondary MFA confirmation in Master Mode.");
    };

    return (
        <main className="min-h-screen bg-[#0F172A] text-white p-8">
            {/* Master Header */}
            <div className="max-w-6xl mx-auto mb-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                        <ShieldAlert className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Master Mode</h1>
                        <p className="text-red-400 font-bold text-xs tracking-[.4em] uppercase">Super Admin God-Mode Enabled</p>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                            System Health: 100%
                        </span>
                        <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                    </div>
                </div>

                {/* Command Bar */}
                <form onSubmit={handleSearch} className="flex gap-4 p-2 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search globally for IDs, Names, Emails, or Orders..."
                            className="w-full bg-transparent border-0 focus:ring-0 py-6 pl-16 pr-6 text-sm font-bold placeholder-gray-500 outline-none"
                        />
                    </div>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="bg-white/5 border-0 focus:ring-0 rounded-3xl px-6 text-sm font-black uppercase tracking-tight outline-none cursor-pointer hover:bg-white/10 transition-all opacity-80"
                    >
                        {ENTITY_TYPES.map(t => <option key={t.id} value={t.id} className="bg-slate-900">{t.label}</option>)}
                    </select>
                    <button type="submit" className="px-10 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/30">
                        Command
                    </button>
                </form>
            </div>

            {/* Results Engine */}
            <div className="max-w-6xl mx-auto space-y-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                        <p className="text-gray-500 font-black uppercase tracking-widest animate-pulse">Scanning Neural Network...</p>
                    </div>
                ) : results.length > 0 ? (
                    results.map((res) => (
                        <div key={res.id} className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-[2rem] p-6 transition-all flex items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Entity Icon */}
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${res.type === 'user' ? 'bg-indigo-500/20 text-indigo-400' :
                                    res.type === 'meal' ? 'bg-orange-500/20 text-orange-400' :
                                        res.type === 'housing' ? 'bg-emerald-500/20 text-emerald-400' :
                                            'bg-gray-500/20 text-gray-400'
                                }`}>
                                {res.type === 'user' ? <ShieldCheck /> : <Database />}
                            </div>

                            {/* Entity Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black text-gray-500 uppercase tracking-widest">{res.type}</span>
                                    <span className="text-[10px] font-mono text-gray-600 truncate">ID: {res.id}</span>
                                </div>
                                <h3 className="text-lg font-black text-white truncate">{res.title}</h3>
                                <p className="text-xs text-gray-500 font-medium truncate">{res.subtitle}</p>
                            </div>

                            {/* Master Actions */}
                            <div className="flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => window.open(res.url, '_blank')} className="p-3 bg-white/5 hover:bg-brand-500 rounded-xl transition-all" title="Open Public Page">
                                    <ExternalLink size={16} />
                                </button>
                                {res.type === 'hub_post' && (
                                    <button onClick={() => handleShadowBan(res.authorId)} className="p-3 bg-white/5 hover:bg-orange-600 rounded-xl transition-all" title="Shadow Ban Author">
                                        <UserSlash size={16} />
                                    </button>
                                )}
                                <button onClick={() => handleDelete(res.type, res.id)} className="p-3 bg-white/5 hover:bg-red-600 rounded-xl transition-all" title="Delete Entity">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : query && (
                    <div className="py-20 text-center text-gray-500">
                        <Database className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-black uppercase tracking-tighter">No entities found in this sector.</h3>
                        <p className="text-xs font-bold opacity-50">Refine your command sequence or check global permissions.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
