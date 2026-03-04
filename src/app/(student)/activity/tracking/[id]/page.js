'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, Navigation, XCircle, Star } from 'lucide-react';
import SOSButton from '@/components/SOSButton';

export default function LiveTrackingPage({ params }) {
    const router = useRouter();
    const orderId = params.id;

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Rating states
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    useEffect(() => {
        let interval;
        const fetchStatus = async () => {
            const { pollOrderStatus } = await import('@/app/actions/orders');
            const res = await pollOrderStatus(orderId);
            if (res.success) {
                setOrder(res.order);
            }
            setIsLoading(false);
        };

        fetchStatus();
        interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [orderId]);

    const handleCancel = async () => {
        setIsCancelling(true);
        const { cancelOrder } = await import('@/app/actions/orders');
        const res = await cancelOrder(orderId);
        setIsCancelling(false);
        if (res.success) {
            alert('Order cancelled successfully.');
            router.push('/activity');
        } else {
            alert(res.error || 'Failed to cancel.');
            setShowCancelModal(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!rating) return alert('Please provide a rating.');
        setIsSubmittingReview(true);
        const { createReview } = await import('@/app/actions/reviews');

        await createReview({
            rating,
            comment: review,
            orderId: order.id,
            targetUserId: order.driverId // Assuming the review is for the driver
        });

        setIsSubmittingReview(false);
        setReviewSubmitted(true);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-unizy-navy font-bold">Connecting...</div>;
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-unizy-navy">
                <span className="text-4xl mb-4">🔍</span>
                <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
                <button onClick={() => router.push('/activity')} className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold mt-4">Go to Activity</button>
            </div>
        );
    }

    let details = {};
    try { details = JSON.parse(order.details || '{}'); } catch (e) { }

    const isPending = order.status === 'PENDING';
    const isCompleted = order.status === 'COMPLETED';
    const isCancelled = order.status === 'CANCELLED';

    // Status Map properties
    const statusMap = {
        'PENDING': { color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'Finding Driver' },
        'ACCEPTED': { color: 'text-brand-500', bg: 'bg-brand-100 dark:bg-brand-500/20', text: 'Driver on the way' },
        'IN_TRANSIT': { color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'In Transit' },
        'COMPLETED': { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-500/20', text: 'Completed' },
        'CANCELLED': { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-500/20', text: 'Cancelled' }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex items-center justify-center p-4">

            {/* Display Panel: Status & Info */}
            <div className="w-full max-w-lg bg-white dark:bg-unizy-dark shadow-2xl rounded-[3rem] overflow-hidden z-10 p-6 flex flex-col relative">
                <header className="flex items-center justify-between mb-8">
                    <Link href="/activity" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                        ← Back
                    </Link>
                    <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${statusMap[order.status]?.bg || 'bg-gray-100'} ${statusMap[order.status]?.color || 'text-gray-500'}`}>
                        {statusMap[order.status]?.text || order.status}
                    </div>
                </header>

                <div className="flex-1 space-y-6">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                        {order.service === 'TRANSPORT' ? details.vehicle || 'Ride' : 'Delivery'}
                    </h1>

                    {/* Route Info */}
                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-3xl space-y-4">
                        <div className="flex items-start gap-4">
                            <Navigation size={18} className="text-brand-500 mt-1" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-black">Pickup</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{details.pickup || details.vendor || 'Unknown'}</p>
                            </div>
                        </div>
                        <div className="pl-[8px] border-l-2 border-dashed border-gray-200 dark:border-white/10 ml-[8px]"></div>
                        <div className="flex items-start gap-4">
                            <Navigation size={18} className="text-green-500 mt-1" />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-black">Destination</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{details.destination || 'Delivery Address'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Driver Card */}
                    {order.driver ? (
                        <div className="bg-brand-50 dark:bg-brand-900/10 p-4 rounded-3xl border border-brand-100 dark:border-brand-500/20">
                            <h3 className="text-xs font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">Your Driver</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white dark:bg-unizy-dark rounded-full shadow-sm flex items-center justify-center font-bold text-gray-700 dark:text-gray-200">
                                        {order.driver.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{order.driver.name}</p>
                                        <p className="text-xs text-gray-500">UniZy Verified ✓</p>
                                    </div>
                                </div>
                                <a href={`tel:${order.driver.phone}`} className="w-10 h-10 bg-white dark:bg-unizy-dark rounded-full shadow-sm flex items-center justify-center text-green-500 hover:scale-110 active:scale-95 transition-transform">
                                    <Phone size={18} />
                                </a>
                            </div>
                        </div>
                    ) : (
                        !isCompleted && !isCancelled && (
                            <div className="text-center p-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl">
                                <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-brand-500 animate-spin mx-auto mb-3"></div>
                                <p className="text-sm font-bold text-gray-500">Locating your driver...</p>
                            </div>
                        )
                    )}

                    {/* Completion / Rating */}
                    {isCompleted && !reviewSubmitted && (
                        <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10 text-center animate-fade-in-up">
                            <h3 className="font-black text-lg mb-2">Rate your trip</h3>
                            <div className="flex justify-center gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                    >
                                        <Star size={28} fill={rating >= star ? 'currentColor' : 'none'} />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-unizy-navy/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none mb-4"
                                placeholder="Any feedback for the driver?"
                                rows="2"
                            />
                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview || !rating}
                                className={`w-full bg-brand-600 text-white font-bold py-3 rounded-xl transition-all ${!rating ? 'opacity-50' : 'hover:scale-[1.02] shadow-lg shadow-brand-500/30'}`}
                            >
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    )}
                    {reviewSubmitted && (
                        <div className="bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 p-4 rounded-3xl text-center font-bold text-sm">
                            Thank you for your feedback!
                        </div>
                    )}

                </div>

                {/* Bottom Actions */}
                {(!isCompleted && !isCancelled) && (
                    <div className="mt-8">
                        <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={!isPending && order.status !== 'ACCEPTED'}
                            className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            <XCircle size={16} /> Cancel Order
                        </button>
                    </div>
                )}
            </div>

            {/* Float the SOSButton over the page, linking it to the Transport order */}
            {order.service === 'TRANSPORT' && (
                <SOSButton transportOrderId={order.id} contextData={{
                    location: 'Active Transport Ride',
                    pickup: details.pickup || details.vendor,
                    destination: details.destination,
                    driverId: order.driverId
                }} />
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2rem] w-full max-w-sm shadow-2xl animate-fade-in-up">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Cancel Order?</h3>
                        <p className="text-sm text-gray-500 mb-6">Are you sure you want to cancel? This action cannot be reversed.</p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10"
                            >
                                Nevermind
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
