'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wrench, Zap, Hammer, Snowflake, Paintbrush, Settings, Star, Phone, MapPin, ChevronRight, Search, Calendar, Clock, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { listProviders } from '@/app/actions/services';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: Settings },
    { id: 'PLUMBER', label: 'Plumber', icon: Wrench },
    { id: 'ELECTRICIAN', label: 'Electrician', icon: Zap },
    { id: 'CARPENTER', label: 'Carpenter', icon: Hammer },
    { id: 'AC_TECH', label: 'AC Tech', icon: Snowflake },
    { id: 'PAINTER', label: 'Painter', icon: Paintbrush },
];

const CATEGORY_COLORS = {
    PLUMBER: 'from-blue-500 to-cyan-500',
    ELECTRICIAN: 'from-amber-500 to-orange-500',
    CARPENTER: 'from-orange-600 to-amber-700',
    AC_TECH: 'from-cyan-500 to-blue-600',
    PAINTER: 'from-pink-500 to-purple-500',
    GENERAL: 'from-gray-500 to-gray-600',
};

export default function ServicesPage() {
    const [category, setCategory] = useState('all');
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingProvider, setBookingProvider] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingNotes, setBookingNotes] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [booked, setBooked] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const result = await listProviders({ category: category === 'all' ? undefined : category });
            setProviders(result.providers || []);
            setLoading(false);
        }
        load();
    }, [category]);

    const handleBook = async () => {
        setIsBooking(true);
        const { bookService } = await import('@/app/actions/services');
        const res = await bookService({
            providerId: bookingProvider.id,
            date: bookingDate,
            timeSlot: bookingTime,
            notes: bookingNotes,
            promoCodeStr: promoCode
        });

        setIsBooking(false);
        if (res.success || res.booking) {
            setBooked(true);
            setTimeout(() => {
                setBookingProvider(null);
                setBooked(false);
                setBookingDate('');
                setBookingTime('');
                setBookingNotes('');
                setPromoCode('');
            }, 2000);
        } else {
            alert(res.error || 'Failed to book service.');
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-24 transition-colors">
            {/* Hero */}
            <div className="bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 px-6 pt-8 pb-14">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-black text-white">Home Services</h1>
                    <p className="text-indigo-200 font-bold text-sm mt-1">Find trusted professionals for any repair</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-10 space-y-6">
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${category === cat.id
                                ? 'bg-white dark:bg-[#1E293B] text-brand-600 shadow-lg'
                                : 'bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            <cat.icon size={16} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-16">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-500" />
                        <p className="text-gray-400 font-bold text-sm mt-3">Loading providers...</p>
                    </div>
                )}

                {/* Provider Cards */}
                {!loading && (
                    <div className="space-y-4">
                        {providers.map(provider => (
                            <div key={provider.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${CATEGORY_COLORS[provider.category] || CATEGORY_COLORS.GENERAL} flex items-center justify-center shrink-0`}>
                                        <span className="text-2xl">{
                                            provider.category === 'PLUMBER' ? '🔧' :
                                                provider.category === 'ELECTRICIAN' ? '⚡' :
                                                    provider.category === 'CARPENTER' ? '🪚' :
                                                        provider.category === 'AC_TECH' ? '❄️' :
                                                            provider.category === 'PAINTER' ? '🎨' : '🛠️'
                                        }</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-black text-gray-900 dark:text-white text-base">{provider.name}</h3>
                                            <div className="flex items-center gap-1 text-amber-500">
                                                <Star size={14} className="fill-amber-500" />
                                                <span className="text-sm font-black">{provider.rating}</span>
                                                <span className="text-[10px] text-gray-400">({provider.reviewCount})</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{provider.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-400 font-bold">
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {provider.location}</span>
                                            <span className="text-brand-600 font-black">{provider.priceRange}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <a href={`tel:${provider.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl font-bold text-sm hover:bg-green-200 transition-all">
                                        <Phone size={14} /> Call
                                    </a>
                                    <button onClick={() => setBookingProvider(provider)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20">
                                        <Calendar size={14} /> Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {bookingProvider && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        {booked ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Booking Confirmed!</h3>
                                <p className="text-gray-400 text-sm mt-1">{bookingProvider.name} will contact you soon.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Book {bookingProvider.name}</h3>
                                    <button onClick={() => setBookingProvider(null)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Date</label>
                                    <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Time Slot</label>
                                    <select value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold appearance-none">
                                        <option value="">Select time...</option>
                                        <option value="8:00 AM - 10:00 AM">8:00 AM - 10:00 AM</option>
                                        <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                                        <option value="12:00 PM - 2:00 PM">12:00 PM - 2:00 PM</option>
                                        <option value="2:00 PM - 4:00 PM">2:00 PM - 4:00 PM</option>
                                        <option value="4:00 PM - 6:00 PM">4:00 PM - 6:00 PM</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Notes (optional)</label>
                                    <textarea value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} rows={2} placeholder="Describe the issue..." className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold resize-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Promo Code</label>
                                    <input type="text" value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="OPTIONAL" className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold tracking-wider uppercase" />
                                </div>
                                <button onClick={handleBook} disabled={!bookingDate || !bookingTime || isBooking} className="w-full py-3.5 bg-brand-600 text-white rounded-2xl font-black hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isBooking ? 'Processing...' : 'Confirm Booking'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
