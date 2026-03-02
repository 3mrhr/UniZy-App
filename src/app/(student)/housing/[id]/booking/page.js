'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, FileText, ChevronLeft, Star } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createHousingRequest } from '@/app/actions/housing';
import toast from 'react-hot-toast';

export default function BookingRequestPage() {
    const router = useRouter();
    const { id: listingId } = useParams();
    const [form, setForm] = useState({
        moveInDate: '',
        duration: '1',
        tenants: '1',
        notes: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const message = `Move-in: ${form.moveInDate}\nDuration: ${form.duration} month(s)\nTenants: ${form.tenants}\nNotes: ${form.notes}`;

        const res = await createHousingRequest(listingId, 'BOOKING', message);

        if (res.error) {
            toast.error(res.error);
            setIsSubmitting(false);
        } else {
            setIsSubmitting(false);
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex items-center justify-center p-6">
                <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto flex items-center justify-center mb-6">
                        <Star className="text-green-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Booking Requested!</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto mb-8">
                        The landlord has received your booking request and will contact you directly to finalize the lease.
                    </p>
                    <Link href={`/housing/${listingId}`} className="bg-brand-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30">
                        Back to Listing
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
                        <h1 className="text-lg font-black text-gray-900 dark:text-white">Request to Book</h1>
                        <p className="text-xs text-gray-500 font-bold">Secure this property for your move-in</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Move-in Details */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Calendar size={16} className="text-brand-500" /> Lease Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Move-in Date</label>
                                <input
                                    type="date"
                                    value={form.moveInDate}
                                    onChange={(e) => setForm({ ...form, moveInDate: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Duration (Months)</label>
                                <select
                                    value={form.duration}
                                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold appearance-none cursor-pointer"
                                >
                                    {[1, 2, 3, 4, 6, 9, 12, 24].map(m => (
                                        <option key={m} value={m}>{m} {m === 1 ? 'Month' : 'Months'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Occupants */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Users size={16} className="text-brand-500" /> Occupants
                        </h2>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Number of Tenants</label>
                            <select
                                value={form.tenants}
                                onChange={(e) => setForm({ ...form, tenants: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold appearance-none cursor-pointer"
                            >
                                <option value="1">Just me (1)</option>
                                <option value="2">2 people</option>
                                <option value="3">3 people</option>
                                <option value="4+">4+ people</option>
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <FileText size={16} className="text-brand-500" /> Message to Landlord
                        </h2>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            placeholder="Introduce yourself and list any questions or special requirements..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 font-black py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900 rounded-full animate-spin"></div>
                        ) : (
                            'Request Booking'
                        )}
                    </button>
                    <p className="textAlign-center text-xs text-gray-500 font-medium px-4">
                        You won't be charged yet. The landlord needs to approve your request first.
                    </p>
                </form>
            </div>
        </div>
    );
}
