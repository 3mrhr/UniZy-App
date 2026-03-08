'use client';

import React, { useState } from 'react';
import { QrCode, Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyRedemption } from '@/app/actions/deals';
import toast from 'react-hot-toast';

export default function RedemptionVerifier() {
    const [token, setToken] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState(null);

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!token.trim()) return;

        setIsVerifying(true);
        setResult(null);
        try {
            const res = await verifyRedemption(token.trim());
            if (res.success) {
                setResult({
                    success: true,
                    dealTitle: res.deal.title,
                    customerName: res.customer.name,
                    amount: res.amount
                });
                toast.success('Redemption Verified!');
                setToken('');
            } else {
                setResult({
                    success: false,
                    error: res.error
                });
                toast.error(res.error || 'Verification failed');
            }
        } catch (error) {
            toast.error('An error occurred during verification');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="bg-white dark:bg-unizy-dark p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 animate-fade-in delay-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                    <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Verify Student Deal</h3>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Enter redemption token..."
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-unizy-navy border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
                    />
                </div>
                <button
                    disabled={isVerifying || !token.trim()}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
                >
                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Redemption'}
                </button>
            </form>

            {result && (
                <div className={`mt-6 p-6 rounded-3xl border animate-fade-in ${result.success ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30'}`}>
                    <div className="flex items-start gap-3">
                        {result.success ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                        ) : (
                            <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                        )}
                        <div>
                            <p className={`font-black text-sm mb-1 ${result.success ? 'text-green-900 dark:text-green-400' : 'text-red-900 dark:text-red-400'}`}>
                                {result.success ? 'Redemption Success!' : 'Verification Denied'}
                            </p>
                            {result.success ? (
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-green-800/70 dark:text-green-400/70">
                                        Deal: <span className="text-green-900 dark:text-green-300">{result.dealTitle}</span>
                                    </p>
                                    <p className="text-xs font-bold text-green-800/70 dark:text-green-400/70">
                                        Student: <span className="text-green-900 dark:text-green-300">{result.customerName}</span>
                                    </p>
                                    <p className="text-xs font-bold text-green-800/70 dark:text-green-400/70">
                                        Amount to Pay: <span className="text-green-900 dark:text-green-300">EGP {result.amount}</span>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs font-bold text-red-800/70 dark:text-red-400/70">{result.error}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
