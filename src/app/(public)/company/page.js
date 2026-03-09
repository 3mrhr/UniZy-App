'use client';

import React from 'react';
import Link from 'next/link';
import {
    ArrowLeft, Globe, Zap, Users, ShieldCheck, Mail, MapPin,
    ChevronRight, ArrowRight, Instagram, Twitter, Linkedin
} from 'lucide-react';

export default function CompanyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D1721] overflow-x-hidden selection:bg-brand-500 selection:text-white">
            {/* Minimal Nav */}
            <nav className="fixed top-0 w-full z-[1000] px-6 py-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group px-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/10 transition-all hover:scale-105">
                        <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Back to Home</span>
                    </Link>
                </div>
            </nav>

            <main className="flex-grow pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-24">
                        <p className="text-brand-600 font-black uppercase tracking-[0.4em] text-[10px] mb-8">Established 2026</p>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 italic">
                            Unified.<br />
                            <span className="text-slate-400 dark:text-slate-600">Ambitious.</span><br />
                            Student-First.
                        </h1>
                        <p className="text-2xl font-bold text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            UniZy is the performance OS for modern campus life. We believe that by unifying housing, transport, and dining, we can unlock the true potential of every student.
                        </p>
                    </div>

                    {/* Mission Bento */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-32">
                        <div className="md:col-span-12 lg:col-span-8 p-12 bg-slate-900 text-white rounded-[4rem] group overflow-hidden relative">
                            <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-500/10 blur-[100px] rounded-full"></div>
                            <h2 className="text-4xl font-black mb-6 tracking-tight">Our Mission</h2>
                            <p className="text-xl font-bold text-white/60 leading-relaxed max-w-xl">
                                To eliminate the friction of daily campus life. We're building the infrastructure that allows students to focus on what matters: their growth, their community, and their future.
                            </p>
                        </div>
                        <div className="md:col-span-12 lg:col-span-4 p-12 bg-white dark:bg-white/5 rounded-[4rem] border border-black/5 dark:border-white/5 shadow-xl flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-4">
                                <Users className="text-brand-600" size={24} />
                                <span className="text-3xl font-black tracking-tighter">10k+</span>
                            </div>
                            <p className="font-bold text-slate-400 text-sm uppercase tracking-widest">Active Members</p>
                        </div>

                        <div className="md:col-span-12 p-12 bg-white dark:bg-white/5 rounded-[4rem] border border-black/5 dark:border-white/5 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div>
                                <h3 className="text-lg font-black mb-4 uppercase tracking-tight">Radical Efficiency</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Saving students thousands of hours and pounds every semester through unified logistics.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-black mb-4 uppercase tracking-tight">Total Safety</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Building a circles-of-trust ecosystem where every interaction is verified and secure.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-black mb-4 uppercase tracking-tight">Premium Access</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Democratizing high-end services for students at affordable, fixed rates.</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Grid */}
                    <div className="max-w-4xl mx-auto mb-32">
                        <h2 className="text-4xl font-black text-center mb-16 tracking-tighter italic">Connect with Platinum.</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-white dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 flex items-center gap-6 group hover:translate-x-2 transition-transform">
                                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Email Support</p>
                                    <p className="font-black text-slate-900 dark:text-white">platinum@unizy.app</p>
                                </div>
                                <ChevronRight className="ml-auto text-slate-300 group-hover:text-brand-600 transition-colors" size={20} />
                            </div>

                            <div className="p-8 bg-white dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 flex items-center gap-6 group hover:translate-x-2 transition-transform">
                                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">HQ Office</p>
                                    <p className="font-black text-slate-900 dark:text-white">District 5, Cairo Tech Hub</p>
                                </div>
                                <ChevronRight className="ml-auto text-slate-300 group-hover:text-orange-500 transition-colors" size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Socials */}
                    <div className="flex justify-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
                        <Link href="#"><Instagram size={24} className="hover:text-pink-500 transition-colors" /></Link>
                        <Link href="#"><Twitter size={24} className="hover:text-blue-400 transition-colors" /></Link>
                        <Link href="#"><Linkedin size={24} className="hover:text-blue-700 transition-colors" /></Link>
                    </div>

                    <div className="mt-24 text-center">
                        <Link href="/login" className="inline-flex items-center justify-center px-16 py-8 bg-brand-600 text-white rounded-[3rem] font-black text-2xl shadow-4xl hover:scale-105 transition-all">
                            Join the Journey
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-black/5 dark:border-white/5 text-slate-500">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-[10px] uppercase tracking-widest font-bold">© 2026 UniZy Technologies • Built for Excellence</p>
                </div>
            </footer>
        </div>
    );
}
