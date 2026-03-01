'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Clock, Repeat, MapPin, ArrowRight } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleRidePage() {
    const router = useRouter();
    const [form, setForm] = useState({
        pickup: '',
        dropoff: '',
        time: '08:00',
        isRecurring: false,
        selectedDays: [],
        startDate: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const toggleDay = (day) => {
        setForm((prev) => ({
            ...prev,
            selectedDays: prev.selectedDays.includes(day)
                ? prev.selectedDays.filter((d) => d !== day)
                : [...prev.selectedDays, day],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => router.push('/transport'), 2000);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex items-center justify-center p-6 text-center animate-fade-in">
                <div>
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto flex items-center justify-center mb-6">
                        <Repeat className="text-green-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Ride Scheduled!</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto">
                        {form.isRecurring ? `Your daily commute on ${form.selectedDays.join(', ')} is set.` : 'Your one-time ride is confirmed.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-24">
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 px-4 py-4">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                        <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white">Schedule a Ride</h1>
                        <p className="text-xs text-gray-500 font-bold">One-time or daily commute</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Route */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-brand-500" /> Route
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pickup</label>
                                <input type="text" value={form.pickup} onChange={(e) => setForm({ ...form, pickup: e.target.value })} placeholder="e.g. Dorm 5, Gate 1" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                            </div>
                            <div className="flex items-center justify-center"><ArrowRight size={16} className="text-gray-300" /></div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Drop-off</label>
                                <input type="text" value={form.dropoff} onChange={(e) => setForm({ ...form, dropoff: e.target.value })} placeholder="e.g. Engineering Faculty" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* Time & Date */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-brand-500" /> Schedule
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Start Date</label>
                                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pickup Time</label>
                                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* Recurring Toggle */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Repeat size={16} className="text-purple-500" /> Daily Commute
                            </h2>
                            <button type="button" onClick={() => setForm({ ...form, isRecurring: !form.isRecurring })} className={`w-12 h-7 rounded-full transition-all relative ${form.isRecurring ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${form.isRecurring ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>

                        {form.isRecurring && (
                            <div className="animate-fade-in">
                                <p className="text-xs text-gray-500 font-bold mb-3">Select days to repeat</p>
                                <div className="flex gap-2">
                                    {DAYS.map((day) => (
                                        <button key={day} type="button" onClick={() => toggleDay(day)} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${form.selectedDays.includes(day) ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                        {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : form.isRecurring ? 'Schedule Daily Commute' : 'Schedule Ride'}
                    </button>
                </form>
            </div>
        </div>
    );
}
