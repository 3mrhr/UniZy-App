'use client';

import { createContext, useContext, useState, useEffect } from 'react';

import { en } from './en';
import { ar } from './ar';

const LanguageContext = createContext();

const DICTIONARIES = { en, ar };

export const useLanguage = () => useContext(LanguageContext);

export default function LanguageProvider({ children }) {
    const [locale, setLocale] = useState('en');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedLocale = localStorage.getItem('unizy-locale') || 'en';
        setLocale(savedLocale);
        document.documentElement.dir = savedLocale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = savedLocale;
        setMounted(true);
    }, []);

    const toggleLanguage = () => {
        const newLocale = locale === 'en' ? 'ar' : 'en';
        setLocale(newLocale);
        localStorage.setItem('unizy-locale', newLocale);
        document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLocale;
    };

    const value = {
        locale,
        direction: locale === 'ar' ? 'rtl' : 'ltr',
        toggleLanguage,
        dict: DICTIONARIES[locale]
    };

    return (
        <LanguageContext.Provider value={value}>
            <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
                {children}
            </div>
        </LanguageContext.Provider>
    );
}
