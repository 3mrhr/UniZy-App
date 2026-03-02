'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function Navigation() {
    const pathname = usePathname();
    const { dict } = useLanguage();
    const t = dict?.nav || {};

    const navItems = [
        { label: t.home || 'Home', href: '/students', icon: '🏠' },
        { label: t.services || 'Services', href: '/explore', icon: '⚡' },
        { label: t.hub || 'Hub', href: '/hub', icon: '👥' },
        { label: t.activity || 'Activity', href: '/activity', icon: '📋' },
        { label: t.account || 'Account', href: '/account', icon: '👤' },
    ];

    return (
        <nav className="fixed bottom-0 w-full bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5 flex justify-around items-center p-3 sm:hidden z-50 transition-colors">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${isActive
                            ? 'text-brand-600 dark:text-white bg-brand-50/50 dark:bg-white/10 scale-110'
                            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
