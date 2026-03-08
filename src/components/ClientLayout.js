'use client';

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import MobileHeader from "@/components/MobileHeader";
import ThemeLangControls from "@/components/ThemeLangControls";
import Image from "next/image";
import Link from "next/link";

export default function ClientLayout({ children }) {
    const pathname = usePathname();

    const isPublicPage = pathname === '/';
    const isLoginPage = pathname === '/login';
    const isAuthPage = isLoginPage || pathname === '/signup' || pathname.startsWith('/auth');

    // Specific portals manage their own headers
    const isSpecialPortal = pathname.startsWith('/admin') ||
        pathname.startsWith('/driver') ||
        pathname.startsWith('/provider') ||
        pathname.startsWith('/merchant') ||
        pathname.startsWith('/owner');

    // Show bottom nav for student-facing pages
    const showBottomNav = !isPublicPage && !isAuthPage && !isSpecialPortal && !pathname.startsWith('/legal');

    // Header should show on student pages and public pages
    const showHeader = !isAuthPage && !isSpecialPortal;

    return (
        <>
            {/* Desktop Header - Only for Public and Student Pages */}
            {showHeader && (
                <header className="hidden sm:flex bg-white/80 dark:bg-unizy-navy/80 backdrop-blur-md border-b border-gray-100 dark:border-unizy-dark sticky top-0 z-50 px-8 py-3 items-center justify-between shadow-sm">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
                            <Image src="/images/unizy-logo-icon.png" alt="UniZy Logo" width={32} height={32} className="object-contain" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-brand-600 dark:text-white italic">UniZy</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        <nav className="flex items-center gap-1">
                            <Link href="/students" className="px-4 py-2 text-sm font-bold rounded-xl text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Home</Link>
                            <Link href="/housing" className="px-4 py-2 text-sm font-bold rounded-xl text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Housing</Link>
                            <Link href="/transport" className="px-4 py-2 text-sm font-bold rounded-xl text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Transport</Link>
                            <Link href="/services" className="px-4 py-2 text-sm font-bold rounded-xl text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Services</Link>
                        </nav>
                        <div className="h-6 w-[1px] bg-gray-200 dark:bg-white/10"></div>
                        <ThemeLangControls />
                    </div>
                </header>
            )}

            {/* Mobile Header - Only for authenticated students on mobile */}
            <MobileHeader />

            <main className={`flex-1 ${showBottomNav ? 'pb-20 sm:pb-0' : ''}`}>
                {children}
            </main>

            {/* Bottom Mobile Nav - Visibility logic handled within component */}
            {showBottomNav && <Navigation />}
        </>
    );
}
