'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/useWalletStore';
import { Wallet, ArrowUpRight, History, CreditCard, PlusCircle, AlertCircle, ShoppingBag, X, CheckCircle2 } from 'lucide-react';


const formatDateTime = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit' }).format(date);
};

export default function WalletPage() {
    const { wallet, loading, error, fetchWallet, initialized } = useWalletStore();

    const [showTopUp, setShowTopUp] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!initialized) {
            fetchWallet();
        }
    }, [initialized, fetchWallet]);

    const handleWithdraw = () => {
        router.push('/wallet/withdraw');
    };

    const handleViewAll = () => {
        router.push('/wallet/history');
    };

    if (loading && !initialized) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-bold animate-pulse">Accessing Secure Vault...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
                <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <AlertCircle className="text-red-500" size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Wallet Connection Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">{error}</p>
                </div>
                <button
                    onClick={fetchWallet}
                    className="mt-2 bg-brand-600 hover:bg-brand-700 text-white font-black px-6 py-3 rounded-2xl transition-all active:scale-95"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const transactions = wallet?.walletTransactions || [];

    // Top-Up Multi-step State
    const [topUpStep, setTopUpStep] = useState(1); // 1: Select, 2: Details, 3: Success
    const [topUpMethod, setTopUpMethod] = useState(null);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [senderName, setSenderName] = useState('');
    const [senderPhone, setSenderPhone] = useState('');
    const [proofImage, setProofImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [topUpStatus, setTopUpStatus] = useState(null); // 'success' or 'error'

    const resetTopUp = () => {
        setTopUpStep(1);
        setTopUpMethod(null);
        setTopUpAmount('');
        setSenderName('');
        setSenderPhone('');
        setProofImage(null);
        setTopUpStatus(null);
        setShowTopUp(false);
    };

    const handleMethodSelect = (method) => {
        setTopUpMethod(method);
        setTopUpStep(2);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitTopUp = async () => {
        if (!topUpAmount || !senderName || !senderPhone || !proofImage) {
            alert('Please fill all fields and attach proof of payment.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { createTopUpRequest } = await import('@/app/actions/wallet-requests');
            const formData = new FormData();
            formData.append('amount', topUpAmount);
            formData.append('method', topUpMethod);
            formData.append('senderName', senderName);
            formData.append('senderPhone', senderPhone);
            formData.append('proofImage', proofImage);

            const res = await createTopUpRequest(formData);
            if (res.success) {
                setTopUpStep(3);
                setTopUpStatus('success');
            } else {
                alert(res.error || 'Failed to submit request.');
            }
        } catch (err) {
            console.error(err);
            alert('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in pb-24">
            {/* ... previous content until Transactions ... */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white">Wallet</h1>
                    <p className="text-gray-500 font-bold text-sm tracking-tight capitalize">Your Digital Campus Credit</p>
                </div>
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <Wallet className="text-brand-500" size={24} />
                </div>
            </div>

            <div className="relative overflow-hidden aspect-[1.586/1] w-full rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl group transition-all duration-700 animate-slide-up">
                <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/30 rounded-full blur-[90px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/30 rounded-full blur-[90px] translate-y-1/2 -translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>

                <div className="relative flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <p className="text-white/60 font-black text-[10px] uppercase tracking-[0.3em] drop-shadow-sm">Campus Wallet</p>
                        <h2 className="text-4xl sm:text-6xl font-black text-white flex items-baseline gap-2 drop-shadow-md">
                            {wallet?.balance?.toFixed(2) || '0.00'}
                            <span className="text-xl opacity-60 font-bold">EGP</span>
                        </h2>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <PlusCircle className="text-white animate-pulse" size={24} />
                        </div>
                    </div>
                </div>

                <div className="relative flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest leading-none">Student Identification</p>
                        <p className="text-white font-black text-sm tracking-wide flex items-center gap-2">
                            {wallet?.user?.name || 'Academic Holder'}
                            <CheckCircle2 size={14} className="text-brand-400" />
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest leading-none">Status</p>
                            <p className="text-brand-400 font-black text-xs uppercase tracking-tighter">Active</p>
                        </div>
                        <div className="relative w-12 h-8 flex items-center justify-center">
                            <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10"></div>
                            <CreditCard className="text-white/40 relative z-10" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setShowTopUp(true)}
                    className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black transition-all active:scale-95 shadow-lg shadow-brand-500/20 group"
                >
                    <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
                    Top-Up
                </button>
                <button
                    onClick={handleWithdraw}
                    className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-black transition-all hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 group"
                >
                    <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Withdraw
                </button>
            </div>

            <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <History size={18} className="text-brand-500" />
                        Transactions
                    </h3>
                    <button
                        onClick={handleViewAll}
                        className="text-xs font-black text-brand-600 dark:text-brand-400 hover:underline"
                    >
                        View All
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {transactions.length === 0 ? (
                        <div className="p-8 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2rem] text-center">
                            <p className="text-gray-400 font-bold">No history available yet.</p>
                        </div>
                    ) : (
                        transactions.map((txn) => (
                            <div
                                key={txn.id}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-50 dark:border-white/5 hover:border-brand-200 dark:hover:border-brand-900/30 transition-all cursor-default group"
                            >
                                <div className={`w-12 h-12 ${txn.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : txn.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-brand-500/10 text-brand-500'} rounded-xl flex items-center justify-center shrink-0`}>
                                    {txn.status === 'PENDING' ? <AlertCircle size={20} /> : txn.amount > 0 ? <PlusCircle size={20} /> : <ShoppingBag size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                                        {txn.description || 'App Transaction'}
                                        {txn.status === 'PENDING' && <span className="ml-2 text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">Pending</span>}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                        {formatDateTime(txn.createdAt)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-black ${txn.amount > 0 ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                                        {txn.amount > 0 ? '+' : ''}{txn.amount.toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-black tracking-tight">{wallet?.currency}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Top-Up Modal (Multi-step) */}
            {showTopUp && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-unizy-dark w-full max-w-md p-8 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl relative animate-slide-up overflow-hidden">

                        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100 dark:bg-white/5">
                            <div
                                className="h-full bg-brand-500 transition-all duration-500"
                                style={{ width: `${(topUpStep / 3) * 100}%` }}
                            ></div>
                        </div>

                        <button
                            onClick={resetTopUp}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {topUpStep === 1 && (
                            <div className="animate-fade-in">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white mb-1">Add Credit</h2>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Payment Method</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={() => handleMethodSelect('InstaPay')}
                                        className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-brand-500/50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                                                <PlusCircle size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white">InstaPay</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Direct Bank Transfer</p>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="text-gray-300 group-hover:text-brand-500 transition-colors" size={20} />
                                    </button>

                                    <button
                                        onClick={() => handleMethodSelect('Vodafone Cash')}
                                        className="flex items-center justify-between p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-red-500/50 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
                                                <ShoppingBag size={24} />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white">Vodafone Cash</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Wallet</p>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="text-gray-300 group-hover:text-red-500 transition-colors" size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {topUpStep === 2 && (
                            <div className="animate-slide-up">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white mb-1">Transfer Details</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Complete the transfer to the number below</p>
                                </div>

                                <div className="p-6 bg-brand-600/10 rounded-3xl border border-brand-500/20 mb-6 flex flex-col items-center gap-2">
                                    <p className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em]">{topUpMethod} Account</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white tracking-widest">01012345678</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name: UniZy Financials</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Amount to Deposit (EGP)</label>
                                        <input
                                            type="number"
                                            value={topUpAmount}
                                            onChange={(e) => setTopUpAmount(e.target.value)}
                                            placeholder="Ex: 500"
                                            className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-black placeholder:text-gray-300 text-lg focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Your Name</label>
                                            <input
                                                value={senderName}
                                                onChange={(e) => setSenderName(e.target.value)}
                                                placeholder="Full Name"
                                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-black placeholder:text-gray-300 text-sm focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Your Phone</label>
                                            <input
                                                value={senderPhone}
                                                onChange={(e) => setSenderPhone(e.target.value)}
                                                placeholder="01x xxxx xxxx"
                                                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white font-black placeholder:text-gray-300 text-sm focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Proof of Payment</label>
                                        <div className="relative h-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer overflow-hidden">
                                            {proofImage ? (
                                                <img src={proofImage} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <PlusCircle className="text-gray-300" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attach Screenshot</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmitTopUp}
                                    disabled={isSubmitting}
                                    className="w-full mt-6 p-4 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-black transition-all active:scale-95 shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>Submit for Approval</>
                                    )}
                                </button>
                                <button
                                    onClick={() => setTopUpStep(1)}
                                    className="w-full mt-2 p-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                            </div>
                        )}

                        {topUpStep === 3 && (
                            <div className="animate-fade-in flex flex-col items-center text-center py-8">
                                <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white mb-2">Request Submitted</h2>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 max-w-[240px]">
                                    Our financial team is verifying your transfer. Credits will appear in your wallet shortly.
                                </p>
                                <button
                                    onClick={resetTopUp}
                                    className="w-full p-4 rounded-2xl bg-gray-900 dark:bg-white/10 text-white font-black transition-all active:scale-95 shadow-lg"
                                >
                                    Back to Wallet
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
