'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { STUDENT_TABS } from '@/config/navigation';
// Clean UI navigation

export default function Navigation() {
    const pathname = usePathname();
    const { dict } = useLanguage();
    const t = dict?.nav || {};

    // Render logic aligned natively
    return (
        <nav className="fixed bottom-0 left-0 right-0 sm:hidden z-[9999] bg-white dark:bg-unizy-navy border-t border-gray-200 dark:border-unizy-dark pb-2">
            <div className="flex justify-around items-center h-16 px-2">
                {STUDENT_TABS.map((tab) => {
                    const isActive = pathname === tab.href || (pathname.startsWith(tab.href) && tab.href !== '/');
                    const label = t[tab.labelKey] || tab.fallbackLabel;

                    return (
                        <Link
                            key={tab.key}
                            href={tab.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${isActive
                                ? 'text-brand-600 dark:text-brand-400'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                                }`}
                        >
                            <div className="relative flex items-center justify-center">
                                <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} aria-hidden="true">
                                    {tab.icon}
                                </span>
                            </div>
                            <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${isActive ? 'scale-105' : ''}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
