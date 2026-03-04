'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import ThemeLangControls from '@/components/ThemeLangControls';

export default function DriverClient({ settlements, dbOrders = [], driverName = 'Driver' }) {
    const { dict } = useLanguage();
    const t = dict?.driver || {};
    const [isOnline, setIsOnline] = useState(false);

    // Calculate real earnings from settlements
    const totalEarnings = settlements.reduce((sum, s) => sum + s.netAmount, 0);

    const stats = [
        { label: "Total Earnings", value: `EGP ${totalEarnings}`, icon: "💰" },
        { label: "Settlements", value: settlements.length.toString(), icon: "🧾" },
        { label: "Rating", value: "4.9", icon: "⭐" },
    ];

    const toggleOnline = () => {
        setIsOnline(!isOnline);
    };

    // Orders state
    const [orders, setOrders] = useState(dbOrders);
    const [actionLoading, setActionLoading] = useState(null);

    // Split orders into available (READY, unassigned) and my orders (assigned to me)
    const availableOrders = orders.filter(o => o.status === 'READY' && !o.driverId);
    const myOrders = orders.filter(o => o.driverId); // assigned to this driver

    // Refresh orders every 10 seconds when online
    const refreshOrders = useCallback(async () => {
        try {
            const { getDriverOrders } = await import('@/app/actions/orders');
            const result = await getDriverOrders();
            if (Array.isArray(result)) {
                setOrders(result);
            }
        } catch (_) { /* silent */ }
    }, []);

    useEffect(() => {
        if (!isOnline) return;
        const interval = setInterval(refreshOrders, 10000);
        return () => clearInterval(interval);
    }, [isOnline, refreshOrders]);

    // Accept order (READY → PICKED_UP)
    const handleAccept = async (orderId) => {
        setActionLoading(orderId);
        try {
            const { acceptOrder } = await import('@/app/actions/orders');
            const result = await acceptOrder(orderId);
            if (result.success) {
                await refreshOrders();
            } else {
                alert(result.error || 'Failed to accept order');
            }
        } catch (e) {
            console.error('Accept failed:', e);
        }
        setActionLoading(null);
    };

    // Mark DELIVERED (PICKED_UP → DELIVERED)
    const handleDeliver = async (orderId) => {
        setActionLoading(orderId);
        try {
            const { updateOrderStatus } = await import('@/app/actions/orders');
            const result = await updateOrderStatus(orderId, 'DELIVERED');
            if (result.success) {
                await refreshOrders();
            } else {
                alert(result.error || 'Failed to mark as delivered');
            }
        } catch (e) {
            console.error('Deliver failed:', e);
        }
        setActionLoading(null);
    };

    const getItemsSummary = (order) => {
        if (order.orderItems && order.orderItems.length > 0) {
            return order.orderItems.map(i => `${i.nameSnapshot} x${i.qty}`).join(', ');
        }
        try {
            const details = JSON.parse(order.details || '{}');
            return details.items?.join(', ') || `Order #${order.id.slice(-4)}`;
        } catch { return `Order #${order.id.slice(-4)}`; }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-unizy-navy transition-colors pb-24">

            {/* Driver Top Header */}
            <header className="bg-white dark:bg-unizy-dark px-6 py-6 shadow-sm border-b border-gray-100 dark:border-white/5 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
                        D
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">Driver Hub</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {driverName} • {isOnline ? '● Online & Searching' : '○ Offline'}
                        </p>
                    </div>
                </div>
                <ThemeLangControls />
            </header>

            <main className="px-6 py-8 max-w-lg mx-auto w-full flex flex-col gap-6">

                {/* Status Toggle Card */}
                <div className={`p-8 rounded-[2.5rem] shadow-xl transition-all duration-500 flex flex-col items-center gap-6 border-4 ${isOnline ? 'bg-brand-600 border-brand-400/30' : 'bg-white dark:bg-unizy-dark border-transparent shadow-gray-200/50 dark:shadow-none'}`}>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-transform duration-700 ${isOnline ? 'bg-white scale-110' : 'bg-gray-100 dark:bg-unizy-navy/50'}`}>
                        {isOnline ? '🚖' : '💤'}
                    </div>
                    <div className="text-center">
                        <h2 className={`text-2xl font-black mb-2 transition-colors ${isOnline ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                            {isOnline ? 'You are Online' : 'You are Offline'}
                        </h2>
                        <p className={`text-sm font-medium ${isOnline ? 'text-brand-100' : 'text-gray-400'}`}>
                            {isOnline ? `${availableOrders.length} orders available for pickup` : 'Tap to start earning today'}
                        </p>
                    </div>
                    <button
                        onClick={toggleOnline}
                        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isOnline ? 'bg-white text-brand-600 hover:bg-gray-100' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20'}`}
                    >
                        {isOnline ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-unizy-dark p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center text-center">
                            <span className="text-xl mb-2">{stat.icon}</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">{stat.label}</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white leading-none whitespace-nowrap">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Available Orders (READY, waiting for driver) */}
                {isOnline && availableOrders.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                            Available for Pickup ({availableOrders.length})
                        </h3>
                        {availableOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-6 shadow-xl border-2 border-brand-500/30 relative overflow-hidden group hover:shadow-2xl transition-all">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000"></div>
                                <div className="flex justify-between items-start mb-4 relative">
                                    <div>
                                        <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                                            Ready for Pickup
                                        </span>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                                            {order.user?.name || 'Customer'}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-brand-600 dark:text-brand-400">EGP {order.total}</p>
                                        <p className="font-mono text-[10px] font-bold text-gray-400">#{order.id.slice(-6)}</p>
                                    </div>
                                </div>

                                <div className="mb-6 p-3 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl relative">
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{getItemsSummary(order)}</p>
                                </div>

                                <button
                                    disabled={actionLoading === order.id}
                                    onClick={() => handleAccept(order.id)}
                                    className="w-full py-4 rounded-xl font-bold text-sm bg-brand-600 text-white hover:bg-brand-700 shadow-xl shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {actionLoading === order.id ? 'Accepting...' : '🚀 Accept & Pick Up'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* My Active Orders (assigned to this driver) */}
                {myOrders.length > 0 && (
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                            My Active Orders ({myOrders.filter(o => o.status !== 'DELIVERED').length})
                        </h3>
                        {myOrders.filter(o => o.status !== 'DELIVERED').map(order => (
                            <div key={order.id} className="bg-white dark:bg-unizy-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${order.status === 'PICKED_UP' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {order.status === 'PICKED_UP' ? 'In Transit' : order.status}
                                        </span>
                                        <h4 className="font-black text-gray-900 dark:text-white leading-tight mt-2">{order.user?.name || 'Customer'}</h4>
                                    </div>
                                    <p className="font-black text-gray-900 dark:text-white">EGP {order.total}</p>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">{getItemsSummary(order)}</p>

                                {order.user?.phone && (
                                    <p className="text-xs text-gray-400 mb-4">📞 {order.user.phone}</p>
                                )}

                                {order.status === 'PICKED_UP' && (
                                    <button
                                        disabled={actionLoading === order.id}
                                        onClick={() => handleDeliver(order.id)}
                                        className="w-full py-4 rounded-xl font-bold text-sm bg-green-500 text-white hover:bg-green-600 shadow-xl shadow-green-500/20 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {actionLoading === order.id ? 'Processing...' : '✅ Mark as Delivered'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Delivered Orders History */}
                {myOrders.filter(o => o.status === 'DELIVERED').length > 0 && (
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                            Delivered Today ({myOrders.filter(o => o.status === 'DELIVERED').length})
                        </h3>
                        <div className="space-y-3">
                            {myOrders.filter(o => o.status === 'DELIVERED').slice(0, 5).map(o => (
                                <div key={o.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{o.user?.name || 'Customer'}</p>
                                        <p className="text-xs text-gray-400">EGP {o.total}</p>
                                    </div>
                                    <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-md">Delivered</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Settlements (when offline or no orders) */}
                {(!isOnline || (availableOrders.length === 0 && myOrders.length === 0)) && (
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">Recent Settlements</h3>
                        <div className="space-y-6">
                            {settlements.length === 0 ? (
                                <p className="text-sm text-gray-500">No earnings recorded yet.</p>
                            ) : settlements.map(s => (
                                <div key={s.id} className="flex justify-between items-center border-b border-gray-50 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${s.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>
                                            {s.status === 'PAID' ? '✅' : '⏳'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Payout {s.status}</p>
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(s.periodStart).toLocaleDateString()} - {new Date(s.periodEnd).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-black text-gray-900 dark:text-white text-sm">+EGP {s.netAmount}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
