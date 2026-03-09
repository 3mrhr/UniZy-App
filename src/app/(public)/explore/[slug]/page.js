'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    ShieldCheck, Zap, Star, LayoutGrid, Sparkles, Wrench, Tag,
    ArrowLeft, ArrowRight, CheckCircle2, Globe, Clock, CreditCard
} from 'lucide-react';

const serviceData = {
    housing: {
        title: "Housing Platinum",
        subtitle: "Find your perfect campus sanctuary.",
        description: "Secure, verified, and lifestyle-matched housing for the modern student. We don't just find you an apartment; we find you a home.",
        icon: <ShieldCheck className="text-blue-500" size={48} />,
        color: "blue",
        features: [
            "Gender-locked similarity scoring for roommates",
            "100% Verified property listings",
            "Digital contract management",
            "Secure deposit handling"
        ],
        stats: [
            { label: "Verified Listings", value: "500+" },
            { label: "Successful Matches", value: "1,200" },
            { label: "Safety Rating", value: "99.9%" }
        ]
    },
    transport: {
        title: "Smart Transport",
        subtitle: "The pulse of campus mobility.",
        description: "Real-time tracking, precise coordinates, and student-exclusive rides. Never miss a lecture again with UniZy's high-performance transport network.",
        icon: <Zap className="text-orange-500" size={48} />,
        color: "orange",
        features: [
            "Real-time shuttle GPS tracking",
            "Coordinate-precise pickup points",
            "Verified student driver network",
            "Integrated cashless payments"
        ],
        stats: [
            { label: "Daily Trips", value: "2,500+" },
            { label: "Avg. Wait Time", value: "< 4 min" },
            { label: "Routes Covered", value: "12" }
        ]
    },
    meals: {
        title: "UniZy Kitchen",
        subtitle: "Fueling your academic performance.",
        description: "Macro-balanced meal plans delivered fresh to your door. Save up to 60% on your daily dining with our subscription economy model.",
        icon: <Star className="text-emerald-500" size={48} />,
        color: "emerald",
        features: [
            "Nutritionist-approved macro plans",
            "Zero delivery fees for subscribers",
            "Flexible plan management",
            "Daily fresh campus deliveries"
        ],
        stats: [
            { label: "Avg. Meal Cost", value: "45 EGP" },
            { label: "Active Subscribers", value: "3,000+" },
            { label: "Savings Year 1", value: "60%" }
        ]
    },
    delivery: {
        title: "Elite Delivery",
        subtitle: "Whatever you need, whenever you need it.",
        description: "The most efficient delivery network on campus. From restaurant cravings to custom 'Order Anything' requests, we've got you covered.",
        icon: <LayoutGrid className="text-purple-500" size={48} />,
        color: "purple",
        features: [
            "Cheapest delivery fees on campus",
            "Real-time order progress tracking",
            "Custom request fulfillment",
            "OTP-secured handshakes"
        ],
        stats: [
            { label: "Deliveries Today", value: "850+" },
            { label: "Success Rate", value: "99.8%" },
            { label: "Avg. Delivery", value: "22 min" }
        ]
    },
    cleaning: {
        title: "Pro Cleaning",
        subtitle: "A clean space for a clear mind.",
        description: "Professional cleaning services scheduled at your convenience. High-standard hygiene for student homes at fraction of market prices.",
        icon: <Sparkles className="text-cyan-500" size={48} />,
        color: "cyan",
        features: [
            "Professional background-checked staff",
            "Customizable cleaning checklists",
            "Recurrent booking discounts",
            "Eco-friendly cleaning supplies"
        ],
        stats: [
            { label: "Houses Cleaned", value: "400+" },
            { label: "Satisfaction", value: "4.8/5" },
            { label: "Slots Available", value: "24/7" }
        ]
    },
    maintenance: {
        title: "Home Maintenance",
        subtitle: "Zero-friction home repairs.",
        description: "Never worry about broken pipes or faulty wiring again. On-demand maintenance services with fixed, student-first transparent pricing.",
        icon: <Wrench className="text-amber-500" size={48} />,
        color: "amber",
        features: [
            "Instant technician dispatch",
            "Fixed rates for common repairs",
            "Quality-guaranteed workmanship",
            "Emergency 24/7 support"
        ],
        stats: [
            { label: "Repairs Completed", value: "150+" },
            { label: "Trust Score", value: "100%" },
            { label: "Response Time", value: "< 1 hr" }
        ]
    },
    discounts: {
        title: "City Discounts",
        subtitle: "Exclusive scarcity-based rewards.",
        description: "Your student ID, supercharged. Unlock massive deals across the city with UniZy-exclusive vouchers and scarcity-based rewards.",
        icon: <Tag className="text-rose-500" size={48} />,
        color: "rose",
        features: [
            "QR-based instant redemptions",
            "Scarcity-based limited deals",
            "Merchant-verified partnerships",
            "Personalized offer matching"
        ],
        stats: [
            { label: "Partner Brands", value: "120+" },
            { label: "Avg. Savings", value: "25%" },
            { label: "Deals Redeemed", value: "15k+" }
        ]
    }
};

export default function ExploreServicePage() {
    const params = useParams();
    const slug = params.slug;
    const service = serviceData[slug];

    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        setIsRevealed(true);
    }, []);

    if (!service) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-black mb-4">Module Not Found</h1>
                <Link href="/" className="text-brand-600 font-bold flex items-center gap-2">
                    <ArrowLeft size={20} /> Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFD] dark:bg-[#0D1721] overflow-x-hidden selection:bg-brand-500 selection:text-white">
            {/* Minimal Nav */}
            <nav className="fixed top-0 w-full z-[1000] px-6 py-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group px-4 py-2 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/10 transition-all hover:scale-105">
                        <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Back to Home</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link href="/login" className="px-8 py-4 bg-brand-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-brand-500/20 hover:scale-105 transition-all">Get Started</Link>
                    </div>
                </div>
            </nav>

            <main className="flex-grow pt-32 pb-20">
                {/* Hero Section */}
                <section className="px-6 mb-24">
                    <div className="max-w-7xl mx-auto">
                        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-${service.color}-500/10 mb-12 animate-fade-in`}>
                            {service.icon}
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 leading-[0.9] animate-slide-up">
                            {service.title.split(' ')[0]}<br />
                            <span className={`text-${service.color}-500`}>{service.title.split(' ')[1]}</span>
                        </h1>
                        <p className="text-2xl md:text-3xl font-bold text-slate-500 dark:text-slate-400 max-w-2xl mb-12 animate-slide-up delay-100">
                            {service.subtitle}
                        </p>
                    </div>
                </section>

                {/* Content Bento Grid */}
                <section className="px-6 mb-32">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Summary Box */}
                        <div className="md:col-span-12 lg:col-span-8 p-12 bg-white dark:bg-white/5 rounded-[4rem] border border-black/5 dark:border-white/5 shadow-2xl shadow-black/5 relative overflow-hidden group">
                            <div className={`absolute -right-20 -top-20 w-80 h-80 bg-${service.color}-500/5 blur-[100px] rounded-full`}></div>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">The Vision</h2>
                            <p className="text-xl font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                                {service.description}
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="md:col-span-12 lg:col-span-4 p-12 bg-slate-900 text-white rounded-[4rem] flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest text-white/40 mb-10">Platinum Standards</h3>
                                <div className="space-y-6">
                                    {service.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-4">
                                            <CheckCircle2 size={24} className={`text-${service.color}-400 shrink-0`} />
                                            <p className="font-bold text-lg leading-tight">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10">
                                <p className="text-xs font-black uppercase tracking-widest text-white/30 mb-2">Service Availability</p>
                                <p className="text-lg font-black uppercase">Live in All Cairo Campuses</p>
                            </div>
                        </div>

                        {/* Performance Stats */}
                        {service.stats.map((stat, idx) => (
                            <div key={idx} className="md:col-span-4 p-12 bg-white dark:bg-white/5 rounded-[4rem] border border-black/5 dark:border-white/5 shadow-xl text-center hover:scale-105 transition-all">
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-4">{stat.label}</p>
                                <p className={`text-6xl font-black text-${service.color}-500 tracking-tighter`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it Works: Step by Step */}
                <section className="px-6 py-32 bg-slate-50 dark:bg-white/[0.02]">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-5xl font-black text-center mb-24 tracking-tighter">Unified Workflow.</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                            {/* Connector Line */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent"></div>

                            {[
                                { step: "01", title: "Verify Hub", desc: "Sign in with your university ID to access the exclusive platinum circle.", icon: <Globe /> },
                                { step: "02", title: "Select Module", desc: "Choose your service and customize your specific requirements.", icon: <Clock /> },
                                { step: "03", title: "One-Tap Sync", desc: "Confirm your order or booking and track its real-time progress.", icon: <CreditCard /> }
                            ].map((item, i) => (
                                <div key={i} className="relative z-10 text-center flex flex-col items-center group">
                                    <div className={`w-20 h-20 rounded-full bg-white dark:bg-[#0D1721] border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-${service.color}-500 group-hover:scale-110 group-hover:border-${service.color}-500/50 transition-all shadow-xl mb-8`}>
                                        {item.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 mb-4">{item.step}</span>
                                    <h4 className="text-2xl font-black mb-4 tracking-tight">{item.title}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-[250px]">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Redirect */}
                <section className="py-48 px-6 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-6xl font-black tracking-tighter mb-8 italic">Ready to go Platinum?</h2>
                        <div className="flex flex-col items-center gap-6">
                            <Link href="/login" className={`inline-flex items-center justify-center px-16 py-8 bg-${service.color}-500 text-white rounded-[3rem] font-black text-2xl shadow-4xl hover:scale-105 transition-all`}>
                                Unlock {service.title.split(' ')[0]} Now
                            </Link>
                            <Link href="/" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Return to Modules Grid</Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-20 px-6 border-t border-black/5 dark:border-white/5 text-slate-500">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-[10px] uppercase tracking-widest font-bold">© 2026 UniZy Technologies • Performance Infrastructure for Students</p>
                </div>
            </footer>
        </div>
    );
}
