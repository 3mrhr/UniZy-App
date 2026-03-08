"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { getUnreadNotificationCount } from "@/app/actions/notifications";

export default function MobileHeader() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Hide if it's the desktop view (handled by CSS classes `sm:hidden`), 
    // or if it's an auth page / public promo page
    const isPublicPage = pathname === "/";
    const isAuthPage = pathname === "/login" || pathname === "/signup" || pathname.startsWith("/auth");
    const isSpecialPortal = pathname.startsWith("/admin") ||
        pathname.startsWith("/driver") ||
        pathname.startsWith("/provider") ||
        pathname.startsWith("/merchant");

    // Also hide on the search page itself if it has its own search bar
    const isSearchPage = pathname === "/search";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        const fetchNotifications = async () => {
            try {
                const res = await getUnreadNotificationCount();
                if (res.success) setUnreadCount(res.unreadCount);
            } catch (err) {
                console.error("Failed to fetch notification count", err);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // 1 minute

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearInterval(interval);
        };
    }, []);

    if (isAuthPage || isSpecialPortal) return null;

    return (
        <header className={`sm:hidden sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/90 dark:bg-unizy-navy/90 backdrop-blur-md shadow-sm border-b border-slate-100 dark:border-slate-800" : "bg-white dark:bg-unizy-navy"
            }`}>
            <div className="px-4 py-3 flex flex-col gap-3">
                {/* Top Row: Logo & Notifications */}
                <div className="flex items-center justify-between">
                    <Link href="/students" className="flex items-center gap-2">
                        <div className="relative w-7 h-7">
                            <Image src="/images/unizy-logo-icon.png" alt="UniZy Logo" fill className="object-contain" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-brand-600 dark:text-white italic">UniZy</span>
                    </Link>

                    <Link href="/notifications" className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-unizy-navy px-1">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Bottom Row: Global Mobile Search Bar */}
                <Link href="/search" className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 rounded-2xl px-4 py-2.5 transition-colors">
                    <Search size={18} className="text-slate-400 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-tight truncate w-full">
                        Search housing, rides, food...
                    </span>
                </Link>
            </div>
        </header>
    );
}
