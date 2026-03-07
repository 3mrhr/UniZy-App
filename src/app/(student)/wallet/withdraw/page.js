'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, Smartphone, Landmark, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

export default function WithdrawPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Method, 2: Amount, 3: Success
    const [method, setMethod] = useState('');
    const [amount, setAmount] = useState('');

    const handleMethodSelect = (m) => {
        setMethod(m);
        setStep(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep(3);
    };

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-2xl mx-auto animate-fade-in pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                    className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                >
                    <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white leading-none">Withdraw</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Stage {step} of 3</p>
                </div>
            </div>

            {/* Step 1: Select Method */}
            {step === 1 && (
                <div className="flex flex-col gap-6 animate-slide-up">
                    <div className="p-6 bg-brand-500/10 border border-brand-500/20 rounded-3xl flex items-start gap-4">
                        <AlertCircle className="text-brand-500 shrink-0" size={20} />
                        <p className="text-xs font-bold text-brand-600 dark:text-brand-400 leading-relaxed uppercase tracking-tight">
                            Note: Withdrawals are processed within 24-48 business hours to your selected method.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <button
                            onClick={() => handleMethodSelect('Vodafone Cash')}
                            className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-red-500/50 transition-all group shadow-sm hover:shadow-xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Smartphone size={28} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-gray-900 dark:text-white text-lg">Vodafone Cash</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Wallet • Instant Notification</p>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-red-500 transition-colors" size={20} />
                        </button>

                        <button
                            onClick={() => handleMethodSelect('InstaPay')}
                            className="flex items-center justify-between p-6 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-indigo-500/50 transition-all group shadow-sm hover:shadow-xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Landmark size={28} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-gray-900 dark:text-white text-lg">Bank via InstaPay</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Local Egyptian Banks</p>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-colors" size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Amount & Confirm */}
            {step === 2 && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-slide-up">
                    <div className="flex flex-col items-center gap-6 py-8">
                        <div className="w-20 h-20 bg-brand-500/10 rounded-3xl flex items-center justify-center">
                            <Wallet className="text-brand-500" size={40} />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Withdraw to {method}</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-2xl font-black text-gray-400">EGP</span>
                                <input
                                    autoFocus
                                    required
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="text-5xl font-black bg-transparent border-none outline-none text-gray-900 dark:text-white w-48 text-center placeholder:text-gray-200 dark:placeholder:text-white/5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/10 flex flex-col gap-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-gray-400">Transfer Fee</span>
                            <span className="font-black text-gray-900 dark:text-white">5.00 EGP</span>
                        </div>
                        <div className="h-px bg-gray-100 dark:bg-white/5"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-black text-gray-900 dark:text-white">Amount to Receive</span>
                            <span className="text-xl font-black text-brand-500">
                                {Math.max(0, (parseFloat(amount) || 0) - 5).toFixed(2)} EGP
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-6 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 transition-all active:scale-95"
                    >
                        Confirm Withdrawal
                    </button>
                </form>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
                <div className="flex flex-col items-center justify-center py-12 gap-8 animate-slide-up text-center">
                    <div className="relative">
                        <div className="w-32 h-32 bg-green-500/20 rounded-full blur-2xl absolute inset-0"></div>
                        <div className="w-24 h-24 bg-green-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10 animate-bounce">
                            <CheckCircle2 size={48} />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white mb-2">Request Received</h2>
                        <p className="text-sm font-bold text-gray-500 max-w-xs mx-auto">
                            Your withdrawal of <span className="text-gray-900 dark:text-white">{amount} EGP</span> to {method} is being processed.
                        </p>
                    </div>

                    <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-3xl text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Ref ID</p>
                        <p className="font-mono text-xs font-bold text-gray-900 dark:text-white">WDR-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>

                    <button
                        onClick={() => router.push('/wallet')}
                        className="w-full py-6 rounded-2xl border-2 border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-black hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95"
                    >
                        Return to Wallet
                    </button>
                </div>
            )}
        </div>
    );
}
