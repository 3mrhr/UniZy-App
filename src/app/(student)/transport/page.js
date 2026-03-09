'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from '@/i18n/LanguageProvider';
import { useRouter } from 'next/navigation';
import { requestTrip } from '@/app/actions/transport';
import SOSButton from '@/components/SOSButton';
import { toast } from 'react-hot-toast';

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
        if (!destination) {
            toast.error('Please enter a destination');
            return;
        }
        setIsBooking(true);
        const selected = vehicles.find(v => v.id === selectedVehicle);
        const priceNum = parseFloat(selected.price.replace('EGP ', ''));

        // For MVP, we use location strings. In the next phase, we'll add a landmark-to-coordinate resolver.
        const result = await requestTrip({
            pickupLocation: pickup,
            dropoffLocation: destination,
            pickupLat: 27.185, // Placeholder for Assiut Univ
            pickupLng: 31.171,
            dropoffLat: 27.186,
            dropoffLng: 31.172,
            vehicleType: selected.name,
            estimatedPrice: priceNum
        });

        setIsBooking(false);
        if (result.success) {
            toast.success('Booking confirmed!');
            router.push(`/activity/tracking/${result.trip.id}`);
        } else {
            toast.error(result.error || 'Failed to book');
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
                <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="glass-frosted p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        {/* Aura Background Glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 blur-[80px] rounded-full group-hover:bg-brand-500/20 transition-all duration-700"></div>

                        <div className="space-y-6 relative z-10">
                            <div className="relative">
                                <div className="absolute top-1/2 -mt-2 left-4 w-4 h-4 rounded-full border-2 border-brand-500 bg-white dark:bg-unizy-navy z-20"></div>
                                <div className="absolute top-1/2 mt-6 left-[1.125rem] w-0.5 h-12 bg-gradient-to-b from-brand-500 to-orange-500 opacity-30"></div>
                                <input
                                    type="text"
                                    value={pickup}
                                    onFocus={() => { if (!pickupTouched) { setPickup(''); setPickupTouched(true); } }}
                                    onChange={(e) => setPickup(e.target.value)}
                                    className="w-full bg-gray-50/50 dark:bg-unizy-navy/30 border-2 border-transparent focus:border-brand-500/50 rounded-2xl pl-12 p-5 text-sm font-bold transition-all outline-none text-gray-900 dark:text-white"
                                    placeholder={t.pickupPoint || "Pickup point"}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute top-1/2 -mt-2 left-4 w-4 h-4 bg-orange-500 rounded-sm z-20"></div>
                                <input
                                    type="text"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    className="w-full bg-gray-50/50 dark:bg-unizy-navy/30 border-2 border-transparent focus:border-brand-500/50 rounded-2xl pl-12 p-5 text-sm font-bold transition-all outline-none text-gray-900 dark:text-white"
                                    placeholder={t.whereTo || "Where to?"}
                                />
                            </div>
                            <div className="relative">
                                <div className="absolute top-1/2 -mt-2 left-4 w-4 h-4 rounded-sm bg-brand-500/20 text-brand-500 flex items-center justify-center font-black text-[8px] tracking-tighter z-20">%</div>
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="w-full bg-gray-50/50 dark:bg-unizy-navy/30 border-2 border-transparent focus:border-brand-500/50 rounded-2xl pl-12 p-5 text-sm font-black focus:ring-0 transition-all outline-none text-gray-900 dark:text-white uppercase tracking-widest placeholder:text-gray-400/50"
                                    placeholder={t.promoCode || "PROMO CODE"}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="glass-frosted p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                            {t.selectVehicle || "Fleet Selection"}
                        </h3>
                        <div className="space-y-4">
                            {vehicles.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVehicle(v.id)}
                                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-500 group relative ${selectedVehicle === v.id ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/20 glow-brand scale-[1.02]' : 'border-transparent bg-gray-50/50 dark:bg-unizy-navy/20 hover:bg-gray-100 dark:hover:bg-unizy-navy/40 hover:scale-[1.01]'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`text-3xl transition-transform duration-500 ${selectedVehicle === v.id ? 'scale-110 rotate-3' : 'group-hover:scale-110'}`}>{v.icon}</div>
                                        <div className="text-left">
                                            <h4 className="font-black text-gray-900 dark:text-white text-sm tracking-tight">{v.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{v.time} • Near you</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-brand-600 dark:text-brand-400 text-sm tracking-tight">{v.price}</span>
                                        {selectedVehicle === v.id && (
                                            <div className="text-[8px] font-black text-brand-500 uppercase tracking-tighter mt-1 animate-fade-in">Best Value</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleBook}
                            disabled={isBooking}
                            className={`w-full relative overflow-hidden bg-brand-600 hover:bg-brand-700 text-white font-black py-6 rounded-3xl mt-8 shadow-2xl shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-95 group ${isBooking ? 'opacity-70 cursor-not-allowed' : ''}`}>
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isBooking ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : (t.book || 'Confirm Booking')}
                            </span>
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-20"></div>
                        </button>

                        <Link href="/transport/shuttle" className="w-full flex items-center justify-center gap-2 mt-4 py-4 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-widest hover:bg-cyan-500/10 transition-all duration-300 border border-cyan-500/10">
                            🚌 {t.viewShuttleMap || "Live Shuttle Dispatch"}
                        </Link>
                    </div>
                </div>

            </main>
        </div>
    );
}
