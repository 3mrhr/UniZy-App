"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Power, Search, LayoutDashboard } from 'lucide-react';
import { getZones, createZone, toggleZone } from '@/app/actions/pricing';

export default function ZonesManagementPage() {
    const [zones, setZones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', city: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        setIsLoading(true);
        const res = await getZones();
        if (res.success) {
            setZones(res.data);
        }
        setIsLoading(false);
    };

    const handleCreateZone = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const res = await createZone(formData);
        if (res.success) {
            setFormData({ name: '', city: '' });
            setShowForm(false);
            fetchZones(); // Refresh the list
        } else {
            setError(res.error || 'Failed to create zone');
        }
        setIsSubmitting(false);
    };

    const handleToggleZone = async (zoneId, currentState) => {
        if (!confirm(`Are you sure you want to ${currentState ? 'disable' : 'enable'} this zone? This affects regional pricing rules.`)) return;

        const res = await toggleZone(zoneId, !currentState);
        if (res.success) {
            setZones(zones.map(z => z.id === zoneId ? { ...z, isActive: !currentState } : z));
        } else {
            alert(res.error || 'Failed to toggle zone status');
        }
    };

    const filteredZones = zones.filter(z =>
        z.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (z.city && z.city.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-8 h-8 text-brand-600" />
                        Zone Management
                    </h1>
                    <p className="text-gray-500 mt-1">Define geographical regions for module pricing variations.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-500/30 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Zone
                </button>
            </div>

            {/* Quick Stats / Search */}
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="flex-1 flex gap-4 w-full">
                    <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Zones</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{zones.filter(z => z.isActive).length}</p>
                    </div>
                </div>

                <div className="relative w-full md:max-w-md">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search zones by name or city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                    />
                </div>
            </div>

            {/* Create Zone Form (Collapsible) */}
            {showForm && (
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-black mb-4 dark:text-white">Create New Zone</h2>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg rounded-l-none border-l-4 border-red-500">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleCreateZone} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Zone Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Cairo Metro"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">City</label>
                            <input
                                type="text"
                                placeholder="e.g. Cairo"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full md:w-auto px-6 py-2 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition disabled:opacity-50 h-[42px]"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Zone'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Zones Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-4"></div>
                    <p className="font-bold text-gray-500">Loading tracking zones...</p>
                </div>
            ) : filteredZones.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">No zones found</h3>
                    <p className="text-gray-500 mt-1">Create a physical zone to restrict pricing rules to a region.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredZones.map((zone) => (
                        <div key={zone.id} className="bg-white dark:bg-[#1E293B] rounded-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col hover:border-brand-200 dark:hover:border-brand-800 transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-black text-lg text-gray-900 dark:text-white line-clamp-1">{zone.name}</h3>
                                    {zone.city && <p className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-1">
                                        <LayoutDashboard className="w-3.5 h-3.5" /> {zone.city}
                                    </p>}
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full tracking-wider ${zone.isActive
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30'
                                        : 'bg-red-50 text-red-600 dark:bg-red-900/30'
                                    }`}>
                                    {zone.isActive ? 'Active' : 'Disabled'}
                                </span>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                                <span className="text-xs text-gray-400">Created: {new Date(zone.createdAt).toLocaleDateString()}</span>
                                <button
                                    onClick={() => handleToggleZone(zone.id, zone.isActive)}
                                    className={`p-2 rounded-lg transition-colors group ${zone.isActive
                                            ? 'bg-red-50 hover:bg-red-100 text-red-500 dark:bg-red-900/10 dark:hover:bg-red-900/30'
                                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-500 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/30'
                                        }`}
                                    title={zone.isActive ? 'Disable Zone' : 'Enable Zone'}
                                >
                                    <Power className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
