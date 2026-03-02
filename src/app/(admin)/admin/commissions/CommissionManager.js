"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Power, MapPin, Percent, TrendingUp, Search } from 'lucide-react';
import { getCommissionRules, createCommissionRule, toggleCommissionRule } from '@/app/actions/commissions';
import { getZones } from '@/app/actions/pricing';

export default function CommissionManager({ moduleName, title, description, colorClass = "bg-brand-600" }) {
    const [rules, setRules] = useState([]);
    const [zones, setZones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        providerType: '',
        unizySharePercent: '',
        providerSharePercent: '',
        zoneId: '',
    });
    const [error, setError] = useState('');

    // Provider types map by module
    const providerTypesMap = {
        'HOUSING': ['LANDLORD', 'PROPERTY_MANAGER', 'AGENT'],
        'TRANSPORT': ['DRIVER', 'FLEET_OWNER'],
        'DELIVERY': ['MERCHANT', 'DRIVER'],
        'DEALS': ['MERCHANT'],
        'MEALS': ['RESTAURANT', 'DRIVER'],
        'SERVICES': ['PROVIDER'],
        'CLEANING': ['CLEANER', 'AGENCY']
    };

    const availableProviderTypes = providerTypesMap[moduleName] || ['PROVIDER'];

    useEffect(() => {
        fetchData();
    }, [moduleName]);

    const fetchData = async () => {
        setIsLoading(true);
        const [rulesRes, zonesRes] = await Promise.all([
            getCommissionRules(moduleName),
            getZones()
        ]);

        if (rulesRes.success) setRules(rulesRes.data);
        if (zonesRes.success) setZones(zonesRes.data.filter(z => z.isActive));

        setIsLoading(false);
    };

    // Auto-calculate remaining share
    const handleUnizyShareChange = (e) => {
        const val = parseFloat(e.target.value);
        if (isNaN(val)) {
            setFormData({ ...formData, unizySharePercent: e.target.value, providerSharePercent: '' });
        } else if (val >= 0 && val <= 100) {
            setFormData({ ...formData, unizySharePercent: e.target.value, providerSharePercent: (100 - val).toFixed(2) });
        }
    };

    const handleProviderShareChange = (e) => {
        const val = parseFloat(e.target.value);
        if (isNaN(val)) {
            setFormData({ ...formData, providerSharePercent: e.target.value, unizySharePercent: '' });
        } else if (val >= 0 && val <= 100) {
            setFormData({ ...formData, providerSharePercent: e.target.value, unizySharePercent: (100 - val).toFixed(2) });
        }
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        setError('');

        const unizy = parseFloat(formData.unizySharePercent);
        const provider = parseFloat(formData.providerSharePercent);

        if (unizy + provider !== 100) {
            setError('Revenue split must equal 100%');
            return;
        }

        setIsSubmitting(true);

        const res = await createCommissionRule({
            module: moduleName,
            providerType: formData.providerType,
            unizySharePercent: unizy,
            providerSharePercent: provider,
            zoneId: formData.zoneId || null
        });

        if (res.success) {
            setFormData({ providerType: '', unizySharePercent: '', providerSharePercent: '', zoneId: '' });
            setShowForm(false);
            fetchData();
        } else {
            setError(res.error || 'Failed to create commission rule');
        }
        setIsSubmitting(false);
    };

    const handleToggleRule = async (ruleId, currentState) => {
        if (!confirm(`Are you sure you want to ${currentState ? 'disable' : 'enable'} this commission tier?`)) return;

        const res = await toggleCommissionRule(ruleId, !currentState, moduleName);
        if (res.success) {
            setRules(rules.map(r => r.id === ruleId ? { ...r, isActive: !currentState } : r));
        } else {
            alert(res.error || 'Failed to toggle rule');
        }
    };

    const filteredRules = rules.filter(r =>
        r.providerType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.zone?.name && r.zone.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <Percent className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
                        {title || `${moduleName} Revenue Splits`}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{description || `Manage percentage-based revenue sharing for ${moduleName.toLowerCase()}.`}</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-4 py-2 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2 ${colorClass} hover:opacity-90`}
                >
                    <Plus className="w-5 h-5" />
                    New Rule
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-black mb-4 dark:text-white">Configure New Revenue Split</h3>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-bold rounded-lg border-l-4 border-red-500">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreateRule} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Provider Type <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={formData.providerType}
                                onChange={e => setFormData({ ...formData, providerType: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            >
                                <option value="">Select Target...</option>
                                {availableProviderTypes.map(type => (
                                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">UniZy Share (%) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                required
                                min="0" max="100" step="0.1"
                                placeholder="e.g. 15.0"
                                value={formData.unizySharePercent}
                                onChange={handleUnizyShareChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Provider Share (%) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                required
                                min="0" max="100" step="0.1"
                                placeholder="e.g. 85.0"
                                value={formData.providerSharePercent}
                                onChange={handleProviderShareChange}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Geofence (Zone)</label>
                            <select
                                value={formData.zoneId}
                                onChange={e => setFormData({ ...formData, zoneId: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                            >
                                <option value="">Global (All Regions)</option>
                                {zones.map(z => (
                                    <option key={z.id} value={z.id}>{z.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full px-6 py-2 text-white font-bold rounded-xl transition-colors disabled:opacity-50 h-[42px] ${colorClass} hover:opacity-90`}
                            >
                                {isSubmitting ? 'Saving...' : 'Add Split'}
                            </button>
                        </div>
                    </form>
                    <p className="text-xs text-gray-500 mt-3 flex items-center gap-1"><TrendingUp className="w-3" /> Note: Creating a new rule will automatically archive older active rules governing the same provider and zone to keep history intact.</p>
                </div>
            )}

            {/* List & Search */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter timeline..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white dark:bg-[#1E293B] border-b border-gray-100 dark:border-gray-800">
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Provider Type</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Revenue Split (UniZy vs Provider)</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Zone / Region</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Effective Date</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        Loading commission timeline...
                                    </td>
                                </tr>
                            ) : filteredRules.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No commission rules configured for this module.
                                    </td>
                                </tr>
                            ) : (
                                filteredRules.map((rule) => (
                                    <tr key={rule.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${!rule.isActive ? 'opacity-60' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full tracking-wider ${rule.isActive
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {rule.isActive ? 'Active' : 'Archived'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                {rule.providerType.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                <div className="text-sm font-black text-brand-600 dark:text-brand-400 w-12">{rule.unizySharePercent}%</div>
                                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                                    <div className="h-full bg-brand-500" style={{ width: `${rule.unizySharePercent}%` }}></div>
                                                    <div className="h-full bg-gray-400" style={{ width: `${rule.providerSharePercent}%` }}></div>
                                                </div>
                                                <div className="text-sm font-black text-gray-500 w-12 text-right">{rule.providerSharePercent}%</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {rule.zone ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 text-xs font-bold uppercase">
                                                    <MapPin className="w-3" />
                                                    {rule.zone.name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-xs font-bold uppercase">
                                                    GLOBAL
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                            {new Date(rule.effectiveDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleToggleRule(rule.id, rule.isActive)}
                                                className={`p-1.5 rounded-lg transition-colors inline-block ${rule.isActive
                                                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700'
                                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-500 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/30'
                                                    }`}
                                                title={rule.isActive ? 'Archive Rule' : 'Reactivate Rule'}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
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
