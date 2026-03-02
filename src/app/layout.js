'use client';

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import MobileHeader from "@/components/MobileHeader";
import ThemeProvider from "@/components/ThemeProvider";
import LanguageProvider from "@/i18n/LanguageProvider";
import ThemeLangControls from "@/components/ThemeLangControls";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const isPublicPage = pathname === '/';
  const isLoginPage = pathname === '/login';
  const isAuthPage = isLoginPage || pathname === '/signup';

  // Specific portals manage their own headers
  const isSpecialPortal = pathname.startsWith('/admin') ||
    pathname.startsWith('/driver') ||
    pathname.startsWith('/provider') ||
    pathname.startsWith('/merchant');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-unizy-navy text-gray-900 dark:text-white transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <div className="min-h-screen flex flex-col">

              {/* Desktop Header - Only for Public and Student Pages */}
              {!isAuthPage && !isSpecialPortal && (
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

              <main className="flex-1">
                {children}
              </main>

              {/* Bottom Mobile Nav - Only for Students/Logged in area */}
              {!isPublicPage && !isAuthPage && <Navigation />}
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
