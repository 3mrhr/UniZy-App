'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { STUDENT_TABS } from '@/config/navigation';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
    const pathname = usePathname();
    const { dict } = useLanguage();
    const t = dict?.nav || {};

    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-close nav when route changes
    useEffect(() => {
        setIsExpanded(false);
    }, [pathname]);

    // TODO: wire from orders state
    const pendingCount = 0; // Set to actual count when global state is implemented

    return (
        <nav className="fixed bottom-4 left-4 sm:hidden z-50 flex items-center">
            {/* Floating Action Button (Toggle) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? "Close navigation" : "Open navigation"}
                className={`relative flex items-center justify-center w-14 h-14 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-500/30 transition-transform duration-500 hover:scale-105 active:scale-95 z-20 shrink-0 ${
                    isExpanded ? 'rotate-90 bg-gray-900 dark:bg-white dark:text-gray-900 shadow-xl' : 'rotate-0'
                }`}
            >
                <Menu
                    className={`absolute transition-all duration-500 ${isExpanded ? 'scale-0 opacity-0 -rotate-90' : 'scale-100 opacity-100 rotate-0'}`}
                    size={24}
                />
                <X
                    className={`absolute transition-all duration-500 ${isExpanded ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-90'}`}
                    size={24}
                />

                {/* Notification dot on the toggle button if nav is closed and there are unread items */}
                {!isExpanded && pendingCount > 0 && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-brand-600 rounded-full"></span>
                )}
            </button>

            {/* Nav Container - Expands/Collapses horizontally to the right */}
            <div
                className={`flex items-center bg-white/90 dark:bg-unizy-dark/90 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-left z-10 ${
                    isExpanded
                        ? 'w-[320px] rounded-3xl opacity-100 ml-2 p-2 border border-gray-100 dark:border-white/5 scale-100'
                        : 'w-0 rounded-full opacity-0 ml-0 p-0 pointer-events-none border-none scale-95'
                }`}
            >
                <div className="flex justify-around items-center w-full min-w-[304px]">
                    {STUDENT_TABS.map((tab) => {
                        const isActive = pathname === tab.href || (pathname.startsWith(tab.href) && tab.href !== '/');
                        const label = t[tab.labelKey] || tab.fallbackLabel;

                        return (
                            <Link
                                key={tab.key}
                                href={tab.href}
                                aria-current={isActive ? 'page' : undefined}
                                className={`relative flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-2xl transition-all duration-300 ${
                                    isActive
                                    ? 'text-brand-600 dark:text-white bg-brand-50/50 dark:bg-white/10 scale-105'
                                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                                    } ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                                style={{
                                    transitionDelay: isExpanded ? `${STUDENT_TABS.indexOf(tab) * 50}ms` : '0ms'
                                }}
                            >
                                <div className="relative flex items-center justify-center h-6">
                                    <span className="text-xl leading-none" aria-hidden="true">{tab.icon}</span>

                                    {/* Optional Badge Scaffold */}
                                    {tab.showBadge && pendingCount > 0 && (
                                        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-unizy-dark shadow-sm">
                                            {pendingCount > 99 ? '99+' : pendingCount}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold tracking-tight mt-0.5">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
