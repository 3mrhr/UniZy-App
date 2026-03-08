'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  Home,
  Truck,
  ShoppingBag,
  Tag,
  UtensilsCrossed,
  Users,
  Search,
  Gift,
  Bell,
  MapPin,
  ArrowRight,
  Star,
  MessageCircle,
  Package,
  Calendar,
  Wrench,
  Sparkles,
  Heart,
  ChevronRight,
  Leaf,
  LayoutDashboard,
  Wallet,
  Zap
} from 'lucide-react';
import { getMyNotifications } from '@/app/actions/notifications';
import { getHomeOverview } from '@/app/actions/home';

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

const QUICK_ACTIONS = [
  { label: 'Search', icon: Search, href: '/search', color: 'bg-brand-100 dark:bg-brand-900/20 text-brand-600' },
  { label: 'Rewards', icon: Gift, href: '/rewards', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600' },
  { label: 'Parcel', icon: Package, href: '/delivery/parcel', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600' },
  { label: 'Cleaning', icon: Sparkles, href: '/services/cleaning', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600' },
];

export default function StudentHome() {
  const { locale, dict } = useLanguage();
  const isRTL = locale === 'ar';
  const [unreadCount, setUnreadCount] = useState(0);
  const [homeData, setHomeData] = useState({
    name: '',
    walletBalance: 0,
    rewardPoints: 0,
    streak: 0,
    activeActivity: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const fetchData = async () => {
      setIsLoading(true);
      const [notifsRes, homeRes] = await Promise.all([
        getMyNotifications(),
        getHomeOverview()
      ]);

      if (notifsRes.success) setUnreadCount(notifsRes.unreadCount || 0);
      if (homeRes.success) setHomeData(homeRes.data);
      setIsLoading(false);
    };

    fetchData();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] dark:bg-[#0D1721] pb-24 transition-colors duration-500 overflow-x-hidden">
      {/* Redundant Mobile Header Removed (handled by ClientLayout) */}


      {/* Hero Header with Dynamic HSL Aura */}
      <div className="relative pt-12 pb-20 px-6 overflow-hidden">
        {/* Pro Max Background Physics */}
        <div className="absolute top-[-10%] right-[-10%] w-[80%] aspect-square bg-[radial-gradient(circle,var(--brand-glow)_0%,transparent_70%)] opacity-60 animate-pulse"></div>
        <div className="absolute top-0 right-0 left-0 h-[600px] bg-gradient-to-b from-brand-600/10 via-brand-500/5 to-transparent pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  {homeData.streak > 0 ? `🔥 ${homeData.streak} Day Streak` : 'Active Session'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight italic">
                {isRTL ? 'يا هلا،' : 'Hey,'} <span className="text-brand-600 dark:text-brand-400">{homeData.name || 'Ahmed'}</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-base">
                {isRTL ? 'إيه المخطط النهاردة؟' : "What's the plan for today?"}
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/notifications" className="w-12 h-12 bg-white dark:bg-white/5 shadow-xl shadow-brand-500/5 backdrop-blur-xl rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative border border-white/50 dark:border-white/5">
                <Bell size={20} className="text-slate-600 dark:text-white group-hover:text-brand-600 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-white dark:border-[#0D1721] flex items-center justify-center text-[8px] font-black text-white">{unreadCount}</span>
                )}
              </Link>
              <Link href="/account" className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-white/5 shadow-2xl hover:scale-110 transition-transform bg-brand-600">
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(homeData.name || 'User')}&background=2563eb&color=fff&size=48`} alt="Avatar" className="w-full h-full object-cover" />
              </Link>
            </div>
          </div>

          {/* UniZy Financial & Activity Center */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Main Wallet - Fin-Tech Pro */}
            <div className="md:col-span-8 group relative overflow-hidden bg-[#0F172A] rounded-[2.5rem] p-8 shadow-2xl transition-all hover:translate-y-[-4px] border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-brand-400">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">UniZy Account</p>
                      <p className="text-sm font-bold text-white">Main Balance</p>
                    </div>
                  </div>
                  <Link href="/wallet" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all border border-white/10">
                    Manage
                  </Link>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-brand-400 italic">EGP</span>
                      <p className="text-5xl font-black text-white tracking-tighter tabular-nums leading-none">
                        {homeData.walletBalance.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">Available for spend</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right">
                    <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/20">
                      <Zap size={10} className="text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        {homeData.rewardPoints.toLocaleString()} Coins
                      </span>
                    </div>
                    <Link href="/rewards/shop" className="text-brand-400 font-black text-[10px] uppercase tracking-widest hover:text-brand-300 underline decoration-brand-400/30 underline-offset-4">
                      Redeem in Store
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Status Bento */}
            <div className="md:col-span-4 space-y-4">
              {/* Active Status Card */}
              <div className="h-full bg-white dark:bg-white/5 backdrop-blur-3xl rounded-[2.25rem] p-6 border border-slate-100 dark:border-white/5 shadow-xl transition-all hover:bg-white/10 group cursor-pointer" onClick={() => window.location.href = '/activity'}>
                {homeData.activeActivity ? (
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
                        {homeData.activeActivity.type === 'ORDER' ? <Package size={20} /> : <Calendar size={20} />}
                      </div>
                      <div className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="font-black text-slate-900 dark:text-white text-sm">{homeData.activeActivity.title}</p>
                      <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mt-1">{homeData.activeActivity.status.replace('_', ' ')}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{homeData.activeActivity.time}</span>
                      <ArrowRight size={14} className="text-brand-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-2">
                      <LayoutDashboard size={20} />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Active Sessions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* Main Services - The Grid Hub */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">{isRTL ? 'استكشف الخدمات' : 'Explore Universe'}</h2>
            <Link href="/services" className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1 group">
              {isRTL ? 'الكل' : 'View All'} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="group relative h-40 bg-white dark:bg-[#0c1622] rounded-[2rem] p-5 border border-slate-100 dark:border-white/5 flex flex-col justify-between hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 hover:translate-y-[-4px]"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight -mb-1">{isRTL ? service.arLabel : service.label}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{service.id}</p>
                  </div>
                  {/* Subtle Background Number */}
                  <span className="absolute top-4 right-6 text-6xl font-black text-slate-50 dark:text-white/5 pointer-events-none select-none group-hover:text-brand-500/10 transition-colors">0{idx + 1}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Student Hub Feed Preview - High Fidelity */}
        <section className="relative">
          <div className="absolute inset-0 bg-brand-500/5 blur-3xl -z-10 rounded-[3rem]"></div>
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic">{isRTL ? 'نبض المجتمع' : 'Community Pulse'}</h2>
            <Link href="/hub" className="text-sm font-bold text-brand-600 flex items-center gap-1">
              {isRTL ? 'المجتمع' : 'Open Hub'} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {/* Feed Card 1 */}
            <div className="bg-white dark:bg-[#0c1622] rounded-[2.25rem] p-6 border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg border-2 border-brand-500/20">
                  <img src="https://ui-avatars.com/api/?name=Sarah+M&background=0D8ABC&color=fff&size=40" alt="Sarah" />
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-sm">Sarah Ahmed <span className="text-brand-600 text-[10px] bg-brand-50 dark:bg-brand-500/10 px-1.5 py-0.5 rounded ml-1 uppercase">Pro Student</span></p>
                  <p className="text-[10px] font-bold text-slate-400 lowercase tracking-tight">Engineering Faculty • 2h ago</p>
                </div>
                <button className="ml-auto w-8 h-8 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                  <ChevronRight size={18} />
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed mb-4">
                {isRTL ? 'حد معاه ملخصات مادة الفيزياء 101 للمهندس علي؟ المحاضرة الرابعة ناقصة عندي 🙏' : 'Does anyone have the Physics 101 summary for Eng. Ali? I missed the 4th lecture notes! 🙏'}
              </p>
              <div className="flex items-center gap-6 border-t border-slate-50 dark:border-white/5 pt-4">
                <button className="flex items-center gap-1.5 text-slate-400 font-black text-xs hover:text-brand-600 transition-colors">
                  <Heart size={16} /> 24
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 font-black text-xs hover:text-brand-600 transition-colors">
                  <MessageCircle size={16} /> 12
                </button>
                <div className="ml-auto flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0c1622] bg-slate-200 overflow-hidden shadow-sm">
                      <img src={`https://ui-avatars.com/api/?name=Student+${i}&size=24`} alt="s" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Promo Bento Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/20 blur-3xl rounded-full -mr-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <Wrench size={40} className="mb-6 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-500" />
              <h3 className="text-2xl font-black italic tracking-tighter mb-2">{isRTL ? 'خدمات منزلية متكاملة' : 'Fix Everything.'}</h3>
              <p className="text-rose-100 font-bold text-sm mb-6 max-w-[200px]">{isRTL ? 'أفضل الصنايعية بضمان يونيزي لدعمك في السكن' : 'Carpenters, plumbers, and more—vetted and guaranteed.'}</p>
              <Link href="/services" className="inline-flex items-center gap-2 bg-white text-pink-600 font-black px-5 py-3 rounded-2xl text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-rose-900/20">
                {isRTL ? 'احجز الآن' : 'Book Service'} <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-brand-900/20 rounded-[2.5rem] p-8 text-white border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Leaf size={100} className="rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
                <UtensilsCrossed size={24} />
              </div>
              <h3 className="text-2xl font-black italic tracking-tighter mb-2">{isRTL ? 'اشتراكات الوجبات الصحية' : 'Healthy Meals.'}</h3>
              <p className="text-slate-400 font-bold text-sm mb-6 max-w-[200px]">{isRTL ? 'وفّر وقتك وفلوسك مع باقات الوجبات الأسبوعية' : 'Subscribe to meal plans and save up to 40% monthly.'}</p>
              <Link href="/meals" className="inline-flex items-center gap-2 bg-emerald-500 text-white font-black px-5 py-3 rounded-2xl text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-900/40">
                {isRTL ? 'اكتشف الباقات' : 'See Plans'} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
