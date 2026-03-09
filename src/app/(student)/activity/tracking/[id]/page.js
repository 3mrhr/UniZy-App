'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { pollOrderStatus } from '@/app/actions/orders';
import { approveCustomPrice } from '@/app/actions/delivery';
import {
    Clock,
    MapPin,
    Bike,
    Package,
    CheckCircle2,
    ChevronRight,
    ShieldCheck,
    Phone,
    Info,
    AlertCircle,
    ShoppingBag,
    Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
    { id: 'PENDING', label: 'Preparing', icon: <Package size={18} /> },
    { id: 'ACCEPTED', label: 'Accepted', icon: <ShieldCheck size={18} /> },
    { id: 'PICKED_UP', label: 'Picked Up', icon: <ShoppingBag size={18} /> },
    { id: 'IN_TRANSIT', label: 'On the Way', icon: <Bike size={18} /> },
    { id: 'DELIVERED', label: 'Arrived', icon: <CheckCircle2 size={18} /> }
];

export default function TrackingPage({ params }) {
    const { id } = params;
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // Mock 15 mins
    const [isLoading, setIsLoading] = useState(true);
    const [isApproving, setIsApproving] = useState(false);

    const fetchStatus = async () => {
        const res = await pollOrderStatus(id);
        if (res.success) {
            setOrder(res.order);
        } else {
            // Might be a custom delivery
            // For now, let's assume it's standard or handle both
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleApprovePrice = async () => {
        setIsApproving(true);
        const res = await approveCustomPrice(id);
        if (res.success) {
            toast.success('Price Approved! Courier is on the way.');
            fetchStatus();
        } else {
            toast.error(res.error || 'Failed to approve price.');
        }
        setIsApproving(false);
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-unizy-navy font-black text-brand-600 animate-pulse uppercase tracking-widest text-xs italic">Syncing Logistics...</div>;

    if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-400">Request not found</div>;

    const currentStepIndex = STEPS.findIndex(s => s.id === order.status) || 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32">

            {/* High-Fidelity Header */}
            <div className="bg-white dark:bg-unizy-dark px-6 pt-12 pb-8 shadow-sm border-b border-gray-100 dark:border-white/5">
                <div className="max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-gray-50"><ChevronRight size={18} className="rotate-180" /></button>
                        <div className="text-center">
                            <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Live Tracking</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Order #{id.slice(0, 8)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-500"><Info size={18} /></div>
                    </div>

                    <div className="bg-brand-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-brand-600/30">
                        <div className="relative z-10">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">Estimated Arrival</p>
                                    <div className="text-5xl font-black tracking-tighter">{formatTime(timeLeft)}</div>
                                </div>
                                <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <Bike size={32} className="animate-bounce" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                YOUR COURIER IS {order.status.replace('_', ' ')}
                            </div>
                        </div>
                        {/* Decorative dynamic waves/lines */}
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    </div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto px-6 mt-10">

                {/* Progress Stepper */}
                <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm mb-6">
                    <div className="flex justify-between relative px-2">
                        {/* Connecting Line */}
                        <div className="absolute top-6 left-8 right-8 h-0.5 bg-gray-100 dark:bg-white/5 -z-0" />
                        <div
                            className="absolute top-6 left-8 h-0.5 bg-brand-600 transition-all duration-1000 -z-0"
                            style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 90}%` }}
                        />

                        {STEPS.map((step, idx) => {
                            const isActive = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-gray-50 dark:bg-unizy-navy text-gray-300'}`}>
                                        {step.icon}
                                    </div>
                                    <span className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-300'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Negotiation / Action Box */}
                {order.status === 'PREPARING' && !order.transactionId && (
                    <div className="bg-orange-50 dark:bg-orange-900/10 rounded-[2.5rem] p-8 border-2 border-orange-200 dark:border-orange-500/20 mb-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-600/20">
                                <AlertCircle size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-orange-950 dark:text-orange-200 tracking-tight">Price Negotiation Required</h3>
                                <p className="text-xs font-bold text-orange-700 dark:text-orange-400 opacity-80 mt-1 uppercase tracking-wider">Courier has set the actual item cost.</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-unizy-navy/50 rounded-2xl p-6 mb-8 flex justify-between items-center border border-orange-100 dark:border-orange-500/10">
                            <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Items Cost</div>
                                <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{order.total} <span className="text-sm font-bold opacity-30 tracking-normal ml-1">EGP</span></div>
                            </div>
                            <button className="text-xs font-bold text-brand-600 flex items-center gap-2">View Detail <ChevronRight size={14} /></button>
                        </div>
                        <button
                            onClick={handleApprovePrice}
                            disabled={isApproving}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isApproving ? 'Processing...' : 'Approve & Pay (E-Wallet)'}
                        </button>
                    </div>
                )}

                {/* Courier Info / OTP Section */}
                {order.driver && (
                    <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-white/5 overflow-hidden border-2 border-white dark:border-unizy-dark shadow-sm">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${order.driver.name}`} alt="Courier" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Courier</div>
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{order.driver.name}</h3>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase italic">
                                            <ShieldCheck size={10} fill="currentColor" />
                                            Verified Logistics Partner
                                        </div>
                                        {order.driverTrustScore && (
                                            <div className="flex items-center gap-2">
                                                <div className="h-1 w-24 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${order.driverTrustScore}%` }} />
                                                </div>
                                                <span className="text-[9px] font-black text-brand-500 uppercase">{order.driverTrustScore}% Reliability</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a href={`tel:${order.driver.phone}`} className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center hover:bg-brand-100 transition-colors"><Phone size={20} /></a>
                                <button className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-unizy-navy text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors text-xs font-black"><Send size={18} /></button>
                            </div>
                        </div>

                        {/* OTP Protection Box */}
                        <div className="bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl p-6 border-2 border-dashed border-gray-200 dark:border-white/10 text-center">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3">Confirmation Code</p>
                            <div className="flex justify-center gap-3">
                                {order.deliveryOTP.split('').map((char, i) => (
                                    <div key={i} className="w-10 h-10 rounded-xl bg-white dark:bg-unizy-dark border border-gray-100 dark:border-white/10 flex items-center justify-center text-xl font-black text-gray-900 dark:text-white shadow-sm">
                                        {char}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-4">Required upon delivery only. Do not share prematurely.</p>
                        </div>
                    </div>
                )}

                {/* Dropoff Address */}
                <div className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600"><MapPin size={18} /></div>
                        <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dropoff Point</div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{JSON.parse(order.details).dropoff || 'Assiut University Campus'}</p>
                            {(order.dropoffLat && order.dropoffLng) && (
                                <p className="text-[10px] font-bold text-brand-600 uppercase mt-1">📍 Precision Coordinates Active</p>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
