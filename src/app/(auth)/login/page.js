'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ThemeLangControls from '@/components/ThemeLangControls';
import { loginUser } from '@/app/actions/auth';
import { getOAuthUrl } from '@/app/actions/oauth';
import { useLanguage } from '@/i18n/LanguageProvider';
import { toast } from 'react-hot-toast';

export default function Login() {
    const router = useRouter();
    const { dict, locale } = useLanguage();
    const a = dict?.auth || {};
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await loginUser(username, password);
            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            // Role-based redirection logic
            const role = result.role || 'STUDENT';
            const redirectMap = {
                'ADMIN_SUPER': '/admin',
                'SUPERADMIN': '/admin',
                'ADMIN_DELIVERY': '/admin/delivery',
                'ADMIN_TRANSPORT': '/admin/transport',
                'ADMIN_HOUSING': '/admin/housing',
                'ADMIN_COMMERCE': '/admin/commerce',
                'DRIVER': '/driver',
                'PROVIDER': '/provider',
                'MERCHANT': '/merchant',
                'STUDENT': '/students',
            };
            router.push(redirectMap[role] || (role.includes('ADMIN') ? '/admin' : '/students'));
        } catch (err) {
            setError('An error occurred during login');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">

            {/* Top Bar for Language/Theme */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeLangControls />
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200 dark:bg-brand-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-cyan-200 dark:bg-cyan-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10 translate-y-[-20px] animate-fade-in-down">
                    <div className="w-20 h-20 bg-gradient-to-tr from-brand-600 to-cyan-400 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-brand-500/40 mb-8 transform hover:scale-110 transition-transform cursor-pointer">
                        <Image src="/images/unizy-logo-icon.png" alt="UniZy" width={48} height={48} className="object-contain" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">UniZy</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-3 text-sm uppercase tracking-widest italic">{dict?.landing?.heroSub ? dict.common.appName : 'Campus Life, Simplified'}</p>
                </div>

                <form onSubmit={handleLogin} className="bg-white/70 dark:bg-unizy-dark/70 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl border border-white/50 dark:border-white/5 animate-fade-in-up">

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">{a.email || 'Email'}</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">{a.password || 'Password'}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between mb-10 px-1">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-5 h-5 rounded-lg border-gray-200 dark:border-gray-700 text-brand-600 focus:ring-brand-500 bg-white dark:bg-unizy-navy" />
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-brand-600 transition-colors">{a.rememberMe || 'Remember me'}</span>
                        </label>
                        <Link href="/forgot-password" className="text-sm font-black text-brand-600 hover:text-brand-700 tracking-tighter">{a.forgotPassword || 'Forgot Password?'}</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>{a.login || 'Sign In'} <span className="text-lg">{locale === 'ar' ? '←' : '→'}</span></>
                        )}
                    </button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-gray-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#fbfcff] dark:bg-[#0a0c10] px-2 text-gray-400 font-black tracking-widest">{a.orContinueWith || 'Or Continue With'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={async () => {
                                const res = await getOAuthUrl('google');
                                if (res.url) window.location.href = res.url;
                                else toast.error('OAuth initiation failed');
                            }}
                            className="flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-unizy-navy border border-gray-200 dark:border-white/5 rounded-2xl hover:bg-gray-50 dark:hover:bg-unizy-navy/80 transition-all active:scale-95 shadow-sm group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M24 12.48c0-.86-.07-1.74-.22-2.31H12v4.38h6.76c-.29 1.58-1.2 2.91-2.54 3.79v3.15h4.1A12 12 0 0 0 24 12.48z" />
                                <path fill="#4285F4" d="M12 24c3.24 0 5.97-1.07 7.97-2.91l-4.1-3.15c-1.12.76-2.56 1.25-3.87 1.25-2.97 0-5.5-2-6.42-4.66H1.42v3.6A12 12 0 0 0 12 24z" />
                                <path fill="#FBBC05" d="M5.58 14.53c-.23-.69-.36-1.42-.36-2.18s.13-1.5.36-2.19V6.57H1.42A12 12 0 0 0 0 12c0 1.95.46 3.8 1.42 5.43l4.16-3.32z" />
                                <path fill="#34A853" d="M12 4.4c1.76 0 3.36.6 4.6 1.77l3.43-3.41A12 12 0 0 0 1.42 6.57l4.16 3.32c.92-2.66 3.45-4.66 6.42-4.66z" />
                            </svg>
                            <span className="text-xs font-black text-gray-700 dark:text-gray-300">Google</span>
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                const res = await getOAuthUrl('apple');
                                if (res.url) window.location.href = res.url;
                                else toast.error('OAuth initiation failed');
                            }}
                            className="flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-unizy-navy border border-gray-200 dark:border-white/5 rounded-2xl hover:bg-gray-50 dark:hover:bg-unizy-navy/80 transition-all active:scale-95 shadow-sm group"
                        >
                            <svg className="w-5 h-5 dark:fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.96.95-2.21 1.72-3.71 1.72-1.42 0-2.33-.87-3.79-.87-1.44 0-2.54.87-3.81.87-1.39 0-2.82-.91-3.83-1.92C.1 18.27-.47 15.39.42 12.3c.63-2.2 2.4-3.52 4.25-3.52 1.42 0 2.4.91 3.73.91s2.21-.91 3.71-.91c1.55 0 2.91.89 3.66 1.91-3.15 1.55-2.6 5.86.58 7.15-.65 1.54-1.34 2.4-2.3 3.35zM12.03 8.24c-.02-2.06 1.47-3.82 3.33-3.9 0.17 2.19-1.9 4.09-3.33 3.9z" />
                            </svg>
                            <span className="text-xs font-black text-gray-700 dark:text-gray-300">Apple</span>
                        </button>
                    </div>

                    <p className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 mt-10">
                        {a.dontHaveAccount || 'New on campus?'} <Link href="/register" className="text-brand-600 font-extrabold hover:underline">{a.signup || 'Join UniZy'}</Link>
                    </p>

                </form>

                {/* Quick Portal Links */}
                <div className="mt-8 text-center animate-fade-in delay-500">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-1">
                        Portal Access:
                    </p>
                    <div className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-wider">
                        <Link href="/driver" className="text-brand-600 hover:underline">{a.driver || 'Driver'}</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/provider" className="text-brand-600 hover:underline">{a.housingProvider || 'Landlord'}</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/merchant" className="text-brand-600 hover:underline">{a.merchant || 'Merchant'}</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
