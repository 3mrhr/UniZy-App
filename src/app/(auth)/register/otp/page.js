'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThemeLangControls from '@/components/ThemeLangControls';
import { ShieldCheck, Smartphone, RefreshCw } from 'lucide-react';

export default function OTPPage() {
    const router = useRouter();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(59);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        // Focus next input
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock verification
        setTimeout(() => {
            router.push('/register/verify-id');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-6 right-6 z-50">
                <ThemeLangControls />
            </div>

            <div className="max-w-md w-full relative z-10 text-center">
                <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-full mx-auto flex items-center justify-center mb-6 text-brand-600 animate-bounce">
                    <Smartphone size={40} />
                </div>

                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">Verify Phone</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                    We sent a 6-digit code to your phone. Please enter it below to continue.
                </p>

                <form onSubmit={handleVerify} className="space-y-8">
                    <div className="flex justify-center gap-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onFocus={(e) => e.target.select()}
                                className="w-12 h-14 text-center text-2xl font-black bg-white dark:bg-unizy-dark border-2 border-gray-100 dark:border-white/5 rounded-2xl focus:border-brand-500 dark:focus:border-brand-500 outline-none transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || otp.join('').length < 6}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Verify Code'
                        )}
                    </button>

                    <div className="flex flex-col items-center gap-4">
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            Didn't receive code? {timer > 0 ? (
                                <span className="text-brand-500">Wait {timer}s</span>
                            ) : (
                                <button type="button" className="text-brand-600 hover:underline flex items-center gap-1 mx-auto">
                                    <RefreshCw size={14} /> Resend OTP
                                </button>
                            )}
                        </p>
                    </div>
                </form>

                <div className="mt-12 flex items-center justify-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                    <ShieldCheck size={16} className="text-green-500" />
                    Secure Student Verification
                </div>
            </div>
        </div>
    );
}
