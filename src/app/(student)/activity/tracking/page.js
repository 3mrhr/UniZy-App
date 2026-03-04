'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Circle, Clock, Truck, Package, ChefHat, MapPin, Phone, Star, ChevronLeft, RotateCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MOCK_ORDERS = [
    {
        id: 'ORD-001',
        service: 'DELIVERY',
        title: 'Pizza Palace',
        total: 185,
        status: 'ON_THE_WAY',
        timeline: [
            { step: 'Order Placed', time: '2:15 PM', done: true },
            { step: 'Merchant Accepted', time: '2:18 PM', done: true },
            { step: 'Being Prepared', time: '2:20 PM', done: true },
            { step: 'Rider Picked Up', time: '2:35 PM', done: true },
            { step: 'On The Way', time: '2:37 PM', done: true },
            { step: 'Delivered', time: null, done: false },
        ],
        rider: { name: 'Ahmed K.', phone: '01012345678', rating: 4.8 },
        items: ['Margherita Pizza x1', 'Garlic Bread x2', 'Pepsi x1'],
    },
    {
        id: 'ORD-002',
        service: 'DELIVERY',
        title: 'UniZy Meals',
        total: 65,
        status: 'COMPLETED',
        timeline: [
            { step: 'Order Placed', time: '12:00 PM', done: true },
            { step: 'Merchant Accepted', time: '12:03 PM', done: true },
            { step: 'Being Prepared', time: '12:05 PM', done: true },
            { step: 'Rider Picked Up', time: '12:20 PM', done: true },
            { step: 'On The Way', time: '12:22 PM', done: true },
            { step: 'Delivered', time: '12:35 PM', done: true },
        ],
        items: ['Koshary Special x1'],
    },
];

const STATUS_COLORS = {
    PENDING: 'text-yellow-500',
    ACCEPTED: 'text-blue-500',
    ON_THE_WAY: 'text-brand-600',
    COMPLETED: 'text-green-500',
};

export default function OrderTrackingPage() {
    const router = useRouter();
    const [selectedOrder, setSelectedOrder] = useState(MOCK_ORDERS[0]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 px-4 py-4">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                        <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white">Order Tracking</h1>
                        <p className="text-xs text-gray-500 font-bold">{selectedOrder.id}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
                {/* Order Switcher */}
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                    {MOCK_ORDERS.map((order) => (
                        <button key={order.id} onClick={() => setSelectedOrder(order)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedOrder.id === order.id ? 'bg-brand-600 text-white shadow-lg' : 'bg-white dark:bg-unizy-dark text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-white/5'}`}>
                            {order.title} · {order.id}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Clock size={16} className="text-brand-500" /> Live Status
                    </h2>
                    <div className="space-y-0">
                        {selectedOrder.timeline.map((step, idx) => {
                            const isLast = idx === selectedOrder.timeline.length - 1;
                            return (
                                <div key={step.step} className="flex gap-4">
                                    {/* Dot & Line */}
                                    <div className="flex flex-col items-center">
                                        {step.done ? (
                                            <CheckCircle size={20} className="text-green-500 shrink-0" />
                                        ) : (
                                            <Circle size={20} className="text-gray-300 dark:text-gray-600 shrink-0" />
                                        )}
                                        {!isLast && (
                                            <div className={`w-0.5 h-10 ${step.done ? 'bg-green-300 dark:bg-green-800' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="pb-8">
                                        <p className={`font-bold text-sm ${step.done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.step}</p>
                                        {step.time && <p className="text-xs text-gray-400 font-medium mt-0.5">{step.time}</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Rider Info */}
                {selectedOrder.rider && (
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Truck size={16} className="text-blue-500" /> Your Rider
                        </h2>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center">
                                    <Truck size={20} className="text-brand-600" />
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 dark:text-white">{selectedOrder.rider.name}</p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1"><Star size={10} className="text-yellow-500" /> {selectedOrder.rider.rating}</p>
                                </div>
                            </div>
                            <a href={`tel:${selectedOrder.rider.phone}`} className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl hover:bg-green-100 transition-all">
                                <Phone size={18} />
                            </a>
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Package size={16} className="text-orange-500" /> Items
                    </h2>
                    <ul className="space-y-2">
                        {selectedOrder.items.map((item, i) => (
                            <li key={i} className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full shrink-0"></span> {item}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between">
                        <span className="text-sm font-black text-gray-500">Total</span>
                        <span className="font-black text-brand-600">{selectedOrder.total} EGP</span>
                    </div>
                </div>

                {/* Reorder Button */}
                {selectedOrder.status === 'COMPLETED' && (
                    <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                        <RotateCw size={18} /> Reorder
                    </button>
                )}
            </div>
        </div>
    );
}
