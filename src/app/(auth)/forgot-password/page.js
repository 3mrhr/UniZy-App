'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle, Key } from 'lucide-react';
import { requestPasswordReset, resetPassword } from '@/app/actions/auth';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState('email'); // email → token → done
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [devToken, setDevToken] = useState('');

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const result = await requestPasswordReset(email);
        setLoading(false);

        if (result.success) {
            setMessage(result.message);
            if (result.token) setDevToken(result.token); // Dev mode: show token
            setStep('token');
        } else {
            setError(result.error);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setError('');
        const result = await resetPassword(token, newPassword);
        setLoading(false);

        if (result.success) {
            setStep('done');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">

            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200 dark:bg-brand-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md relative z-10">
                <Link href="/login" className="text-sm text-gray-500 hover:text-brand-600 font-bold flex items-center gap-2 mb-6">
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-800/50">
                    {step === 'email' && (
                        <>
                            <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Mail size={24} className="text-brand-600" />
                            </div>
                            <h1 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
                            <p className="text-sm text-gray-500 text-center mb-8">Enter your email and we'll generate a reset token.</p>

                            <form onSubmit={handleRequestReset} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="your@email.com"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
                                <button type="submit" disabled={loading} className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black text-base hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30">
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Token'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'token' && (
                        <>
                            <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Key size={24} className="text-amber-600" />
                            </div>
                            <h1 className="text-2xl font-black text-center text-gray-900 dark:text-white mb-2">Reset Password</h1>
                            <p className="text-sm text-gray-500 text-center mb-4">{message}</p>

                            {devToken && (
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-6">
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Dev Mode — Your Token:</p>
                                    <p className="text-sm font-mono font-bold text-amber-800 dark:text-amber-300 break-all">{devToken}</p>
                                </div>
                            )}

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Reset Token</label>
                                    <input
                                        type="text"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        required
                                        placeholder="Paste your reset token"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold"
                                    />
                                </div>
                                {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
                                <button type="submit" disabled={loading} className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black text-base hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30">
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === 'done' && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Password Reset!</h1>
                            <p className="text-sm text-gray-500 mb-6">Your password has been updated successfully.</p>
                            <Link href="/login" className="inline-block px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30">
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
