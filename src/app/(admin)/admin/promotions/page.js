'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Plus, Tag, Check, X, Clock, Play, Square, Percent, Hash } from 'lucide-react';
import { getPromoCodes, createPromoCode, togglePromoCode } from '@/app/actions/promotions';
import toast from 'react-hot-toast';

export default function AdminPromotionsPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';

    const [promos, setPromos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newPromo, setNewPromo] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountAmount: '',
        maxUses: '',
        expiresAt: '',
        applicableType: 'ALL'
    });

    const loadPromos = async () => {
        setIsLoading(true);
        const res = await getPromoCodes();
        if (res.success) {
            setPromos(res.promos);
        } else {
            toast.error(res.error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadPromos();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newPromo.code || !newPromo.discountAmount) return toast.error('Required fields missing');

        const res = await createPromoCode(newPromo);
        if (res.success) {
            toast.success('Promo code created successfully!');
            setIsCreating(false);
            setNewPromo({
                code: '', discountType: 'PERCENTAGE', discountAmount: '', maxUses: '', expiresAt: '', applicableType: 'ALL'
            });
            loadPromos();
        } else {
            toast.error(res.error);
        }
    };

    const handleToggle = async (id, currentStatus) => {
        const res = await togglePromoCode(id, !currentStatus);
        if (res.success) {
            toast.success('Status updated');
            loadPromos();
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                        <Tag size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promotions Engine</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage campus-wide discount codes and campaigns</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-[var(--unizy-primary)] hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={20} />
                    Create Promo Code
                </button>
            </div>

            {isCreating && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-[var(--unizy-primary)]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Promo Code</h2>
                        <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code (e.g. WELCOME20)</label>
                            <input required type="text" value={newPromo.code} onChange={e => setNewPromo({ ...newPromo, code: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 uppercase" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Applicable Module</label>
                            <select value={newPromo.applicableType} onChange={e => setNewPromo({ ...newPromo, applicableType: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                                <option value="ALL">All Modules</option>
                                <option value="DELIVERY">Delivery</option>
                                <option value="TRANSPORT">Transport</option>
                                <option value="HOUSING">Housing</option>
                                <option value="SERVICES">Services</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Type</label>
                            <select value={newPromo.discountType} onChange={e => setNewPromo({ ...newPromo, discountType: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (EGP)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Amount</label>
                            <input required type="number" min="1" value={newPromo.discountAmount} onChange={e => setNewPromo({ ...newPromo, discountAmount: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Uses (0 = unlimited)</label>
                            <input type="number" min="0" value={newPromo.maxUses} onChange={e => setNewPromo({ ...newPromo, maxUses: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Date (Optional)</label>
                            <input type="date" value={newPromo.expiresAt} onChange={e => setNewPromo({ ...newPromo, expiresAt: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2" />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">Cancel</button>
                            <button type="submit" className="px-5 py-2 bg-[var(--unizy-primary)] text-white rounded-xl hover:bg-blue-700">Create Promo</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Code</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Discount</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Module</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Usage</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {isLoading ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading promos...</td></tr>
                            ) : promos.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No promo codes created yet.</td></tr>
                            ) : promos.map((promo) => (
                                <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-mono font-bold border border-orange-100 dark:border-orange-900/50">
                                            {promo.code}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                                            {promo.discountType === 'PERCENTAGE' ? <Percent size={14} className="text-gray-400" /> : <Hash size={14} className="text-gray-400" />}
                                            {promo.discountAmount}{promo.discountType === 'PERCENTAGE' ? '%' : ' EGP'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                            {promo.applicableType}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <span className="font-medium text-gray-900 dark:text-white">{promo.currentUses}</span>
                                            <span className="text-gray-400"> / {promo.maxUses === 0 ? '∞' : promo.maxUses}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {promo.isActive ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded-md">
                                                <Check size={12} /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-md">
                                                <X size={12} /> Disabled
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleToggle(promo.id, promo.isActive)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                                            title={promo.isActive ? "Disable Code" : "Enable Code"}
                                        >
                                            {promo.isActive ? <Square size={18} /> : <Play size={18} />}
                                        </button>
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
