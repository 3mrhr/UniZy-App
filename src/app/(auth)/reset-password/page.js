'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { resetPassword } from '@/app/actions/auth';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle → success

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token.');
            router.push('/login');
        }
    }, [token, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);
        const result = await resetPassword(token, newPassword);
        setLoading(false);

        if (result.success) {
            setStatus('success');
            toast.success('Password reset successful!');
        } else {
            toast.error(result.error || 'Failed to reset password.');
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/10">
                    <CheckCircle size={40} className="text-green-600" />
                </div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Security Updated!</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto font-medium">Your password has been securely reset. You can now use your new credentials to log in.</p>
                <Link href="/login" className="inline-block px-10 py-4 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/30 active:scale-95">
                    Return to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md relative z-10">
            <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl border border-white/20 dark:border-gray-800/50">
                <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <ShieldCheck size={32} className="text-brand-600" />
                </div>

                <h1 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-3">Secure Reset</h1>
                <p className="text-sm text-gray-500 text-center mb-10 font-medium">Choose a strong new password for your account.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-1">New Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Confirm Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-bold transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-brand-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/30 active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : 'Update Password'}
                    </button>

                    <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors">
                        <ArrowLeft size={16} /> Back to Sign In
                    </Link>
                </form>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200 dark:bg-brand-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <Suspense fallback={<div className="font-black text-2xl animate-pulse text-gray-300">UNIZY SECURITY...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
