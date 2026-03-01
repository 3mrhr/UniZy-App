'use client';

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from '@/i18n/LanguageProvider';

export default function LandingPage() {
    const { dict } = useLanguage();
    const t = dict.landing;

    const services = [
        {
            id: 'housing',
            title: t.housing,
            description: t.housingDesc,
            icon: "🏠",
            color: "from-blue-500 to-indigo-600",
            href: "/housing"
        },
        {
            id: 'transport',
            title: t.transport,
            description: t.transportDesc,
            icon: "🚗",
            color: "from-orange-400 to-red-500",
            href: "/transport"
        },
        {
            id: 'delivery',
            title: t.delivery,
            description: t.deliveryDesc,
            icon: "🍔",
            color: "from-green-400 to-emerald-600",
            href: "/delivery"
        },
        {
            id: 'deals',
            title: t.deals,
            description: t.dealsDesc,
            icon: "🏷️",
            color: "from-purple-400 to-pink-500",
            href: "/deals"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-unizy-navy overflow-hidden">

            {/* Hero Section */}
            <section className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
                    <div className="animate-fade-in-up">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                            {t.hero}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-lg leading-relaxed">
                            {t.heroSub}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/login"
                                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95"
                            >
                                {t.getStarted}
                            </Link>
                            <Link
                                href="#services"
                                className="bg-gray-100 dark:bg-unizy-dark hover:bg-gray-200 dark:hover:bg-unizy-dark/80 text-gray-900 dark:text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all"
                            >
                                {t.learnMore}
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-unizy-navy bg-gray-200 flex items-center justify-center overflow-hidden">
                                        <span className="text-xs">👤</span>
                                    </div>
                                ))}
                            </div>
                            <span>{t.trusted}</span>
                        </div>
                    </div>

                    <div className="relative animate-fade-in flex justify-center items-center">
                        <div className="relative w-full max-w-md aspect-square">
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 to-blue-400 rounded-[3rem] rotate-6 opacity-20"></div>
                            <div className="absolute inset-0 bg-white dark:bg-unizy-dark rounded-[3rem] shadow-2xl flex items-center justify-center p-12 border border-gray-100 dark:border-white/5">
                                <div className="relative w-48 h-48 opacity-90 hover:scale-110 transition-transform duration-500">
                                    <Image src="/images/unizy-logo-icon.png" alt="UniZy Logo" fill className="object-contain drop-shadow-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-24 bg-gray-50 dark:bg-unizy-dark/50 px-6 md:px-12 transition-colors duration-300">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 text-center max-w-2xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">{t.features}</h2>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                            {t.featuresDesc}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, idx) => (
                            <div
                                key={service.id}
                                className="group relative bg-white dark:bg-unizy-navy p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-white/5 flex flex-col h-full hover:-translate-y-2 overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity blur-2xl`}></div>

                                <div className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl text-white shadow-lg mb-8 group-hover:rotate-12 transition-transform`}>
                                    {service.icon}
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{service.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
                                    {service.description}
                                </p>

                                <Link
                                    href={service.href}
                                    className="mt-8 flex items-center gap-2 font-bold text-brand-600 dark:text-brand-400 group/link"
                                >
                                    {dict.common.viewAll} <span className="transition-transform group-hover/link:translate-x-1 group-hover/link:rtl:-translate-x-1">→</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6 md:px-12 bg-white dark:bg-unizy-navy overflow-hidden">
                <div className="max-w-6xl mx-auto relative rounded-[3rem] p-12 md:p-20 bg-gradient-to-br from-brand-900 via-brand-700 to-indigo-900 text-white overflow-hidden shadow-[0_20px_50px_rgba(13,23,33,0.3)]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>

                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                            {t.cta}
                        </h2>
                        <p className="text-blue-100 text-lg md:text-xl mb-12 leading-relaxed opacity-90">
                            {t.ctaSub}
                        </p>
                        <Link
                            href="/login"
                            className="inline-block bg-white text-brand-900 px-10 py-5 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            {t.getStarted}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-unizy-dark px-6 md:px-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                            <Image src="/images/unizy-logo-icon.png" alt="UniZy Logo" fill className="object-contain" />
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tighter italic">UniZy</span>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Link href="/terms" className="hover:text-brand-600 transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
                        <Link href="/contact" className="hover:text-brand-600 transition-colors">Contact Us</Link>
                    </nav>

                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        {t.footer}
                    </p>
                </div>
            </footer>
        </div>
    );
}
