'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/useWalletStore';
import { ArrowLeft, History, PlusCircle, ShoppingBag, Search, Filter } from 'lucide-react';


const formatDateTime = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit' }).format(date).replace(',', ' •');
};

export default function HistoryPage() {
    const router = useRouter();
    const { wallet, loading, fetchWallet, initialized } = useWalletStore();

    useEffect(() => {
        if (!initialized) {
            fetchWallet();
        }
    }, [initialized, fetchWallet]);

    const transactions = wallet?.walletTransactions || [];

    if (loading && !initialized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                    >
                        <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white leading-none">History</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Universal Log</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                        <Search size={18} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4">
                {transactions.length === 0 ? (
                    <div className="p-12 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-[3rem] text-center">
                        <History size={48} className="mx-auto text-gray-200 dark:text-white/10 mb-4" />
                        <p className="text-gray-400 font-bold">No activity recorded yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {transactions.map((txn, index) => (
                            <div
                                key={txn.id}
                                className="flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-white/5 border border-gray-50 dark:border-white/5 hover:border-brand-200 dark:hover:border-brand-900/30 transition-all animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className={`w-14 h-14 ${txn.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-brand-500/10 text-brand-500'} rounded-2xl flex items-center justify-center shrink-0 shadow-inner`}>
                                    {txn.amount > 0 ? <PlusCircle size={24} /> : <ShoppingBag size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="font-black text-gray-900 dark:text-white truncate">
                                            {txn.description || 'App Transaction'}
                                        </p>
                                        <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full font-black text-gray-400 uppercase">
                                            {txn.status || 'COMPLETED'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                        {formatDateTime(txn.createdAt)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-black ${txn.amount > 0 ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                                        {txn.amount > 0 ? '+' : ''}{txn.amount.toFixed(2)}
                                    </p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                        {wallet?.currency || 'EGP'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
