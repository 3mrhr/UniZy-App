'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Home, Truck, ShoppingBag, Tag, UtensilsCrossed, Users, Search, Gift, Bell, MapPin, ArrowRight, Star, MessageCircle, Package, Calendar, Wrench, Sparkles } from 'lucide-react';

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
  const { language } = useLanguage();
  const isRTL = language === 'ar-EG';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-24 transition-colors">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 px-6 pt-10 pb-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-brand-200 text-sm font-bold">{isRTL ? 'مرحباً 👋' : 'Welcome back 👋'}</p>
              <h1 className="text-3xl font-black text-white tracking-tight">Omar</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/notifications" className="w-11 h-11 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all relative">
                <Bell size={20} className="text-white" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-brand-700 flex items-center justify-center text-[8px] font-black text-white">3</span>
              </Link>
              <Link href="/account" className="w-11 h-11 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center overflow-hidden hover:bg-white/20 transition-all">
                <img src="https://ui-avatars.com/api/?name=Omar+Hassan&background=random&color=fff&size=44" alt="Avatar" className="w-full h-full object-cover" />
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <Link href="/search" className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/15 transition-all group">
            <Search size={18} className="text-white/60" />
            <span className="text-white/60 font-bold text-sm">{isRTL ? 'ابحث عن سكن، طعام، عروض...' : 'Search housing, food, deals...'}</span>
            <ArrowRight size={16} className="text-white/40 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-8 relative z-20">
        {/* Rewards Card */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-5 shadow-xl shadow-orange-500/20 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs font-bold uppercase tracking-widest">{isRTL ? 'نقاطك' : 'Your Rewards'}</p>
              <p className="text-3xl font-black text-white mt-1">1,250 <span className="text-lg font-bold text-orange-200">pts</span></p>
            </div>
            <Link href="/rewards" className="bg-white/20 backdrop-blur-xl text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/30 transition-all text-sm flex items-center gap-2">
              <Star size={14} /> {isRTL ? 'استبدل' : 'Redeem'}
            </Link>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">{isRTL ? 'الخدمات' : 'Services'}</h2>
          <div className="grid grid-cols-3 gap-3">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.id}
                  href={service.href}
                  className="bg-white dark:bg-unizy-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 hover:shadow-lg hover:scale-[1.02] transition-all text-center group"
                >
                  <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <p className="text-sm font-black text-gray-900 dark:text-white">{isRTL ? service.arLabel : service.label}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</h2>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} href={action.href} className="bg-white dark:bg-unizy-dark rounded-2xl p-3 border border-gray-100 dark:border-white/5 hover:shadow-md transition-all text-center">
                  <div className={`w-10 h-10 mx-auto rounded-xl ${action.color} flex items-center justify-center mb-2`}>
                    <Icon size={18} />
                  </div>
                  <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400">{action.label}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Active Activity */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">{isRTL ? 'النشاط الحالي' : 'Active Now'}</h2>
            <Link href="/activity" className="text-brand-600 font-bold text-sm hover:underline">{isRTL ? 'عرض الكل' : 'View All'}</Link>
          </div>
          <Link href="/activity/tracking" className="block bg-white dark:bg-unizy-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center shrink-0">
                <Truck size={22} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900 dark:text-white text-sm">{isRTL ? 'رحلة إلى الحرم' : 'Ride to Campus'}</p>
                <p className="text-xs text-gray-500 font-medium">{isRTL ? 'السائق يصل في 3 دقائق' : 'Driver arriving in 3 mins'}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shrink-0"></div>
            </div>
          </Link>
        </div>

        {/* Current Offers */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">{isRTL ? 'عروض خاصة' : 'Current Offers'}</h2>
            <Link href="/deals" className="text-brand-600 font-bold text-sm hover:underline">{isRTL ? 'عرض الكل' : 'See Deals'}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-4 text-white">
              <p className="font-black text-sm mb-1">50% off first Ride</p>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-lg">RIDE50</span>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 text-white">
              <p className="font-black text-sm mb-1">Free Delivery</p>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-lg">FREEDEL</span>
            </div>
          </div>
        </div>

        {/* Home Services Promo */}
        <div className="mb-8">
          <Link href="/services" className="block bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-5 text-white hover:shadow-xl hover:shadow-pink-500/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
                <Wrench size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg">{isRTL ? 'خدمات منزلية' : 'Home Services'}</h3>
                <p className="text-pink-100 text-xs font-bold">{isRTL ? 'سباك, كهربائي, نجار والمزيد' : 'Plumber, electrician, carpenter & more'}</p>
              </div>
              <ArrowRight size={20} className="text-white/60" />
            </div>
          </Link>
        </div>

        {/* Hub Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">{isRTL ? 'مجتمع الطلاب' : 'Student Hub'}</h2>
            <Link href="/hub" className="text-brand-600 font-bold text-sm hover:underline">{isRTL ? 'فتح' : 'Open Hub'}</Link>
          </div>
          <div className="bg-white dark:bg-unizy-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <img src="https://ui-avatars.com/api/?name=Sarah+M&background=0D8ABC&color=fff&size=36" alt="Sarah" className="w-9 h-9 rounded-full" />
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">Sarah M.</p>
                <p className="text-[10px] text-gray-400">Study Help · 2h ago</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{isRTL ? 'حد معاه امتحانات البيوفيزياء؟ 🙏' : 'Anyone have past exams for BioPhysics 101? 🙏'}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-bold">
              <span className="flex items-center gap-1"><Star size={12} /> 12</span>
              <span className="flex items-center gap-1"><MessageCircle size={12} /> 5</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
