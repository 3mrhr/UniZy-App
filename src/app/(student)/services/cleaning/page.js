'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Calendar, CheckCircle, Star, Tag, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { listPackages } from '@/app/actions/cleaning';

const FREQ_LABELS = { ONE_TIME: 'One-time', WEEKLY: 'Weekly', BI_WEEKLY: 'Bi-weekly', MONTHLY: 'Monthly' };
const FREQ_COLORS = { ONE_TIME: 'bg-blue-100 text-blue-600', WEEKLY: 'bg-green-100 text-green-600', BI_WEEKLY: 'bg-purple-100 text-purple-600', MONTHLY: 'bg-amber-100 text-amber-600' };

export default function CleaningPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPkg, setSelectedPkg] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingAddress, setBookingAddress] = useState('');
    const [booked, setBooked] = useState(false);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const result = await listPackages();
            setPackages(result.packages || []);
            setLoading(false);
        }
        load();
    }, []);

    const handleBook = () => {
        setBooked(true);
        setTimeout(() => {
            setSelectedPkg(null);
            setBooked(false);
            setBookingDate('');
            setBookingTime('');
            setBookingAddress('');
        }, 2000);
    };

    const parseIncludes = (str) => {
        try { return JSON.parse(str); } catch { return []; }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-24 transition-colors">
            {/* Hero */}
            <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 px-6 pt-8 pb-14">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Sparkles size={28} /> Cleaning Services
                    </h1>
                    <p className="text-emerald-100 font-bold text-sm mt-1">Professional cleaning for your student housing</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-10 space-y-4">
                {loading && (
                    <div className="text-center py-16">
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-500" />
                        <p className="text-gray-400 font-bold text-sm mt-3">Loading packages...</p>
                    </div>
                )}

                {!loading && packages.map((pkg, i) => (
                    <div key={pkg.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{pkg.name}</h3>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${FREQ_COLORS[pkg.frequency] || FREQ_COLORS.ONE_TIME}`}>
                                        {FREQ_LABELS[pkg.frequency] || pkg.frequency}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{pkg.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-2xl font-black text-emerald-600">{pkg.price}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">EGP</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-400 font-bold mb-4">
                            <span className="flex items-center gap-1"><Clock size={12} /> {pkg.duration}</span>
                        </div>

                        {/* Includes */}
                        <div className="grid grid-cols-2 gap-1.5 mb-4">
                            {parseIncludes(pkg.includes).map((item, j) => (
                                <div key={j} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                    <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                                    {item}
                                </div>
                            ))}
                        </div>

                        <button onClick={() => setSelectedPkg(pkg)} className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2">
                            Book Now <ArrowRight size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            {selectedPkg && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        {booked ? (
                            <div className="text-center py-8">
                                <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Request Sent!</h3>
                                <p className="text-gray-400 text-sm mt-1">Our team will call or WhatsApp you shortly to confirm your cleaning slot and details.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">Book {selectedPkg.name}</h3>
                                    <button onClick={() => setSelectedPkg(null)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{selectedPkg.name}</span>
                                        <span className="text-lg font-black text-emerald-600">{selectedPkg.price} EGP</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-600/60 font-bold uppercase tracking-widest">{selectedPkg.frequency === 'ONE_TIME' ? 'One-time Service' : 'Subscription Plan'}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Preferred Date</label>
                                    <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-emerald-500 outline-none text-gray-900 dark:text-white font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Preferred Time</label>
                                    <select value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-emerald-500 outline-none text-gray-900 dark:text-white font-bold appearance-none">
                                        <option value="">Any time</option>
                                        <option value="Morning (8AM-11AM)">Morning (8AM-11AM)</option>
                                        <option value="Afternoon (11AM-2PM)">Afternoon (11AM-2PM)</option>
                                        <option value="Evening (2PM-5PM)">Evening (2PM-5PM)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Service Address</label>
                                    <input type="text" value={bookingAddress} onChange={e => setBookingAddress(e.target.value)} placeholder="Building, Floor, Apartment..." className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-emerald-500 outline-none text-gray-900 dark:text-white font-bold" />
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold text-center italic">Pricing confirmed via phone/WhatsApp call.</p>
                                <button onClick={handleBook} disabled={!bookingDate || !bookingAddress} className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Request Cleaning Slot
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
