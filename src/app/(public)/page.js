'use client';

import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from '@/i18n/LanguageProvider';

export default function LandingPage() {
    const { dict } = useLanguage();
    const t = dict.landing;

    const [scrolled, setScrolled] = Link === undefined ? [false, () => { }] : React.useState(false);

    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const services = [
        {
            id: 'housing',
            title: t.housing,
            description: t.housingDesc,
            icon: "🏠",
            color: "from-blue-500/20 to-indigo-600/20",
            accent: "bg-blue-500",
            href: "/housing"
        },
        {
            id: 'transport',
            title: t.transport,
            description: t.transportDesc,
            icon: "🚗",
            color: "from-orange-400/20 to-red-500/20",
            accent: "bg-orange-500",
            href: "/transport"
        },
        {
            id: 'delivery',
            title: t.delivery,
            description: t.deliveryDesc,
            icon: "🍔",
            color: "from-green-400/20 to-emerald-600/20",
            accent: "bg-emerald-500",
            href: "/delivery"
        },
        {
            id: 'deals',
            title: t.deals,
            description: t.dealsDesc,
            icon: "🏷️",
            color: "from-purple-400/20 to-pink-500/20",
            accent: "bg-pink-500",
            href: "/deals"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D1721] overflow-hidden transition-colors duration-700">
            {/* Dynamic Brand Aura */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] aspect-square bg-brand-500/10 dark:bg-brand-500/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] aspect-square bg-cyan-500/10 dark:bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Navigation Header - Pro Max Glass */}
            <header className={`sticky top-0 z-[100] transition-all duration-500 px-6 py-4 ${scrolled ? 'bg-white/70 dark:bg-[#0D1721]/70 backdrop-blur-2xl border-b border-white/20 dark:border-white/5 py-3 shadow-2xl' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-10 h-10 bg-brand-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-brand-500/20">
                            <span className="text-white font-black italic">U</span>
                        </div>
                        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">UniZy</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        {['Features', 'Marketplace', 'Hub', 'Safety'].map(item => (
                            <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{item}</Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand-600 transition-colors uppercase tracking-widest">{t.login}</Link>
                        <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-sm tracking-tight shadow-xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all">
                            {t.getStarted}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section - The Wow Moment */}
                <section className="relative pt-20 pb-32 px-6">
                    <div className="max-w-7xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-500/20 rounded-full mb-8 animate-bounce">
                            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400">Trusted by 10k+ Students</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9] mb-8">
                            {t.heroTitle.split(' ').map((word, i) => (
                                <span key={i} className={i === 1 ? 'text-brand-600 dark:text-brand-500 block sm:inline' : ''}>{word} </span>
                            ))}
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-12">
                            {t.heroSubtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-brand-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all">
                                Unlock Your Campus
                            </Link>
                            <button className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[2rem] font-black text-lg text-slate-900 dark:text-white hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group">
                                Watch Intro <div className="w-6 h-6 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center group-hover:scale-125 transition-transform"><span className="text-[10px] ml-0.5">▶</span></div>
                            </button>
                        </div>
                    </div>

                    {/* Visual Anchor */}
                    <div className="mt-20 max-w-5xl mx-auto relative group">
                        <div className="absolute inset-0 bg-brand-600/20 blur-[100px] group-hover:bg-brand-600/30 transition-colors duration-1000"></div>
                        <div className="relative bg-slate-200 dark:bg-slate-800 rounded-[3rem] aspect-video sm:aspect-[21/9] overflow-hidden border-[12px] border-white dark:border-white/5 shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=2070" alt="Univ" className="w-full h-full object-cover opacity-60 dark:opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-12">
                                <div className="text-left">
                                    <p className="text-white font-black text-2xl tracking-tighter mb-2 italic">The Super App Experience.</p>
                                    <div className="flex gap-4">
                                        <div className="h-1 w-20 bg-brand-500 rounded-full"></div>
                                        <div className="h-1 w-4 bg-white/20 rounded-full"></div>
                                        <div className="h-1 w-4 bg-white/20 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Grid - Glass Bento Patterns */}
                <section className="pb-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
                            <div className="text-left">
                                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic mb-4">One Platform.<br /><span className="text-brand-600">Infinite Possibilities.</span></h2>
                                <p className="text-slate-500 dark:text-slate-400 font-bold max-w-md">Everything you need to survive and thrive on campus, integrated into a single seamless ecosystem.</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-brand-600 transition-colors cursor-pointer border border-transparent hover:border-brand-500/20">
                                    ←
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/10 shadow-xl flex items-center justify-center text-brand-600 cursor-pointer border border-slate-100 dark:border-white/10">
                                    →
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {services.map((service, idx) => (
                                <Link
                                    key={idx}
                                    href={service.href}
                                    className="group relative bg-white dark:bg-[#0c1622] rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand-500/5 transition-all duration-500 hover:translate-y-[-8px]"
                                >
                                    <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${service.color} flex items-center justify-center text-4xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                        {service.icon}
                                    </div>
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic mb-3">{service.title}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{service.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-brand-600 font-black text-xs uppercase tracking-widest mt-auto">
                                        Explore <span className="translate-x-0 group-hover:translate-x-2 transition-transform">→</span>
                                    </div>
                                    <div className={`absolute top-8 right-8 w-2 h-2 rounded-full ${service.accent} opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all`}></div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-900 py-16 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-900/20 opacity-50 blur-3xl rounded-full"></div>
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-black italic text-xl">U</span>
                        </div>
                        <span className="text-3xl font-black text-white italic tracking-tighter">UniZy</span>
                    </div>
                    <p className="text-slate-500 font-bold">© 2026 UniZy Technologies. Built for Students, by Students.</p>
                    <div className="flex gap-6">
                        {['Twitter', 'Discord', 'Instagram'].map(social => (
                            <a key={social} href="#" className="text-slate-400 hover:text-white transition-colors font-black text-xs uppercase tracking-widest">{social}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
