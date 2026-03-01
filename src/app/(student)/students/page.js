'use client';

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from '@/i18n/LanguageProvider';

export default function Home() {
  const { locale, dict } = useLanguage();
  const t = dict.home;

  const quickAccessCards = [
    { label: t.housing, icon: "🏠", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", href: "/housing" },
    { label: t.transport, icon: "🚗", bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", href: "/transport" },
    { label: t.delivery, icon: "🍔", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", href: "/delivery" },
    { label: t.deals, icon: "🏷️", bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", href: "/deals" },
  ];

  const currentOffers = [
    { id: 1, title: '50% off first Ride', code: 'RIDE50', color: 'from-blue-500 to-cyan-400' },
    { id: 2, title: 'Free Delivery at Campus Food', code: 'FREEDEL', color: 'from-orange-500 to-yellow-400' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">

      {/* Header Section */}
      <header className="bg-white dark:bg-unizy-navy px-6 md:px-12 pt-12 pb-6 shadow-sm rounded-b-3xl mb-4 z-10 sticky top-0 max-w-7xl mx-auto w-full transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t.greeting}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t.subgreeting}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-brand-500 to-blue-300 p-[2px] shadow-md">
            <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <span className="text-xl">🧑‍🎓</span>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 rtl:left-auto rtl:right-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
            🔍
          </div>
          <input
            type="text"
            className="w-full bg-gray-100 dark:bg-unizy-dark border-none text-gray-900 dark:text-white text-sm rounded-2xl block pl-10 rtl:pl-4 rtl:pr-10 p-4 focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-unizy-navy transition-all outline-none shadow-inner"
            placeholder={t.search}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-6 md:px-12 flex flex-col gap-8 animate-fade-in max-w-7xl mx-auto w-full">

        {/* Rewards Summary Card */}
        <div className="glass-panel p-5 flex items-center justify-between bg-gradient-to-r from-brand-900 to-brand-600 text-white shadow-brand-500/20 shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl rtl:right-auto rtl:-left-8 rtl:blur-xl"></div>
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">{t.rewards}</p>
            <h2 className="text-3xl font-bold flex items-baseline gap-1">1,250 <span className="text-sm font-normal text-blue-200">pts</span></h2>
          </div>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2">
            {t.redeem}
          </button>
        </div>

        {/* Quick Access Grid */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.services}</h3>
          </div>
          <div className="grid grid-cols-4 md:flex md:flex-wrap md:gap-6 gap-3">
            {quickAccessCards.map((card, idx) => (
              <Link
                key={idx}
                href={card.href}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-16 h-16 rounded-2xl ${card.bg} flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 group-active:scale-95 transition-transform duration-200`}>
                  {card.icon}
                </div>
                <span className={`text-[11px] font-semibold tracking-wide ${card.text}`}>{card.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Active Requests / Bookings */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.activeActivity}</h3>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-brand-100 transition-colors">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
              🚗
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">Ride to Campus</h4>
              <p className="text-xs text-gray-500 mt-1">Driver arriving in 3 mins</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </section>

        {/* Promotional Banner Carousel */}
        <section className="mb-6 md:mb-12">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.offers}</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
            {currentOffers.map(offer => (
              <div key={offer.id} className={`snap-center shrink-0 w-[280px] rounded-2xl p-5 bg-gradient-to-br ${offer.color} text-white shadow-md relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h4 className="text-lg font-bold w-3/4 leading-tight mb-4">{offer.title}</h4>
                <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wider border border-white/30">
                  {offer.code}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
