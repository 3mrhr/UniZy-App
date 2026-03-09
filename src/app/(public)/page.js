'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useLanguage } from '@/i18n/LanguageProvider';
import { ChevronRight, ShieldCheck, Zap, Star, LayoutGrid, ArrowRight, MousePointer2, Sparkles, Wrench, Tag, Users, CheckCircle2, MessageSquare, HelpCircle } from 'lucide-react';

export default function LandingPage() {
    const { dict } = useLanguage();
    const t = dict.landing;

    const [isRevealed, setIsRevealed] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    const mainRef = useRef(null);

    // Intersection Observer for scroll reveals
    const observerRef = useRef(null);

    useEffect(() => {
        // Initial Cinematic Reveal sequence
        const timer = setTimeout(() => setIsRevealed(true), 2500);

        const handleScroll = () => {
            setScrolled(window.scrollY > 100);

            // Calculate scroll progress for the features section
            const winScroll = window.pageYOffset;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height);
            setScrollProgress(scrolled);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (!isRevealed) return;

        // Setup Intersection Observer after reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, { threshold: 0.05 });

        const targets = document.querySelectorAll('.reveal-on-scroll');
        targets.forEach(el => observer.observe(el));

        return () => {
            if (observer) observer.disconnect();
        };
    }, [isRevealed]);

    const features = [
        {
            title: "Housing Platinum",
            desc: "Find the perfect apartment and matching roommates with gender-locked similarity scoring.",
            icon: <ShieldCheck className="text-blue-500" />,
            color: "blue",
            link: "/explore/housing",
            label: "Housing"
        },
        {
            title: "Smart Transport",
            desc: "No fuss getting around town. Real-time shuttle tracking and coordinate-precise rides.",
            icon: <Zap className="text-orange-500" />,
            color: "orange",
            link: "/explore/transport",
            label: "Transport"
        },
        {
            title: "UniZy Kitchen",
            desc: "The subscription economy for campus dining. Save 60% with macro-balanced meal plans.",
            icon: <Star className="text-emerald-500" />,
            color: "emerald",
            link: "/explore/meals",
            label: "Kitchen"
        },
        {
            title: "Elite Delivery",
            desc: "The cheapest delivery on campus. From merchant orders to custom 'Order Anything' requests.",
            icon: <LayoutGrid className="text-purple-500" />,
            color: "purple",
            link: "/explore/delivery",
            label: "Delivery"
        },
        {
            title: "Pro Cleaning",
            desc: "Your house always stays clean. Professional slots scheduled at your convenience.",
            icon: <Sparkles className="text-cyan-500" />,
            color: "cyan",
            link: "/explore/cleaning",
            label: "Cleaning"
        },
        {
            title: "Home Maintenance",
            desc: "Never worry about broken things at home. On-demand services at student-first prices.",
            icon: <Wrench className="text-amber-500" />,
            color: "amber",
            link: "/explore/maintenance",
            label: "Maintenance"
        },
        {
            title: "City Discounts",
            desc: "Save all around town. Exclusive scarcity-based vouchers and student deals.",
            icon: <Tag className="text-rose-500" />,
            color: "rose",
            link: "/explore/discounts",
            label: "Discounts"
        }
    ];

    if (!isRevealed) {
        return (
            <div className="fixed inset-0 bg-[#0D1721] z-[9999] flex flex-col items-center justify-center overflow-hidden">
                <div className="relative animate-logo-reveal">
                    {/* Cinematic Logo Core */}
                    <div className="w-32 h-32 relative z-10 animate-logo-breathe">
                        <img src="/images/unizy-logo-icon.png" alt="UniZy Logo" className="w-full h-full object-contain" />
                    </div>
                    {/* Radial Glow Aura */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/20 blur-[80px] rounded-full"></div>
                </div>
                <div className="mt-12 overflow-hidden px-4">
                    <p className="text-white/40 font-black tracking-[0.5em] text-[10px] uppercase animate-slide-up delay-700">Campus Dining Reimagined • 2026</p>
                </div>
                <div className="absolute bottom-12 flex flex-col items-center gap-4">
                    <div className="w-[1px] h-12 bg-gradient-to-t from-brand-500 to-transparent"></div>
                    <span className="text-white/20 text-[8px] font-bold uppercase tracking-widest">Initialising Platinum OS</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D1721] overflow-x-hidden selection:bg-brand-500 selection:text-white">
            {/* Pro Max Navigation */}
            <nav className={`fixed top-0 w-full z-[1000] px-6 py-4 transition-all duration-700 ${scrolled ? 'bg-white/80 dark:bg-[#0D1721]/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 py-3' : ''}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 group px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all">
                        <img src="/images/unizy-logo-icon.png" className="w-8 h-8 object-contain" alt="UniZy" />
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">UniZy</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 bg-black/5 dark:bg-white/5 px-8 py-3 rounded-full backdrop-blur-md border border-black/5 dark:border-white/10">
                        <Link href="#features" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 transition-colors">Features</Link>
                        <Link href="/safety" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 transition-colors">Safety</Link>
                        <Link href="/company" className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 transition-colors">Company</Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/login" className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-brand-600 transition-all">Login</Link>
                        <Link href="/login" className="px-8 py-4 bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all">Get Started</Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero: Apple Style */}
                <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24">
                    <div className="absolute top-1/4 left-1/4 w-[40%] aspect-square bg-blue-500/10 blur-[120px] rounded-full animate-glow"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[40%] aspect-square bg-orange-500/10 blur-[120px] rounded-full animate-glow delay-1000"></div>

                    <div className="relative z-10 max-w-5xl animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 rounded-full mb-8 border border-black/5 dark:border-white/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse"></span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Platinum Release 2.0</p>
                        </div>
                        <h1 className="text-7xl md:text-[140px] font-black text-[#0D1721] dark:text-white leading-[0.85] tracking-tighter mb-12">
                            EVERYTHING.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-emerald-400 to-orange-500 bg-[length:200%_auto] animate-text-gradient">UNI-FIED.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl md:text-2xl font-bold text-slate-500 mb-12 leading-relaxed">
                            Housing, Transport, Meals, and Community.<br />
                            One high-performance ecosystem for the modern student.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/login" className="group px-12 py-6 bg-[#0D1721] dark:bg-white text-white dark:text-black rounded-[2.5rem] font-black text-lg hover:scale-105 transition-all shadow-4xl flex items-center gap-3">
                                Get Started <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="absolute bottom-12 flex flex-col items-center transition-opacity duration-1000" style={{ opacity: scrolled ? 0 : 1 }}>
                        <div className="w-6 h-10 border-2 border-slate-300 dark:border-white/20 rounded-full flex justify-center p-2">
                            <div className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce"></div>
                        </div>
                        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Scroll to Explore</p>
                    </div>
                </section>

                {/* Scrolimate Features: Neuro-Interactive View */}
                <section id="features" className="py-32 px-6 relative overflow-hidden bg-white dark:bg-[#0D1721]">

                    {/* Parallax Background Text */}
                    <div
                        className="absolute top-1/2 left-0 text-[30rem] font-black opacity-[0.03] dark:opacity-[0.01] pointer-events-none select-none whitespace-nowrap transition-transform duration-100 ease-out"
                        style={{ transform: `translate3d(${-50 + (scrollProgress * 100)}%, -50%, 0)` }}
                    >
                        UNIZY PLATINUM MODULES
                    </div>

                    {/* Floating Parallax Orbs */}
                    <div
                        className="absolute top-20 left-10 w-96 h-96 bg-brand-500/5 blur-[100px] rounded-full transition-transform duration-300"
                        style={{ transform: `translate3d(0, ${scrollProgress * 400}px, 0)` }}
                    ></div>
                    <div
                        className="absolute bottom-20 right-10 w-[30rem] h-[30rem] bg-orange-500/5 blur-[120px] rounded-full transition-transform duration-300"
                        style={{ transform: `translate3d(0, ${-scrollProgress * 600}px, 0)` }}
                    ></div>

                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 relative z-10">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className={`reveal-on-scroll reveal-hidden relative group ${i === features.length - 1 ? 'md:col-span-2 md:max-w-xl md:mx-auto w-full' : ''}`}
                                style={{ transitionDelay: `${(i % 2) * 250}ms` }}
                            >
                                <div className="tilt-card relative bg-white dark:bg-white/[0.03] rounded-[4rem] p-12 border border-black/[0.05] dark:border-white/[0.05] shadow-2xl shadow-black/5 dark:shadow-none hover:border-brand-500/30 transition-all h-full flex flex-col backdrop-blur-3xl overflow-hidden">
                                    <div className="light-sweep"></div>
                                    <div className="aura-pulse"></div>
                                    <span className="feature-number text-slate-900 dark:text-white">{String(i + 1).padStart(2, '0')}</span>

                                    <div className="relative w-20 h-20 mb-10 group-hover:scale-110 transition-transform duration-700">
                                        <div className={`absolute inset-0 bg-${f.color}-500/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-1000`}></div>
                                        <div className="relative w-full h-full bg-white dark:bg-[#0D1721] border border-black/5 dark:border-white/10 rounded-3xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-all">
                                            {f.icon}
                                        </div>
                                    </div>

                                    <div className="relative z-10 flex-grow">
                                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">
                                            {f.title.split(' ').map((word, idx) => (
                                                <span key={idx} className={idx === 1 ? 'text-brand-600 block sm:inline' : ''}>{word} </span>
                                            ))}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-lg mb-10 max-w-sm">
                                            {f.desc}
                                        </p>
                                    </div>

                                    <Link href={f.link} className="relative z-10 group/btn inline-flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand-600 transition-all">
                                        <span className="h-[1px] w-8 bg-slate-200 dark:bg-white/10 group-hover/btn:w-12 group-hover/btn:bg-brand-500 transition-all"></span>
                                        Explore {f.label}
                                        <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover/btn:bg-brand-600 group-hover/btn:text-white group-hover/btn:border-brand-600 transition-all">
                                            <ArrowRight size={14} />
                                        </div>
                                    </Link>
                                </div>

                                {i % 2 !== 0 && (
                                    <div className="hidden lg:block absolute -right-12 top-1/2 -translate-y-1/2 w-2 h-24 bg-gradient-to-b from-transparent via-brand-500/20 to-transparent rounded-full"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Trust Section: University Partners */}
                <section className="py-20 bg-white dark:bg-[#0D1721] border-y border-black/5 dark:border-white/5">
                    <div className="max-w-7xl mx-auto px-6">
                        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12">Trusted by students at leading institutions</p>
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                            <div className="flex items-center gap-3">
                                <img src="/images/unizy-logo-icon.png" className="w-6 h-6 grayscale opacity-50" alt="" />
                                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">GCU</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <img src="/images/unizy-logo-icon.png" className="w-6 h-6 grayscale opacity-50" alt="" />
                                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">AUC</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <img src="/images/unizy-logo-icon.png" className="w-6 h-6 grayscale opacity-50" alt="" />
                                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">CU</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <img src="/images/unizy-logo-icon.png" className="w-6 h-6 grayscale opacity-50" alt="" />
                                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">GUC</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Platinum Purpose: The Student Advantage */}
                <section className="py-32 px-6 bg-slate-50 dark:bg-white/[0.02]">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-24 reveal-on-scroll reveal-hidden">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Designed for the 1%.</h2>
                            <p className="text-slate-500 font-bold text-xl max-w-2xl mx-auto">Performance tools for students who refuse to settle for the baseline campus experience.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                { title: "24/7 Security", desc: "Real-time monitoring and student-only verified circles.", icon: <ShieldCheck size={24} />, color: "blue" },
                                { title: "Macro Focused", desc: "Meal plans designed by nutritionists for peak performance.", icon: <Star size={24} />, color: "emerald" },
                                { title: "Elite Network", desc: "Connect with high-achievers across all Cairo campuses.", icon: <Users size={24} />, color: "purple" },
                                { title: "Instant Support", desc: "Platinum members get 2-minute average response times.", icon: <Zap size={24} />, color: "orange" }
                            ].map((item, i) => (
                                <div key={i} className="reveal-on-scroll reveal-hidden p-10 bg-white dark:bg-[#0D1721] rounded-[3rem] border border-black/5 dark:border-white/5 shadow-xl hover:-translate-y-2 transition-transform">
                                    <div className={`w-14 h-14 rounded-2xl bg-${item.color}-500/10 flex items-center justify-center text-${item.color}-500 mb-8`}>
                                        {item.icon}
                                    </div>
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">{item.title}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials: Student Voice */}
                <section className="py-32 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                            <div className="reveal-on-scroll reveal-hidden">
                                <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4">Loved by Students.</h2>
                                <p className="text-slate-500 font-bold text-lg">Real stories from the UniZy community.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-4 bg-white dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 shadow-xl">
                                    <p className="text-2xl font-black text-brand-600">4.9/5</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">App Store Rating</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: "Ahmed S.", role: "Engineering Student", quote: "UniZy Kitchen literally saved my budget. 45 EGP for a macro-balanced meal is unheard of in Cairo.", color: "blue" },
                                { name: "Sarah M.", role: "Architecture Major", quote: "Finding a roommate who matched my lifestyle and gender preferences was so easy with the similarity scoring.", color: "emerald" },
                                { name: "Omar K.", role: "Business Senior", quote: "The real-time shuttle tracking means I never miss a lecture. It's the performance tool every student needs.", color: "orange" }
                            ].map((t, i) => (
                                <div key={i} className="reveal-on-scroll reveal-hidden p-8 bg-white dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 relative overflow-hidden group">
                                    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${t.color}-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                    <MessageSquare className={`text-${t.color}-500 mb-6`} size={24} />
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300 italic mb-8">"{t.quote}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${t.color}-500 to-${t.color}-700 flex items-center justify-center text-white font-black`}>
                                            {t.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">{t.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* The Comparison: UniZy vs The Market */}
                <section className="py-32 bg-[#0D1721] text-white px-6 overflow-hidden relative">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-900/40 via-transparent to-transparent"></div>
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center mb-24 reveal-on-scroll reveal-hidden">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Premium doesn't mean expensive.</h2>
                            <p className="text-brand-400 font-black uppercase tracking-widest text-xs">The UniZy Standard</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="reveal-on-scroll reveal-hidden bg-white/5 p-12 rounded-[4rem] backdrop-blur-xl border border-white/10">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between text-white/40 font-bold uppercase tracking-widest text-[10px]">
                                        <span>Feature</span>
                                        <span>Traditional Market</span>
                                        <span className="text-brand-400">UniZy Way</span>
                                    </div>
                                    {[
                                        { label: "Meal Price", old: "120+ EGP", new: "45 EGP" },
                                        { label: "Delivery Fees", old: "60+ EGP", new: "Cheapest on Campus" },
                                        { label: "Housing Verification", old: "Risky / None", new: "Platinum Verified" },
                                        { label: "Shuttle Tracking", old: "Manual / Guess", new: "Real-time Precision" },
                                        { label: "Home Maintenance", old: "Infinite Worry", new: "Fixed Student Rates" }
                                    ].map((row, i) => (
                                        <div key={i} className="flex items-center justify-between py-6 border-b border-white/5 last:border-0">
                                            <span className="font-black text-lg">{row.label}</span>
                                            <span className="text-white/30 font-bold line-through">{row.old}</span>
                                            <span className="font-black text-emerald-400">{row.new}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="reveal-on-scroll reveal-hidden">
                                <h3 className="text-4xl font-black tracking-tighter mb-8 leading-tight italic">We didn't just build an app. We built a more efficient way to be a student.</h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-2xl font-black tracking-tighter text-brand-400">60%<span className="text-white text-sm ml-1">Market Savings</span></p>
                                    </div>
                                    <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-2xl font-black tracking-tighter text-emerald-400">100%<span className="text-white text-sm ml-1">Safety Focused</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ: Clarity & Support */}
                <section className="py-32 px-6 bg-slate-50 dark:bg-black/20">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16 reveal-on-scroll reveal-hidden">
                            <HelpCircle className="mx-auto text-brand-600 mb-6" size={32} />
                            <h2 className="text-5xl font-black tracking-tighter mb-4">Got Questions?</h2>
                            <p className="text-slate-500 font-bold">Everything you need to know about the Platinum experience.</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { q: "Is UniZy only for university students?", a: "Yes, our ecosystem is verified through university IDs to ensure a safe, student-exclusive environment for housing and transport." },
                                { q: "How does the Meal Subscription work?", a: "You can subscribe to weekly or monthly plans, saving up to 60% per meal compared to traditional delivery apps." },
                                { q: "Are the roommate matches safe?", a: "Absolutely. We use gender-locked pools and similarity scoring based on lifestyle habits (sleeping, studying, smoking) to ensure harmony." }
                            ].map((item, i) => (
                                <details key={i} className="group bg-white dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden reveal-on-scroll reveal-hidden">
                                    <summary className="p-8 flex items-center justify-between cursor-pointer list-none">
                                        <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{item.q}</span>
                                        <ChevronRight size={20} className="group-open:rotate-90 transition-transform text-slate-400" />
                                    </summary>
                                    <div className="px-8 pb-8 text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                                        {item.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Final */}
                <section className="pt-48 pb-12 px-6 text-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-500/5 blur-[120px] rounded-full pointer-events-none"></div>
                    <div className="max-w-3xl mx-auto reveal-on-scroll reveal-hidden relative z-10">
                        <img src="/images/unizy-logo-icon.png" className="w-24 h-24 mx-auto mb-12 animate-float" alt="UniZy Logo" />
                        <h2 className="text-6xl font-black tracking-tighter mb-8 italic">Life is better when everything is unified.</h2>
                        <div className="flex flex-col items-center gap-6">
                            <Link href="/login" className="inline-flex items-center justify-center px-16 py-8 bg-brand-600 text-white rounded-[3rem] font-black text-2xl shadow-4xl hover:scale-105 transition-all">
                                Start Your Journey
                            </Link>
                            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-12">No Hidden Fees • Student Verified • Platinum Support</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="pb-32 md:pb-20 pt-12 px-6 border-t border-black/5 dark:border-white/5 text-slate-500">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                    <div className="flex flex-col gap-6 items-center md:items-start">
                        <div className="flex items-center gap-3">
                            <img src="/images/unizy-logo-icon.png" className="w-8 h-8 opacity-50 grayscale" alt="UniZy" />
                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">UniZy</span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">Bridging the gap between students and services.</p>
                    </div>

                    <div className="flex gap-12">
                        {['Services', 'About', 'Privacy', 'Support'].map(f => (
                            <Link key={f} href="#" className="font-black text-[10px] uppercase tracking-[0.2em] hover:text-brand-600 transition-colors">{f}</Link>
                        ))}
                    </div>

                    <p className="text-[10px] uppercase tracking-widest font-bold">© 2026 UniZy Technologies • Built for Excellence</p>
                </div>
            </footer>

            {/* Mobile Sticky CTA: CRO Hardening */}
            <div className={`md:hidden fixed bottom-6 left-6 right-6 z-[2000] transition-all duration-500 transform ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
                <Link href="/login" className="flex items-center justify-between w-full px-8 py-5 bg-brand-600 text-white rounded-[2rem] font-black text-sm shadow-4xl backdrop-blur-xl border border-white/20">
                    <span>GET STARTED</span>
                    <ArrowRight size={18} />
                </Link>
            </div>
        </div>
    );
}
