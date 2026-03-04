'use client';

import React, { useState, useEffect } from 'react';
import { Send, Plus, Clock, CheckCircle, Users, Filter, Megaphone } from 'lucide-react';
import { getCampaigns, createCampaign, sendCampaign } from '@/app/actions/campaigns';

export default function AdminCampaignsPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', targetRole: '', targetUni: '' });

    useEffect(() => {
        const fetchCampaigns = async () => {
            setIsLoading(true);
            try {
                const res = await getCampaigns();
                if (res.campaigns) setCampaigns(res.campaigns);
            } catch (error) {
                console.error(error);
            }
            setIsLoading(false);
        };
        fetchCampaigns();
    }, []);

    const handleCreate = async () => {
        if (isSubmitting || !form.title || !form.message) return;
        setIsSubmitting(true);
        try {
            const res = await createCampaign({
                ...form,
                targetRole: form.targetRole || null,
                targetUni: form.targetUni || null
            });
            if (res.success && res.campaign) {
                setCampaigns(prev => [res.campaign, ...prev]);
                setForm({ title: '', message: '', targetRole: '', targetUni: '' });
                setShowForm(false);
            } else {
                alert(res.error || 'Failed to create campaign');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save campaign');
        }
        setIsSubmitting(false);
    };

    const handleSend = async (id) => {
        if (!confirm('Are you sure you want to send this campaign to the target audience?')) return;

        const prev = [...campaigns];
        // Optimistic
        setCampaigns(prev.map(c => c.id === id ? { ...c, status: 'SENT', sentAt: new Date().toISOString() } : c));

        try {
            const res = await sendCampaign(id);
            if (!res.success) {
                setCampaigns(prev);
                alert(res.error || 'Failed to send campaign');
            } else {
                // Update with actual recipient count 
                setCampaigns(curr => curr.map(c => c.id === id ? { ...c, recipientCount: res.recipientCount } : c));
                alert(`Campaign sent to ${res.recipientCount} users!`);
            }
        } catch {
            setCampaigns(prev);
        }
    };

    const statusColor = {
        DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
        SCHEDULED: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
        SENT: 'bg-green-100 dark:bg-green-900/20 text-green-600',
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Campaign <span className="text-brand-600">Manager</span></h1>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">Push notifications & promotions</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all">
                    <Plus size={18} /> New Campaign
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 p-8 space-y-4">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Create Campaign</h3>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Title</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Summer Housing Deals" className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Message</label>
                        <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} placeholder="Write the notification body..." className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Target Audience</label>
                            <select value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold appearance-none cursor-pointer">
                                <option value="">All Users</option>
                                <option value="STUDENT">Students Only</option>
                                <option value="DRIVER">Drivers Only</option>
                                <option value="MERCHANT">Merchants Only</option>
                                <option value="PROVIDER">Providers Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">University</label>
                            <select value={form.targetUni} onChange={e => setForm({ ...form, targetUni: e.target.value })} className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold appearance-none cursor-pointer">
                                <option value="">All Universities</option>
                                <option value="Assiut University">Assiut University</option>
                                <option value="Sphinx University">Sphinx University</option>
                                <option value="Badari University">Badari University</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <button onClick={handleCreate} disabled={isSubmitting} className="px-6 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all disabled:opacity-50">
                            {isSubmitting ? 'Saving...' : 'Save as Draft'}
                        </button>
                        <button onClick={() => setShowForm(false)} disabled={isSubmitting} className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
                    </div>
                </div>
            )}

            {/* Campaign List */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <Megaphone className="text-brand-500" size={20} />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">All Campaigns</h3>
                    <span className="ml-auto text-xs font-bold text-gray-400">{campaigns.length} total</span>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500 font-bold">Loading campaigns...</div>
                    ) : campaigns.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 font-bold">No campaigns created yet.</div>
                    ) : campaigns.map((c) => (
                        <div key={c.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-gray-900 dark:text-white">{c.title}</h4>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${statusColor[c.status]}`}>{c.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{c.message}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-bold">
                                        {c.targetRole && <span className="flex items-center gap-1"><Filter size={10} /> {c.targetRole}</span>}
                                        {c.targetUni && <span className="flex items-center gap-1"><Filter size={10} /> {c.targetUni}</span>}
                                        {c.recipientCount > 0 && <span className="flex items-center gap-1"><Users size={10} /> {c.recipientCount} recipients</span>}
                                        {c.sentAt && <span className="flex items-center gap-1"><CheckCircle size={10} /> Sent {new Date(c.sentAt).toLocaleDateString()}</span>}
                                        {c.scheduledAt && <span className="flex items-center gap-1"><Clock size={10} /> Scheduled {new Date(c.scheduledAt).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                                {c.status === 'DRAFT' && (
                                    <button onClick={() => handleSend(c.id)} className="flex items-center gap-2 px-4 py-2.5 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl font-bold text-sm hover:bg-green-200 transition-all shrink-0">
                                        <Send size={14} /> Send Now
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
