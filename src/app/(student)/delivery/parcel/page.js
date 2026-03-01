'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Package, MapPin, Phone, User, Scale, FileText, AlertTriangle, CheckCircle } from 'lucide-react';

export default function ParcelDeliveryPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        senderName: '',
        senderPhone: '',
        receiverName: '',
        receiverPhone: '',
        pickupAddress: '',
        dropoffAddress: '',
        itemDescription: '',
        isFragile: false,
        size: 'small',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex items-center justify-center p-6">
                <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto flex items-center justify-center mb-6">
                        <CheckCircle className="text-green-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Parcel Submitted!</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto mb-8">
                        A rider will be assigned shortly. You can track the status in your Activity page.
                    </p>
                    <Link href="/activity" className="bg-brand-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-brand-700 transition-all">
                        Track Delivery
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 px-4 py-4">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                        <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white">Send a Parcel</h1>
                        <p className="text-xs text-gray-500 font-bold">Pickup & drop-off service</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sender */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User size={16} className="text-blue-500" /> Sender Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Name</label>
                                <input type="text" value={form.senderName} onChange={(e) => setForm({ ...form, senderName: e.target.value })} placeholder="Your name" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                                <input type="tel" value={form.senderPhone} onChange={(e) => setForm({ ...form, senderPhone: e.target.value })} placeholder="01012345678" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pickup Address</label>
                            <input type="text" value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} placeholder="e.g. Dorm 3, Room 102" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                        </div>
                    </div>

                    {/* Receiver */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-emerald-500" /> Receiver Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Receiver Name</label>
                                <input type="text" value={form.receiverName} onChange={(e) => setForm({ ...form, receiverName: e.target.value })} placeholder="Receiver name" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Receiver Phone</label>
                                <input type="tel" value={form.receiverPhone} onChange={(e) => setForm({ ...form, receiverPhone: e.target.value })} placeholder="01098765432" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Drop-off Address</label>
                            <input type="text" value={form.dropoffAddress} onChange={(e) => setForm({ ...form, dropoffAddress: e.target.value })} placeholder="e.g. Engineering Faculty, Gate 2" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                        </div>
                    </div>

                    {/* Item Details */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Package size={16} className="text-orange-500" /> Item Info
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                                <input type="text" value={form.itemDescription} onChange={(e) => setForm({ ...form, itemDescription: e.target.value })} placeholder="e.g. Books, Electronics, Documents" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Size</label>
                                    <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold appearance-none cursor-pointer">
                                        <option value="small">Small (fits in hand)</option>
                                        <option value="medium">Medium (bag size)</option>
                                        <option value="large">Large (box size)</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 cursor-pointer w-full">
                                        <input type="checkbox" checked={form.isFragile} onChange={(e) => setForm({ ...form, isFragile: e.target.checked })} className="w-4 h-4 accent-brand-600 rounded" />
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={14} className="text-amber-600" />
                                            <span className="text-sm font-bold text-amber-800 dark:text-amber-400">Fragile</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Notes (Optional)</label>
                                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special handling instructions..." rows={2} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold resize-none" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Request Pickup'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
