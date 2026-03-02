'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ThemeLangControls from '@/components/ThemeLangControls';
import { loginUser } from '@/app/actions/auth';

export default function Login() {
    const router = useRouter();
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
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-3 text-sm uppercase tracking-widest italic">Campus Life, Simplified</p>
                </div>

                <form onSubmit={handleLogin} className="bg-white/70 dark:bg-unizy-dark/70 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl border border-white/50 dark:border-white/5 animate-fade-in-up">

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="e.g. driver, landlord, merchant"
                            required
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">Password</label>
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
                            <span className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover:text-brand-600 transition-colors">Remember me</span>
                        </label>
                        <Link href="/forgot-password" className="text-sm font-black text-brand-600 hover:text-brand-700 uppercase tracking-tighter">Forgot?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-3 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>Sign In <span className="text-lg">→</span></>
                        )}
                    </button>

                    <p className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 mt-10">
                        New on campus? <Link href="/register" className="text-brand-600 font-extrabold hover:underline">Join UniZy</Link>
                    </p>

                </form>

                {/* Quick Portal Links */}
                <div className="mt-8 text-center animate-fade-in delay-500">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em] mb-1">
                        Portal Access:
                    </p>
                    <div className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-wider">
                        <Link href="/driver" className="text-brand-600 hover:underline">Driver</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/provider" className="text-brand-600 hover:underline">Landlord</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="/merchant" className="text-brand-600 hover:underline">Merchant</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
