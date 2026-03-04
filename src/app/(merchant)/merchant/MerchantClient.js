'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageProvider';
import ThemeLangControls from '@/components/ThemeLangControls';

export default function MerchantClient({ merchantData }) {
    const { settlements, dbOrders = [], dbMeals = [], dbDeals = [], merchantName = 'Merchant Hub', storeAddress = '', storeDescription = '', storeOpen = false } = merchantData;
    const { dict } = useLanguage();

    const totalRevenue = settlements.reduce((sum, s) => sum + s.netAmount, 0);

    // Map DB statuses to UI display names
    const statusLabel = (s) => {
        const map = { PENDING: 'New', ACCEPTED: 'Accepted', PREPARING: 'Preparing', READY: 'Ready', PICKED_UP: 'Picked Up', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };
        return map[s] || s;
    };

    // Map real orders to UI shape
    const [orders, setOrders] = useState(() =>
        dbOrders.map(o => {
            const itemNames = o.orderItems?.map(i => `${i.nameSnapshot} x${i.qty}`).join(', ') || 'Order';
            return {
                id: o.id,
                item: itemNames,
                customer: o.user?.name || 'Customer',
                status: o.status,
                time: new Date(o.createdAt).toLocaleDateString(),
                price: `EGP ${o.total}`,
            };
        })
    );

    // Map real meals to menu items
    const [menuItems, setMenuItems] = useState(() =>
        dbMeals.map(m => ({
            id: m.id,
            name: m.name,
            available: m.status === 'ACTIVE',
        }))
    );

    // Map real deals
    const [deals] = useState(() =>
        dbDeals.map(d => ({
            id: d.id,
            title: d.title,
            status: d.status === 'ACTIVE' ? 'Active' : 'Paused',
            redemptions: d.reviews || 0,
        }))
    );

    const [isUpdating, setIsUpdating] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        storeName: merchantName,
        storeAddress,
        storeDescription,
        storeOpen
    });

    // DB-backed status update
    const updateStatus = async (id, newStatus) => {
        setIsUpdating(id);
        try {
            const { updateMerchantOrderStatus } = await import('@/app/actions/orders');
            const result = await updateMerchantOrderStatus(id, newStatus);
            if (result.ok) {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            } else {
                alert(result.error?.message || 'Failed to update order status');
            }
        } catch (e) {
            console.error('Failed to update order status:', e);
        }
        setIsUpdating(null);
    };

    const toggleAvailability = (id) => {
        setMenuItems(menuItems.map(m => m.id === id ? { ...m, available: !m.available } : m));
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setIsUpdating('settings');
        try {
            const { updateMerchantSettings } = await import('@/app/actions/merchant');
            const res = await updateMerchantSettings(settingsForm);
            if (res.success || res.ok) {
                alert('Store settings updated successfully.');
                setIsSettingsOpen(false);
            } else {
                alert(res.error?.message || res.error || 'Failed to update settings');
            }
        } catch (error) {
            console.error(error);
        }
        setIsUpdating(null);
    };

    // Refresh orders every 15 seconds
    const refreshOrders = useCallback(async () => {
        try {
            const { getMerchantOrders } = await import('@/app/actions/orders');
            const result = await getMerchantOrders();
            if (result?.success && result.orders) {
                setOrders(result.orders.map(o => {
                    const itemNames = o.orderItems?.map(i => `${i.nameSnapshot} x${i.qty}`).join(', ') || 'Order';
                    return {
                        id: o.id,
                        item: itemNames,
                        customer: o.user?.name || 'Customer',
                        status: o.status,
                        time: new Date(o.createdAt).toLocaleDateString(),
                        price: `EGP ${o.total}`,
                    };
                }));
            }
        } catch (_) { /* silent refresh failure */ }
    }, []);

    useEffect(() => {
        const interval = setInterval(refreshOrders, 15000);
        return () => clearInterval(interval);
    }, [refreshOrders]);

    // Group orders by display status for kanban
    const kanbanColumns = [
        { key: 'PENDING', label: 'New', nextStatus: 'ACCEPTED', nextLabel: 'Accept', color: 'bg-orange-500' },
        { key: 'ACCEPTED', label: 'Accepted', nextStatus: 'PREPARING', nextLabel: 'Start Preparing', color: 'bg-blue-500' },
        { key: 'PREPARING', label: 'Preparing', nextStatus: 'READY', nextLabel: 'Mark Ready', color: 'bg-green-500' },
        { key: 'READY', label: 'Ready for Pickup', nextStatus: null, nextLabel: null, color: null },
    ];

    return (
        <div className="min-h-screen bg-rose-50 dark:bg-unizy-navy transition-colors pb-24">

            {/* Merchant Top Header */}
            <header className="bg-white dark:bg-unizy-dark px-6 py-6 shadow-sm border-b border-gray-100 dark:border-white/5 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-500/20 text-lg">
                        M
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">Merchant Hub</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {merchantName} • {storeOpen ? 'Open' : 'Closed'}
                        </p>
                    </div>
                </div>
                <ThemeLangControls />
            </header>

            <main className="px-6 py-8 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8">

                {/* Left Columns: Live Orders Kanban */}
                <div className="lg:col-span-2 flex flex-col gap-6 animate-fade-in-up">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Live Orders</h2>
                        <button onClick={refreshOrders} className="text-xs font-bold text-brand-600 hover:underline">↻ Refresh</button>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                        {kanbanColumns.map(col => (
                            <div key={col.key} className="flex flex-col gap-4">
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-2xl">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{col.label}</span>
                                    <span className="bg-white dark:bg-unizy-navy px-2 py-0.5 rounded-lg text-xs font-bold shadow-sm">
                                        {orders.filter(o => o.status === col.key).length}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {orders.filter(o => o.status === col.key).map(order => (
                                        <div key={order.id} className="bg-white dark:bg-unizy-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-xs font-bold text-rose-500">#{order.id.slice(-6)}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{order.time}</p>
                                            </div>
                                            <h4 className="font-black text-gray-900 dark:text-white leading-tight mb-1 text-sm">{order.item}</h4>
                                            <p className="text-xs text-gray-500 mb-4">{order.customer}</p>

                                            <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-white/5">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{order.price}</p>
                                                {col.nextStatus && (
                                                    <button
                                                        disabled={isUpdating === order.id}
                                                        onClick={() => updateStatus(order.id, col.nextStatus)}
                                                        className={`px-4 py-2 ${col.color} text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50`}
                                                    >
                                                        {isUpdating === order.id ? '...' : col.nextLabel}
                                                    </button>
                                                )}
                                                {col.key === 'READY' && (
                                                    <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                        Awaiting Driver
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Completed/Picked Up orders summary */}
                    {orders.filter(o => ['PICKED_UP', 'DELIVERED'].includes(o.status)).length > 0 && (
                        <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-widest">
                                Recent Completed ({orders.filter(o => ['PICKED_UP', 'DELIVERED'].includes(o.status)).length})
                            </h3>
                            <div className="space-y-3">
                                {orders.filter(o => ['PICKED_UP', 'DELIVERED'].includes(o.status)).slice(0, 5).map(order => (
                                    <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{order.item}</p>
                                            <p className="text-xs text-gray-500">{order.customer} • {order.time}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {statusLabel(order.status)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Menu Quick Management */}
                <div className="lg:col-span-1 flex flex-col gap-6 animate-fade-in delay-200">
                    <div className="bg-white dark:bg-unizy-dark p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Menu Visibility</h3>
                        <div className="space-y-4">
                            {menuItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-unizy-navy transition-all duration-300">
                                    <p className={`text-sm font-bold ${item.available ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>
                                        {item.name}
                                    </p>
                                    <button
                                        onClick={() => toggleAvailability(item.id)}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${item.available ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${item.available ? 'right-1' : 'left-1'}`}></div>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Link href="/merchant/menu" className="w-full mt-6 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 font-bold text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors block text-center">
                            Manage Full Menu
                        </Link>
                        <button onClick={() => setIsSettingsOpen(true)} className="w-full mt-2 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 font-bold text-xs text-brand-600 dark:text-brand-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors block text-center">
                            Store Settings
                        </button>
                    </div>

                    <div className="bg-white dark:bg-unizy-dark p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 animate-fade-in delay-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Active Deals</h3>
                            <button className="text-xs font-bold text-[var(--unizy-primary)]">+ New</button>
                        </div>
                        <div className="space-y-4">
                            {deals.map(deal => (
                                <div key={deal.id} className="p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{deal.title}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${deal.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{deal.status}</span>
                                    </div>
                                    <p className="text-xs text-gray-500">{deal.redemptions} redemptions</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-8 rounded-[2.5rem] shadow-xl shadow-rose-500/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                        <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest mb-2">Total Earnings</p>
                        <h3 className="text-3xl font-black mb-4">EGP {totalRevenue}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-rose-200 text-xs font-bold">{settlements.length} Settlements</span>
                            <span className="text-rose-200 text-[10px] font-medium">processed</span>
                        </div>
                    </div>
                </div>

            </main>

            {/* Store Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-unizy-dark w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative">
                        <button onClick={() => setIsSettingsOpen(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">✕</button>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Store Settings</h2>

                        <form onSubmit={handleUpdateSettings} className="flex flex-col gap-4">
                            <input required value={settingsForm.storeName} onChange={e => setSettingsForm({ ...settingsForm, storeName: e.target.value })} placeholder="Store Name" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all text-sm" />
                            <input value={settingsForm.storeAddress} onChange={e => setSettingsForm({ ...settingsForm, storeAddress: e.target.value })} placeholder="Store Address" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all text-sm" />
                            <textarea value={settingsForm.storeDescription} onChange={e => setSettingsForm({ ...settingsForm, storeDescription: e.target.value })} placeholder="Description / Bio" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all text-sm resize-none h-24" />

                            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl cursor-pointer">
                                <input type="checkbox" checked={settingsForm.storeOpen} onChange={e => setSettingsForm({ ...settingsForm, storeOpen: e.target.checked })} className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500" />
                                <span className="font-bold text-sm text-gray-900 dark:text-white">Store is Open (Accepting Orders)</span>
                            </label>

                            <button disabled={isUpdating === 'settings'} type="submit" className="w-full py-4 mt-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-500/20 active:scale-95 transition-all">
                                {isUpdating === 'settings' ? 'Saving...' : 'Save Settings'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
