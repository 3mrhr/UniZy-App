"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Power, DollarSign, MapPin, Search } from 'lucide-react';
import { getPricingRules, createPricingRule, togglePricingRule, getZones } from '@/app/actions/pricing';

export default function PricingManager({ moduleName, title, description, colorClass = "bg-brand-600" }) {
    const [rules, setRules] = useState([]);
    const [zones, setZones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        serviceType: '',
        basePrice: '',
        zoneId: '', // empty means global
    });
    const [error, setError] = useState('');

    // Available service types depend on the module
    const serviceTypesMap = {
        'HOUSING': ['LISTING_FEE', 'COMMISSION_PERCENT', 'FEATURED_LISTING'],
        'TRANSPORT': ['BASE_FARE', 'PER_KM_RATE', 'PLATFORM_FEE', 'RUSH_HOUR_SURCHARGE'],
        'DELIVERY': ['DELIVERY_FEE', 'SERVICE_FEE', 'MERCHANT_COMMISSION'],
        'DEALS': ['PROMO_SUBSIDY', 'FLAT_FEE'],
        'MEALS': ['SUBSCRIPTION_FEE', 'DELIVERY_FEE', 'COMMISSION_PERCENT'],
        'SERVICES': ['BOOKING_FEE', 'PROVIDER_COMMISSION'],
        'CLEANING': ['HOURLY_RATE', 'MATERIAL_SURCHARGE', 'PLATFORM_FEE']
    };

    const availableServiceTypes = serviceTypesMap[moduleName] || ['BASE_FEE', 'COMMISSION'];

    useEffect(() => {
        fetchData();
    }, [moduleName]);

    const fetchData = async () => {
        setIsLoading(true);
        const [rulesRes, zonesRes] = await Promise.all([
            getPricingRules(moduleName),
            getZones()
        ]);

        if (rulesRes.success) setRules(rulesRes.data);
        if (zonesRes.success) setZones(zonesRes.data.filter(z => z.isActive));

        setIsLoading(false);
    };

    const handleCreateRule = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const res = await createPricingRule({
            module: moduleName,
            serviceType: formData.serviceType,
            basePrice: formData.basePrice,
            zoneId: formData.zoneId || null
        });

        if (res.success) {
            setFormData({ serviceType: '', basePrice: '', zoneId: '' });
            setShowForm(false);
            fetchData();
        } else {
            setError(res.error || 'Failed to create pricing rule');
        }
        setIsSubmitting(false);
    };

    const handleToggleRule = async (ruleId, currentState) => {
        if (!confirm(`Are you sure you want to ${currentState ? 'disable' : 'enable'} this pricing rule?`)) return;

        const res = await togglePricingRule(ruleId, !currentState, moduleName);
        if (res.success) {
            setRules(rules.map(r => r.id === ruleId ? { ...r, isActive: !currentState } : r));
        } else {
            alert(res.error || 'Failed to toggle rule');
        }
    };

    const filteredRules = rules.filter(r =>
        r.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.zone?.name && r.zone.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
                        {title || `${moduleName} Pricing`}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{description || `Manage global and regional pricing configuration for ${moduleName.toLowerCase()}.`}</p>
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
                    <h3 className="text-lg font-black mb-4 dark:text-white">Configure New Pricing Rule</h3>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm font-bold rounded-lg border-l-4 border-red-500">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreateRule} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Service Type <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={formData.serviceType}
                                onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            >
                                <option value="">Select Type...</option>
                                {availableServiceTypes.map(type => (
                                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount / % <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="any"
                                placeholder="0.00"
                                value={formData.basePrice}
                                onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Geofence (Zone)</label>
                            <select
                                value={formData.zoneId}
                                onChange={e => setFormData({ ...formData, zoneId: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
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
                                {isSubmitting ? 'Saving...' : 'Add Rule'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List & Search */}
            <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter rules..."
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
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Service Type</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Price / Rate</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Zone</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        Loading pricing rules...
                                    </td>
                                </tr>
                            ) : filteredRules.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No pricing rules configured for this module.
                                    </td>
                                </tr>
                            ) : (
                                filteredRules.map((rule) => (
                                    <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                {rule.serviceType.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                                {rule.serviceType.includes('PERCENT') || rule.serviceType.includes('COMMISSION')
                                                    ? `${rule.basePrice}%`
                                                    : `$${rule.basePrice.toFixed(2)}`}
                                            </span>
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full tracking-wider ${rule.isActive
                                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'
                                                    : 'bg-red-50 text-red-600 dark:bg-red-900/30'
                                                }`}>
                                                {rule.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleToggleRule(rule.id, rule.isActive)}
                                                className={`p-1.5 rounded-lg transition-colors inline-block ${rule.isActive
                                                        ? 'bg-red-50 hover:bg-red-100 text-red-500 dark:bg-red-900/10 dark:hover:bg-red-900/30'
                                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-500 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/30'
                                                    }`}
                                                title={rule.isActive ? 'Disable Rule' : 'Enable Rule'}
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
