'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Tag, Clock, ExternalLink } from 'lucide-react';
import Image from 'next/image';

function HistoryContent() {
    const router = useRouter();
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const { getRedemptionHistory } = await import('@/app/actions/deals');
                const res = await getRedemptionHistory();
                if (res.success) {
                    setHistory(res.history);
                }
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32">
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 py-4 px-6 md:px-12">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white">Redemption History</h1>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-unizy-dark rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                        <span className="text-4xl mb-4 block">🎫</span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Redemptions Yet</h3>
                        <p className="text-gray-500 mb-6">You haven't redeemed any deals yet.</p>
                        <Link href="/deals" className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-2xl transition-colors">
                            Explore Deals
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((record) => (
                            <div key={record.id} className="bg-white dark:bg-unizy-dark rounded-3xl p-5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5">
                                <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 shrink-0 relative">
                                    {record.deal?.image ? (
                                        <Image src={record.deal.image} alt={record.deal.title || 'Deal'} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{record.deal?.title || 'Unknown Deal'}</h3>
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-700 border border-green-100">Redeemed</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 line-clamp-2">{record.deal?.description}</p>
                                    </div>

                                    <div className="flex flex-wrap items-end justify-between gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Clock size={12} /> Date Redeemed</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(record.createdAt).toLocaleDateString()} at {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>

                                        {record.deal && (
                                            <Link href={`/deals/${record.deal.id}`} className="flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors">
                                                View Deal <ExternalLink size={14} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function HistoryPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div></div>}>
            <HistoryContent />
        </Suspense>
    );
}
