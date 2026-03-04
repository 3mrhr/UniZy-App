"use client";

import { useState, useEffect } from "react";
import { getSLARules, createSLARule, updateSLARule, deleteSLARule } from "@/app/actions/sla";
import { toast } from "react-hot-toast";
import { Plus, Settings2, Trash2, Power, Briefcase, Truck, Home, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function SLAAdminRulesPage() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [showModal, setShowModal] = useState(false);
    const [module, setModule] = useState("DELIVERY");
    const [metric, setMetric] = useState("ASSIGNMENT_TIME");
    const [thresholdMinutes, setThresholdMinutes] = useState("");
    const [breachAction, setBreachAction] = useState("ALERT_ADMIN");

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        setLoading(true);
        const res = await getSLARules();
        if (res?.success) {
            setRules(res.rules);
        } else {
            toast.error("Failed to load rules");
        }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!thresholdMinutes) return toast.error("Please provide a threshold.");

        const res = await createSLARule({ module, metric, thresholdMinutes: parseInt(thresholdMinutes), breachAction });
        if (res?.success) {
            toast.success("Rule created!");
            setShowModal(false);
            setThresholdMinutes("");
            await fetchRules();
        } else {
            toast.error(res?.error || "Error creating rule");
        }
    };

    const handleToggle = async (id, currentStatus) => {
        const res = await updateSLARule(id, { active: !currentStatus });
        if (res?.success) {
            toast.success(`Rule ${!currentStatus ? 'activated' : 'deactivated'}`);
            await fetchRules();
        } else {
            toast.error("Error toggling rule");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this rule completely? Open breaches will be unhandled.")) return;
        const res = await deleteSLARule(id);
        if (res?.success) {
            toast.success("Rule deleted");
            await fetchRules();
        }
    };

    const getModuleIcon = (mod) => {
        switch (mod) {
            case 'DELIVERY': return <Briefcase size={20} className="text-orange-500" />;
            case 'TRANSPORT': return <Truck size={20} className="text-blue-500" />;
            case 'HOUSING': return <Home size={20} className="text-green-500" />;
            default: return <HelpCircle size={20} className="text-gray-500" />;
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">SLA Configuration</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Define automated Time-to-Action Service Level Agreements.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/sla/breaches" className="px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl font-bold transition-all flex items-center gap-2">
                        View Active Breaches
                    </Link>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all flex items-center gap-2"
                    >
                        <Plus size={18} /> New SLA Rule
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-unizy-dark rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 p-8">
                {loading ? (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-bold">Loading configurations...</div>
                ) : rules.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-unizy-navy rounded-2xl flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                            <Settings2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No SLA Rules Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first rule to start monitoring operational performance.</p>
                        <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-xl font-bold hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors">
                            Configure Setup
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rules.map((rule) => (
                            <div key={rule.id} className={`p-6 rounded-3xl border-2 transition-all ${rule.active ? 'border-brand-50 dark:border-brand-900/30 bg-white dark:bg-unizy-dark' : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-unizy-navy/50 opacity-70'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${rule.active ? 'bg-brand-50 dark:bg-brand-900/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                            {getModuleIcon(rule.module)}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500">{rule.module}</span>
                                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                                                {rule.metric.replace('_', ' ')}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="my-6">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">{rule.thresholdMinutes}</span>
                                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">mins limit</span>
                                    </div>
                                    <div className="text-sm font-bold flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        Action target: <span className="text-slate-900 dark:text-white">{rule.breachAction.replace('_', ' ')}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                        {rule._count.breaches} active violations
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleToggle(rule.id, rule.active)}
                                            className={`p-2 rounded-lg transition-colors ${rule.active ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-200'}`}
                                            title={rule.active ? "Deactivate" : "Activate"}
                                        >
                                            <Power size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(rule.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <form onSubmit={handleCreate} className="bg-white dark:bg-unizy-dark rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-fade-in-up">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">New SLA Rule</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Module</label>
                                <select value={module} onChange={e => setModule(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 rounded-xl font-bold text-slate-900 outline-none">
                                    <option value="DELIVERY">Delivery</option>
                                    <option value="TRANSPORT">Transport</option>
                                    <option value="HOUSING">Housing</option>
                                    <option value="SUPPORT">Support</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Metric Check</label>
                                <select value={metric} onChange={e => setMetric(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 rounded-xl font-bold text-slate-900 outline-none">
                                    <option value="ASSIGNMENT_TIME">Assignment Time (Pending → Assigned)</option>
                                    <option value="COMPLETION_TIME">Completion Time (Overall Limit)</option>
                                    <option value="RESPONSE_TIME">Response Time (Tickets/Chat)</option>
                                    <option value="PICKUP_TIME">Pickup Time (Assigned → Working)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Threshold (Minutes)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={thresholdMinutes}
                                    onChange={e => setThresholdMinutes(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 rounded-xl font-bold text-slate-900 outline-none"
                                    placeholder="e.g. 15"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Breach Action</label>
                                <select value={breachAction} onChange={e => setBreachAction(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-500 rounded-xl font-bold text-slate-900 outline-none">
                                    <option value="ALERT_ADMIN">Alert Admin Only</option>
                                    <option value="AUTO_CANCEL">Auto Cancel Order/Ride</option>
                                    <option value="ESCALATE_AND_REASSIGN">Escalate & Prompt Reassignment</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button type="submit" className="flex-1 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2">
                                Save Rule
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
