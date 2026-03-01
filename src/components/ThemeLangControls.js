'use client';

import { useTheme } from 'next-themes';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useState, useEffect } from 'react';

export default function ThemeLangControls() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const languageContext = useLanguage();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Placeholder during hydration to prevent 0x0 layout collapse
    if (!mounted || !languageContext) {
        return (
            <div className="flex items-center gap-2 w-[110px] h-9">
                <div className="w-16 h-full bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                <div className="w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    const { locale, toggleLanguage } = languageContext;

    return (
        <div className="flex items-center gap-2 h-9">
            {/* Language Toggle */}
            <button
                onClick={toggleLanguage}
                className="px-3 h-full rounded-lg text-sm font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all active:scale-95 flex items-center justify-center min-w-[64px]"
            >
                {locale === 'en' ? 'عربي' : 'EN'}
            </button>

            {/* Theme Toggle */}
            <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-full rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center active:scale-95"
            >
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
        </div>
    );
}
