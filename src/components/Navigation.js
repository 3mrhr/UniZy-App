'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { STUDENT_TABS } from '@/config/navigation';
import { Menu, X } from 'lucide-react';
import { useOrdersStore } from '@/store/ordersStore';
import { getStudentOrders } from '@/app/actions/orders';

export default function Navigation() {
    const pathname = usePathname();
    const { dict } = useLanguage();
    const t = dict?.nav || {};

    const [isExpanded, setIsExpanded] = useState(false);

    // Auto-close nav when route changes
    useEffect(() => {
        setIsExpanded(false);
    }, [pathname]);

    const { pendingCount, setPendingCount } = useOrdersStore();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const orders = await getStudentOrders();
                if (orders && Array.isArray(orders)) {
                    // Count orders that are active/pending
                    const activeCount = orders.filter(o =>
                        ['PENDING', 'ACCEPTED', 'READY', 'PICKED_UP'].includes(o.status)
                    ).length;
                    setPendingCount(activeCount);
                }
            } catch (e) {
                console.error("Failed to fetch active orders count", e);
            }
        };

        // Fetch on mount and when pathname changes
        fetchOrders();
    }, [pathname, setPendingCount]);

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

                                {/* Optional Badge Scaffold */}
                                {tab.showBadge && pendingCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-unizy-navy shadow-sm">
                                        {pendingCount > 99 ? '99+' : pendingCount}
                                    </span>
                                )}
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
