"use client";

import { useState, useEffect } from "react";
import { getSLABreaches, resolveSLABreach, checkSLABreaches } from "@/app/actions/sla";
import { toast } from "react-hot-toast";
import { AlertCircle, CheckCircle, Clock, RefreshCcw, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SLABreachesPage() {
    const [breaches, setBreaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanLoading, setScanLoading] = useState(false);

    useEffect(() => {
        fetchBreaches();
    }, []);

    const fetchBreaches = async () => {
        setLoading(true);
        const res = await getSLABreaches("OPEN");
        if (res?.success) {
            setBreaches(res.breaches);
        } else {
            toast.error("Failed to load breaches");
        }
        setLoading(false);
    };

    const handleRunScan = async () => {
        setScanLoading(true);
        const res = await checkSLABreaches();
        if (res?.success) {
            toast.success(`Scan complete. Found ${res.count} new SLA violations.`);
            if (res.count > 0) fetchBreaches();
        } else {
            toast.error("Scan engine failed");
        }
        setScanLoading(false);
    };

    const handleResolve = async (id) => {
        const res = await resolveSLABreach(id);
        if (res?.success) {
            toast.success("Breach resolved");
            setBreaches(prev => prev.filter(b => b.id !== id));
        } else {
            toast.error("Failed to resolve breach");
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/admin/sla" className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                            ← Back to Config
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                            Active Breaches
                            {breaches.length > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{breaches.length} open</span>
                            )}
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Monitor and resolve Time-to-Action violations across modules.</p>
                </div>

                <button
                    onClick={handleRunScan}
                    disabled={scanLoading}
                    className="px-5 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-200 text-white rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCcw size={18} className={scanLoading ? "animate-spin" : ""} />
                    {scanLoading ? "Scanning Engine..." : "Run Engine Scan"}
                </button>
            </div>

            <div className="bg-white dark:bg-unizy-dark rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 p-8">
                {loading ? (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold">Loading violations...</div>
                ) : breaches.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">100% SLA Compliance</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No open violations detected across your network. Excellent!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="pb-4 border-b-2 border-slate-100 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Time Limit</th>
                                    <th className="pb-4 border-b-2 border-slate-100 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Module / Rule</th>
                                    <th className="pb-4 border-b-2 border-slate-100 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Target Txn ID</th>
                                    <th className="pb-4 border-b-2 border-slate-100 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Suggested Action</th>
                                    <th className="pb-4 border-b-2 border-slate-100 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">&nbsp;</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {breaches.map((breach) => (
                                    <tr key={breach.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-4 font-bold text-red-600 flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            &gt; {breach.rule.thresholdMinutes}m
                                        </td>
                                        <td className="py-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{breach.rule.metric.replace('_', ' ')}</div>
                                            <div className="text-[10px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">{breach.rule.module}</div>
                                        </td>
                                        <td className="py-4">
                                            <span className="font-mono text-xs bg-slate-100 dark:bg-unizy-navy px-2 py-1 rounded text-slate-600 dark:text-slate-400 flex items-center gap-2 inline-flex">
                                                {breach.targetId.substring(0, 8)}...
                                                <ExternalLink size={12} className="cursor-pointer hover:text-brand-600" />
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                                                {breach.rule.breachAction.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button
                                                onClick={() => handleResolve(breach.id)}
                                                className="px-4 py-2 bg-slate-100 dark:bg-unizy-navy hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-lg transition-colors"
                                            >
                                                Mark Handled
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
