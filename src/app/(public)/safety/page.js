'use client';

import React from 'react';
import Link from 'next/link';
import {
    ShieldCheck, Lock, Eye, Users, CheckCircle2,
    ArrowLeft, ArrowRight, ShieldAlert, UserCheck
} from 'lucide-react';

export default function SafetyPage() {
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
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-500/10 mb-8">
                            <ShieldCheck className="text-blue-500" size={40} />
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">
                            Platinum <span className="text-blue-500">Standards.</span>
                        </h1>
                        <p className="text-xl font-bold text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            The safety of the UniZy community is our single highest priority. We verify every identity to ensure a secure, student-exclusive ecosystem.
                        </p>
                    </div>

                    {/* Safety Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
                        <div className="p-12 bg-white dark:bg-white/5 rounded-[3.5rem] border border-black/5 dark:border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full"></div>
                            <UserCheck className="text-blue-500 mb-8" size={32} />
                            <h3 className="text-2xl font-black mb-4">Identity Verification</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                Every single user on the platform must verify their account using a valid university ID. No guests, no outsiders—just verified students.
                            </p>
                        </div>

                        <div className="p-12 bg-white dark:bg-white/5 rounded-[3.5rem] border border-black/5 dark:border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full"></div>
                            <Lock className="text-emerald-500 mb-8" size={32} />
                            <h3 className="text-2xl font-black mb-4">Gender-Locked Pools</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                Residential privacy is paramount. Our roommate matching system uses strictly gender-locked pools to ensure absolute safety and comfort.
                            </p>
                        </div>

                        <div className="p-12 bg-white dark:bg-white/5 rounded-[3.5rem] border border-black/5 dark:border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/5 blur-3xl rounded-full"></div>
                            <Eye className="text-orange-500 mb-8" size={32} />
                            <h3 className="text-2xl font-black mb-4">Real-time Safety</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                From transport trips to service bookings, every interaction is monitored in real-time. Share your location with trusted contacts instantly.
                            </p>
                        </div>

                        <div className="p-12 bg-white dark:bg-white/5 rounded-[3.5rem] border border-black/5 dark:border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/5 blur-3xl rounded-full"></div>
                            <Users className="text-purple-500 mb-8" size={32} />
                            <h3 className="text-2xl font-black mb-4">Active Moderation</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                Our community guidelines are enforced by a pro-active moderation team and peer-to-peer reporting to keep the UniZy Hub professional.
                            </p>
                        </div>
                    </div>

                    {/* Safety Commitment */}
                    <div className="p-12 bg-slate-900 rounded-[4rem] text-white text-center">
                        <ShieldAlert className="mx-auto text-brand-400 mb-8" size={48} />
                        <h2 className="text-4xl font-black mb-8 leading-tight">Total Commitment to Privacy.</h2>
                        <p className="text-xl font-bold text-white/60 max-w-2xl mx-auto mb-12">
                            We use military-grade encryption for all personal data and never share your information with 3rd party merchants without explicit OTP verification.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {["SSL Encrypted", "No Data Selling", "OTP Handshakes", "Role Isolation"].map((label, idx) => (
                                <div key={idx} className="px-6 py-3 bg-white/5 rounded-full border border-white/10 text-xs font-black uppercase tracking-widest">
                                    {label}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-24 text-center">
                        <Link href="/login" className="inline-flex items-center justify-center px-16 py-8 bg-brand-600 text-white rounded-[3rem] font-black text-2xl shadow-4xl hover:scale-105 transition-all">
                            Join the Secure Circle
                        </Link>
                        <p className="mt-8 text-xs font-black uppercase tracking-widest text-slate-400">Trusted by students since 2026</p>
                    </div>
                </div>
            </main>

            <footer className="py-20 px-6 border-t border-black/5 dark:border-white/5 text-slate-500">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-[10px] uppercase tracking-widest font-bold">© 2026 UniZy Technologies • Security First Student OS</p>
                </div>
            </footer>
        </div>
    );
}
