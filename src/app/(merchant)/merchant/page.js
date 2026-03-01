'use client';

import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import ThemeLangControls from '@/components/ThemeLangControls';

export default function MerchantDashboard() {
    const { dict } = useLanguage();

    // Mock orders
    const [orders, setOrders] = useState([
        { id: '101', item: 'Double Beef Burger', customer: 'Omar H.', status: 'New', time: '2 mins ago', price: 'EGP 85' },
        { id: '102', item: 'Crispy Chicken Meal', customer: 'Sara A.', status: 'Preparing', time: '10 mins ago', price: 'EGP 120' },
        { id: '103', item: 'Cheese Fries x2', customer: 'Youssef K.', status: 'Ready', time: '15 mins ago', price: 'EGP 60' },
    ]);

    // Mock menu
    const [menuItems, setMenuItems] = useState([
        { id: 'm1', name: 'Double Beef Burger', available: true },
        { id: 'm2', name: 'Crispy Chicken Meal', available: true },
        { id: 'm3', name: 'Vegan Bowl', available: false },
        { id: 'm4', name: 'Cheese Fries', available: true },
    ]);

    const updateStatus = (id, newStatus) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    };

    const toggleAvailability = (id) => {
        setMenuItems(menuItems.map(m => m.id === id ? { ...m, available: !m.available } : m));
    };

    // Mock Deals
    const [deals, setDeals] = useState([
        { id: 'd1', title: '50% Off Second Burger', status: 'Active', redemptions: 12 },
        { id: 'd2', title: 'Free Drink with Combo', status: 'Paused', redemptions: 45 }
    ]);

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
                            Campus Burgers • Open
                        </p>
                    </div>
                </div>
                <ThemeLangControls />
            </header>

            <main className="px-6 py-8 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8">

                {/* Left Columns: Live Orders Kanban */}
                <div className="lg:col-span-2 flex flex-col gap-6 animate-fade-in-up">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Live Orders</h2>

                    <div className="grid md:grid-cols-3 gap-4">
                        {['New', 'Preparing', 'Ready'].map(status => (
                            <div key={status} className="flex flex-col gap-4">
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-2xl">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{status}</span>
                                    <span className="bg-white dark:bg-unizy-navy px-2 py-0.5 rounded-lg text-xs font-bold shadow-sm">
                                        {orders.filter(o => o.status === status).length}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {orders.filter(o => o.status === status).map(order => (
                                        <div key={order.id} className="bg-white dark:bg-unizy-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <p className="text-xs font-bold text-rose-500">#{order.id}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{order.time}</p>
                                            </div>
                                            <h4 className="font-black text-gray-900 dark:text-white leading-tight mb-1">{order.item}</h4>
                                            <p className="text-xs text-gray-500 mb-4">{order.customer}</p>

                                            <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-white/5">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{order.price}</p>
                                                <div className="flex gap-2">
                                                    {status === 'New' && (
                                                        <button
                                                            onClick={() => updateStatus(order.id, 'Preparing')}
                                                            className="px-4 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors"
                                                        >
                                                            Accept
                                                        </button>
                                                    )}
                                                    {status === 'Preparing' && (
                                                        <button
                                                            onClick={() => updateStatus(order.id, 'Ready')}
                                                            className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-green-600 transition-colors"
                                                        >
                                                            Ready
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
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
                        <button className="w-full mt-6 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 font-bold text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            Manage Full Menu
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
                        <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest mb-2">Today's Revenue</p>
                        <h3 className="text-3xl font-black mb-4">EGP 2,450</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-green-300 text-xs font-bold">↑ 12%</span>
                            <span className="text-rose-200 text-[10px] font-medium">from yesterday</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
