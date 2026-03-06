'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from '@/i18n/LanguageProvider';
import { useRouter } from 'next/navigation';
import { getRideEstimate } from '@/app/actions/orders';
import SOSButton from '@/components/SOSButton';

export default function TransportPage() {
    const { dict } = useLanguage();
    const t = dict?.transport || {};
    const c = dict?.common || {};

    const [pickup, setPickup] = useState('My Current Location');
    const [pickupTouched, setPickupTouched] = useState(false);
    const [destination, setDestination] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('standard');
    const [promoCode, setPromoCode] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    const [vehicles, setVehicles] = useState([
        { id: 'standard', name: t?.vehicles?.standard || 'Standard', price: 'EGP 45', time: '3 min', icon: '🚗' },
        { id: 'premium', name: t?.vehicles?.premium || 'Premium', price: 'EGP 75', time: '5 min', icon: '✨' },
        { id: 'scooter', name: t?.vehicles?.scooter || 'Scooter', price: 'EGP 25', time: '2 min', icon: '🛵' },
        { id: 'bus', name: t?.vehicles?.shuttleBus || 'Shuttle Bus', price: 'EGP 10', time: '12 min', icon: '🚌' },
    ]);

    const [showScheduleLink] = useState(true);

    // Fetch estimates when destination is typed
    useEffect(() => {
        if (destination.length > 3) {
            const fetchEstimates = async () => {
                try {
                    const updated = await Promise.all(vehicles.map(async (v) => {
                        const res = await getRideEstimate(pickup, destination, v.name);
                        return { ...v, price: res.success ? `EGP ${res.price}` : v.price };
                    }));
                    setVehicles(updated);
                } catch (e) {
                    console.error('Failed to fetch estimates:', e);
                }
            };
            const timeoutId = setTimeout(fetchEstimates, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [destination, pickup]);

    const handleBook = async () => {
        if (!destination) return alert('Please enter a destination');
        setIsBooking(true);
        const selected = vehicles.find(v => v.id === selectedVehicle);
        const priceNum = parseFloat(selected.price.replace('EGP ', ''));

        const { createOrder } = await import('@/app/actions/orders');
        const result = await createOrder('TRANSPORT', {
            pickup, destination, vehicle: selected.name
        }, priceNum, promoCode);

        setIsBooking(false);
        if (result.success) {
            router.push(`/activity/tracking/${result.order.id}`);
        } else {
            alert(result.error || 'Failed to book');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-unizy-navy transition-colors duration-300 pb-20 sm:pb-0">

            {/* Header */}
            <header className="px-6 py-8 max-w-7xl mx-auto w-full flex items-center gap-4">
                <Link href="/students" className="w-10 h-10 rounded-full bg-white dark:bg-unizy-dark flex items-center justify-center shadow-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <span className="text-lg">←</span>
                </Link>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{t.title || "Transport"}</h1>
            </header>

            <main className="flex-1 px-6 max-w-xl mx-auto w-full flex flex-col gap-8 pb-24 relative">

                <SOSButton contextData={{
                    location: 'Transport Browsing Page',
                    pickup,
                    destination
                }} />

                {/* Booking Form */}
                <div className="flex flex-col gap-6 animate-slide-up relative z-10">
                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden relative">
                        {/* Decorative Background for Glass effect */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl"></div>

                        <div className="space-y-4 relative z-10">
                            <div className="relative group">
                                <div className="absolute top-1/2 -mt-2 left-5 w-4 h-4 rounded-full border-2 border-brand-500 bg-white dark:bg-unizy-navy group-hover:scale-110 transition-transform"></div>
                                <div className="absolute top-1/2 mt-6 left-[1.375rem] w-[2px] h-10 bg-gray-200 dark:bg-white/10"></div>
                                <input
                                    type="text"
                                    value={pickup}
                                    onFocus={() => { if (!pickupTouched) { setPickup(''); setPickupTouched(true); } }}
                                    onChange={(e) => setPickup(e.target.value)}
                                    className="w-full bg-white/50 dark:bg-white/5 border border-transparent focus:border-brand-500/30 rounded-2xl pl-14 p-4 text-sm font-black focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-gray-900 dark:text-white"
                                    placeholder={t.pickupPoint || "Pickup point"}
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute top-1/2 -mt-2 left-5 w-4 h-4 bg-orange-500 rounded-sm group-hover:rotate-45 transition-transform"></div>
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="w-full bg-white/50 dark:bg-white/5 border border-transparent focus:border-brand-500/30 rounded-2xl pl-14 p-4 text-sm font-black focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-gray-900 dark:text-white"
                                    placeholder={t.whereTo || "Where to?"}
                                />
                            </div>
                            <div className="relative group">
                                <div className="absolute top-1/2 -mt-2 left-5 w-4 h-4 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center font-black text-[10px]">%</div>
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="w-full bg-white/50 dark:bg-white/5 border border-transparent focus:border-brand-500/30 rounded-2xl pl-14 p-4 text-sm font-black focus:ring-4 focus:ring-brand-500/10 transition-all outline-none text-gray-900 dark:text-white uppercase tracking-widest"
                                    placeholder={t.promoCode || "PROMO CODE (OPTIONAL)"}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden relative">
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-6">{t.selectVehicle || "Select Vehicle"}</h3>
                        <div className="space-y-4">
                            {vehicles.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVehicle(v.id)}
                                    className={`w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all duration-500 group ${selectedVehicle === v.id ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/20 shadow-lg shadow-brand-500/10 scale-[1.02]' : 'border-transparent bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-transform group-hover:scale-110 ${selectedVehicle === v.id ? 'bg-brand-500/10' : 'bg-gray-100 dark:bg-white/5'}`}>
                                            {v.icon}
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-black text-gray-900 dark:text-white text-base leading-none mb-1">{v.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{v.time} {t.away || "away"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-brand-600 dark:text-brand-400 text-lg">{v.price}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleBook}
                            disabled={isBooking}
                            className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-6 rounded-2xl mt-8 shadow-xl shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-95 group flex items-center justify-center gap-3 ${isBooking ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            {isBooking ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : null}
                            <span className="uppercase tracking-[0.2em]">{isBooking ? (t.booking || 'Booking...') : `${t.book || 'Book'} ${vehicles.find(v => v.id === selectedVehicle)?.name}`}</span>
                        </button>

                        <Link href="/transport/schedule" className="w-full flex items-center justify-center gap-2 mt-4 py-4 rounded-2xl bg-white/20 dark:bg-white/5 border border-white/10 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-widest hover:bg-white/30 transition-all">
                            📅 {t.viewBusSchedule || "View Bus Schedule"}
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    );
}
