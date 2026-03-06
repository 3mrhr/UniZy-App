'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useWalletStore } from '@/store/useWalletStore';
import { Home, Truck, ShoppingBag, Tag, UtensilsCrossed, Users, Search, Gift, Bell, MapPin, ArrowRight, Star, MessageCircle, Package, Calendar, Wrench, Sparkles, Wallet, ShieldCheck, TrendingUp } from 'lucide-react';
import { getMyNotifications } from '@/app/actions/notifications';
import { getCurrentUser } from '@/app/actions/auth';

const SERVICES = [
  { id: 'housing', label: 'Housing', arLabel: 'سكن', icon: Home, color: 'from-blue-500 to-indigo-600', href: '/housing' },
  { id: 'transport', label: 'Transport', arLabel: 'مواصلات', icon: Truck, color: 'from-cyan-500 to-blue-600', href: '/transport' },
  { id: 'delivery', label: 'Delivery', arLabel: 'توصيل', icon: ShoppingBag, color: 'from-orange-500 to-red-500', href: '/delivery' },
  { id: 'deals', label: 'Deals', arLabel: 'عروض', icon: Tag, color: 'from-emerald-500 to-teal-600', href: '/deals' },
  { id: 'meals', label: 'Meals', arLabel: 'وجبات', icon: UtensilsCrossed, color: 'from-amber-500 to-orange-600', href: '/meals' },
  { id: 'hub', label: 'Hub', arLabel: 'المجتمع', icon: Users, color: 'from-purple-500 to-violet-600', href: '/hub' },
  { id: 'services', label: 'Services', arLabel: 'خدمات', icon: Wrench, color: 'from-rose-500 to-pink-600', href: '/services' },
  { id: 'cleaning', label: 'Cleaning', arLabel: 'تنظيف', icon: Sparkles, color: 'from-emerald-500 to-teal-600', href: '/services/cleaning' },
];

export default function StudentHome() {
  const { locale, dict } = useLanguage();
  const isRTL = locale === 'ar';
  const router = useRouter();
  const { wallet, fetchWallet, initialized: walletInitialized } = useWalletStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchNotifs = async () => {
      const res = await getMyNotifications();
      if (res.success) {
        setUnreadCount(res.unreadCount || 0);
      }
    };
    const fetchUser = async () => {
      const fetchedUser = await getCurrentUser();
      setUser(fetchedUser);
    };
    fetchNotifs();
    fetchUser();
    if (!walletInitialized) {
      fetchWallet();
    }
  }, [walletInitialized, fetchWallet]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32 transition-colors animate-fade-in">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square bg-brand-500 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] aspect-square bg-indigo-500 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Modern Header HUD */}
      <div className="relative px-6 pt-12 pb-24 z-10 overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 rounded-b-[4rem] shadow-2xl">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>

        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-x-0 bottom-[-4px] h-1 bg-white/20 blur-sm rounded-full scale-x-75 opacity-0 group-hover:opacity-100 transition-all"></div>
                <Link href="/account" className="block w-14 h-14 rounded-[2rem] border-2 border-white/20 p-1 bg-white/10 backdrop-blur-md transition-all active:scale-90 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=random&color=fff&size=56`} alt="Avatar" className="w-full h-full object-cover rounded-[1.8rem]" />
                </Link>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-brand-700 rounded-full scale-110"></div>
              </div>
              <div className="flex flex-col">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1">Authenticated</p>
                <h1 className="text-2xl font-black text-white tracking-tighter leading-none italic">{user?.name ? user.name.split(' ')[0] : 'Student'}</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/notifications" className="w-12 h-12 bg-white/10 backdrop-blur-3xl rounded-[1.8rem] border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:translate-x-full transition-transform duration-500"></div>
                <Bell size={20} className="text-white relative z-10" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full border-4 border-brand-700 flex items-center justify-center text-[8px] font-black text-white z-20 animate-bounce">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </Link>
            </div>
          </div>

          {/* Integrated Wallet HUD Card */}
          <Link href="/wallet" className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center justify-between p-7 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden active:scale-[0.98] transition-all">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-white/60 font-black text-[10px] uppercase tracking-[0.3em]">Campus Credits</p>
                  <ShieldCheck size={12} className="text-cyan-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white italic tracking-tighter drop-shadow-md">
                    {wallet?.balance?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-sm font-black text-white/40 uppercase tracking-widest">EGP</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform duration-500 shadow-inner">
                  <TrendingUp size={24} className="text-cyan-400" />
                </div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full border border-white/10">Manage Wallet</p>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Experience Grid */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20 flex flex-col gap-10">

        {/* Core Services - Premium Grid */}
        <section>
          <div className="flex items-center justify-between px-2 mb-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 italic tracking-tighter">
              <Sparkles size={18} className="text-brand-500" />
              University Life
            </h2>
            <div className="h-px flex-1 mx-4 bg-gray-200 dark:bg-white/5"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICES.slice(0, 4).map((service, idx) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="relative group h-40"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} rounded-[2rem] opacity-0 group-hover:opacity-100 blur transition-all duration-500 group-hover:blur-xl`}></div>
                  <div className="relative h-full bg-white dark:bg-black/40 backdrop-blur-xl border border-gray-100 dark:border-white/10 rounded-[2rem] p-6 flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 shadow-xl dark:shadow-none group overflow-hidden">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 leading-none">{isRTL ? 'خدمة' : 'Service'}</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white italic tracking-tighter leading-none">{isRTL ? service.arLabel : service.label}</p>
                    </div>
                    {/* Ghost Icon background */}
                    <Icon size={80} className="absolute -bottom-4 -right-4 opacity-[0.03] dark:opacity-[0.05] rotate-12" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Dynamic Activity HUD */}
        <section className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between px-2 mb-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 italic tracking-tighter">
              <TrendingUp size={18} className="text-green-500" />
              In Progress
            </h2>
            <Link href="/activity" className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] hover:underline transition-all">Historical Log →</Link>
          </div>

          <Link href="/activity/tracking" className="relative group block">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-white/60 dark:bg-black/20 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden flex items-center gap-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-[1.8rem] flex items-center justify-center shrink-0 border border-green-500/20 group-hover:rotate-12 transition-transform shadow-inner">
                <Truck size={32} className="text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em] mb-1">Live Tracking</p>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-gray-900 dark:text-white text-xl tracking-tighter italic">Campus Shuttle Incoming</h3>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} className="text-gray-400" />
                  El Matarya Hub • 5 min away
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl group-hover:translate-x-1 transition-transform">
                <ArrowRight className="text-gray-400" />
              </div>
            </div>
          </Link>
        </section>

        {/* Secondary Services Slider */}
        <section className="mb-10 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between px-2 mb-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 italic tracking-tighter">
              <Package size={18} className="text-orange-500" />
              Essential Kits
            </h2>
            <div className="h-px flex-1 mx-4 bg-gray-200 dark:bg-white/5"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar px-2 -mx-2">
            {SERVICES.slice(4).map((service, idx) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-5 rounded-[2.2rem] flex flex-col items-center justify-center gap-4 min-w-[140px] hover:border-brand-500/30 transition-all shadow-sm group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <p className="text-sm font-black text-gray-900 dark:text-white italic tracking-tighter">{isRTL ? service.arLabel : service.label}</p>
                </Link>
              )
            })}
          </div>
        </section>
      </div>

      {/* Floating Rewards Indicator */}
      <div className="fixed bottom-28 left-6 right-6 z-50 animate-bounce-slow">
        <Link href="/rewards" className="flex items-center justify-between p-4 rounded-3xl bg-black dark:bg-brand-600 text-white shadow-2xl border border-white/10 group active:scale-95 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center rotate-12">
              <Gift size={20} className="text-brand-200" />
            </div>
            <div className="flex flex-col">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 leading-none mb-1">Loyalty Points</p>
              <p className="text-xl font-black italic tracking-tighter leading-none">1,250 <span className="text-xs opacity-60">PTS</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
            <span className="text-xs font-black uppercase tracking-widest">{isRTL ? 'استبدل' : 'Redeem'}</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>
    </main>
  );
}
