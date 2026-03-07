'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Users, Cigarette, Moon, BookOpen, Sparkles, Heart, MapPin, List, Plus } from 'lucide-react';
import { createRoommateRequest, getRoommateRequests } from '@/app/actions/hub';
import { useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import toast from 'react-hot-toast';

const PREFERENCES = [
    { key: 'smoking', icon: Cigarette, label: 'Smoking', options: ['Non-smoker', 'Smoker', 'No preference'] },
    { key: 'sleep', icon: Moon, label: 'Sleep Schedule', options: ['Early bird', 'Night owl', 'Flexible'] },
    { key: 'cleanliness', icon: Sparkles, label: 'Cleanliness', options: ['Very tidy', 'Moderate', 'Relaxed'] },
    { key: 'study', icon: BookOpen, label: 'Study Habits', options: ['Quiet study', 'Group study', 'Flexible'] },
];

export default function RoommateFinder() {
    const router = useRouter();
    const [form, setForm] = useState({
        budget: '',
        area: '',
        gender: 'Male',
        moveInDate: '',
        notes: '',
        smoking: 'Non-smoker',
        sleep: 'Flexible',
        cleanliness: 'Moderate',
        study: 'Flexible',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [view, setView] = useState('form'); // 'form' or 'list'
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (view === 'list') {
            const fetch = async () => {
                setLoading(true);
                const res = await getRoommateRequests();
                if (res.success) setRequests(res.requests);
                setLoading(false);
            };
            fetch();
        }
    }, [view]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const result = await createRoommateRequest(form);
        setIsSubmitting(false);
        if (result.success) {
            setIsSuccess(true);
            toast.success('Roommate request posted!');
        } else {
            toast.error(result.error || 'Failed to post request');
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex items-center justify-center p-6 text-center animate-fade-in">
                <div>
                    <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-full mx-auto flex items-center justify-center mb-6">
                        <Heart className="text-brand-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Post Published!</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto mb-8">
                        Your roommate request is now live on the Student Hub. We'll notify you when someone matches.
                    </p>
                    <button onClick={() => router.push('/hub')} className="bg-brand-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-brand-700 transition-all">
                        Back to Hub
                    </button>
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
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-brand-500" />
                        <h1 className="text-lg font-black text-gray-900 dark:text-white">Roommate Finder</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                {/* View Toggle */}
                <div className="flex bg-gray-100 dark:bg-unizy-dark/80 p-1 rounded-2xl mb-8">
                    <button
                        onClick={() => setView('form')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'form' ? 'bg-white dark:bg-unizy-navy text-brand-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        <Plus size={16} /> Post Request
                    </button>
                    <button
                        onClick={() => setView('list')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'list' ? 'bg-white dark:bg-unizy-navy text-brand-600 shadow-sm' : 'text-gray-500'}`}
                    >
                        <List size={16} /> Recent Posts
                    </button>
                </div>

                {view === 'form' ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin size={16} className="text-brand-500" /> Location & Budget
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Max Budget (EGP/mo)</label>
                                    <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="3000" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Preferred Area</label>
                                    <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Near campus" required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gender</label>
                                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold appearance-none cursor-pointer">
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Move-in Date</label>
                                    <input type="date" value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Lifestyle Preferences */}
                        <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles size={16} className="text-purple-500" /> Lifestyle Preferences
                            </h2>
                            <div className="space-y-4">
                                {PREFERENCES.map((pref) => {
                                    const Icon = pref.icon;
                                    return (
                                        <div key={pref.key}>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                <Icon size={12} /> {pref.label}
                                            </label>
                                            <div className="flex gap-2">
                                                {pref.options.map((opt) => (
                                                    <button key={opt} type="button" onClick={() => setForm({ ...form, [pref.key]: opt })} className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${form[pref.key] === opt ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Additional Notes</label>
                            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything else potential roommates should know..." rows={3} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold resize-none" />
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Post Roommate Request'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        {loading && (
                            <div className="text-center py-12">
                                <Plus className="w-8 h-8 mx-auto animate-spin text-brand-500" />
                            </div>
                        )}
                        {!loading && requests.length === 0 && (
                            <div className="text-center py-12 bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 font-bold">No roommate requests yet.</p>
                            </div>
                        )}
                        {!loading && requests.map(req => (
                            <div key={req.id} className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-black">
                                            {req.user.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{req.user.name}</h3>
                                            <p className="text-xs text-gray-400">{req.user.university}</p>
                                        </div>
                                    </div>
                                    <div className="text-right text-brand-600 font-black">
                                        {req.budget} EGP
                                    </div>
                                </div>
                                <div className="bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl">
                                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Looking for a {req.gender.toLowerCase()} roommate in <span className="text-brand-500">{req.area}</span>.
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 italic">"{req.notes}"</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                        <Cigarette size={10} /> {req.smoking}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800/30">
                                        <Moon size={10} /> {req.sleep}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-green-600 dark:text-green-400 uppercase bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-100 dark:border-green-800/30">
                                        <Sparkles size={10} /> {req.cleanliness}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg border border-orange-100 dark:border-orange-800/30">
                                        <BookOpen size={10} /> {req.study}
                                    </div>
                                </div>
                                <button className="w-full bg-gray-100 dark:bg-white/5 hover:bg-brand-600 hover:text-white text-gray-900 dark:text-white font-bold py-2.5 rounded-xl transition-all">
                                    Connect
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
