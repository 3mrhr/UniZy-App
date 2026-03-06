'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Smartphone, RefreshCw } from 'lucide-react';
import { verifyOTP, requestOTP } from '@/app/actions/verification';
import { toast } from 'react-hot-toast';

export default function OTPPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex items-center justify-center p-6"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <OTPForm />
        </Suspense>
    );
}

function OTPForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phone = searchParams.get('phone') || '';
    const email = searchParams.get('email') || '';
    const identifier = email || phone;
    const type = email ? 'email' : 'phone';

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
        const code = otp.join('');

        const res = await verifyOTP(identifier, code);

        if (res?.success) {
            toast.success(`${type === 'email' ? 'Email' : 'Phone'} verified successfully!`);
            router.push('/register/verify-id');
        } else {
            toast.error(res?.error || "Invalid OTP code.");
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        const res = await requestOTP(identifier);
        setIsLoading(false);
        if (res?.success) {
            toast.success("OTP sent again!");
            setTimer(59);
        } else {
            toast.error("Failed to resend OTP.");
        }
    };

    const handleSkip = () => {
        toast.success("Verification skipped. You can verify later.");
        router.push('/register/verify-id');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="max-w-md w-full relative z-10 text-center">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">
                    Verify {type === 'email' ? 'Email' : 'Phone'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                    We sent a 6-digit code to {identifier}. Please enter it below to continue.
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
                                <button type="button" onClick={handleResend} className="text-brand-600 hover:underline flex items-center gap-1 mx-auto">
                                    <RefreshCw size={14} /> Resend OTP
                                </button>
                            )}
                        </p>
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="text-xs font-black text-gray-400 hover:text-brand-600 uppercase tracking-widest transition-colors"
                        >
                            Skip for now (Optional)
                        </button>
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
