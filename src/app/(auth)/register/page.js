'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ThemeLangControls from '@/components/ThemeLangControls';
import { registerUser } from '@/app/actions/auth';

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await registerUser({
                name,
                email,
                password,
                phone,
                role
            });

            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            // Route based on newly registered role
            const newRole = result.role;
            if (newRole === 'ADMIN') {
                router.push('/admin');
            } else if (newRole === 'DRIVER') {
                router.push('/driver');
            } else if (newRole === 'PROVIDER' || newRole === 'LANDLORD') {
                router.push('/provider');
            } else if (newRole === 'MERCHANT') {
                router.push('/merchant');
            } else {
                router.push('/students');
            }
        } catch (err) {
            setError('An error occurred during registration.');
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
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="max-w-md w-full relative z-10 my-8">
                <div className="text-center mb-8 animate-fade-in-down">
                    <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-cyan-400 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-brand-500/40 mb-4 transform cursor-pointer">
                        <Image src="/images/unizy-logo-icon.png" alt="UniZy" width={32} height={32} className="object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">Create Account</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 text-xs uppercase tracking-widest italic">Join the UniZy Network</p>
                </div>

                <form onSubmit={handleRegister} className="bg-white/70 dark:bg-unizy-dark/70 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl border border-white/50 dark:border-white/5 animate-fade-in-up">
                    
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="Omar Hassan"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="omar@example.com"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="01012345678"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">I am a...</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold appearance-none cursor-pointer"
                        >
                            <option value="STUDENT">Student</option>
                            <option value="PROVIDER">Housing Provider</option>
                            <option value="MERCHANT">Local Merchant</option>
                            <option value="DRIVER">Delivery / Ride Driver</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Join Now'
                        )}
                    </button>

                    <p className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 mt-8">
                        Already have an account? <Link href="/login" className="text-brand-600 font-extrabold hover:underline">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
