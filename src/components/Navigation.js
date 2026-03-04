'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { STUDENT_TABS } from '@/config/navigation';

export default function Navigation() {
    const pathname = usePathname();
    const { dict } = useLanguage();
    const t = dict?.nav || {};

    // TODO: wire from orders state
    const pendingCount = 0; // Set to actual count when global state is implemented

    return (
        <nav className="fixed bottom-0 w-full bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5 flex justify-around items-center p-3 sm:hidden z-50 transition-colors">
            {STUDENT_TABS.map((tab) => {
                const isActive = pathname === tab.href || (pathname.startsWith(tab.href) && tab.href !== '/');
                const label = t[tab.labelKey] || tab.fallbackLabel;

                return (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${isActive
                            ? 'text-brand-600 dark:text-white bg-brand-50/50 dark:bg-white/10 scale-110'
                            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                    >
                        <div className="relative">
                            <span className="text-xl" aria-hidden="true">{tab.icon}</span>

                            {/* Optional Badge Scaffold */}
                            {tab.showBadge && pendingCount > 0 && (
                                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-unizy-dark">
                                    {pendingCount > 99 ? '99+' : pendingCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold tracking-tight">{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
