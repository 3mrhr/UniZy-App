'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Star, MessageSquare } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createReview } from '@/app/actions/reviews';
import toast from 'react-hot-toast';

export default function ReviewListingPage() {
    const router = useRouter();
    const { id: listingId } = useParams();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) {
            return toast.error("Please select a star rating");
        }

        setIsSubmitting(true);

        const res = await createReview({
            rating,
            comment,
            housingListingId: listingId
        });

        if (res.error) {
            toast.error(res.error);
            setIsSubmitting(false);
        } else {
            setIsSubmitting(false);
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex items-center justify-center p-6">
                <div className="text-center animate-fade-in">
                    <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full mx-auto flex items-center justify-center mb-6">
                        <Star className="text-yellow-500 fill-yellow-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Review Submitted!</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs mx-auto mb-8">
                        Thank you for sharing your experience. Your feedback helps other students find great places to live.
                    </p>
                    <Link href={`/housing/${listingId}`} className="bg-brand-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/30">
                        Back to Listing
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 px-4 py-4">
                <div className="max-w-xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                        <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white">Write a Review</h1>
                        <p className="text-xs text-gray-500 font-bold">Share your experience with this property</p>
                    </div>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Rating Stars */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm text-center">
                        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6">
                            How was your stay?
                        </h2>

                        <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={48}
                                        className={(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-sm font-bold text-gray-400 mt-4 h-5">
                            {rating === 1 && "Terrible"}
                            {rating === 2 && "Poor"}
                            {rating === 3 && "Average"}
                            {rating === 4 && "Very Good"}
                            {rating === 5 && "Excellent!"}
                        </p>
                    </div>

                    {/* Review Text */}
                    <div className="bg-white dark:bg-unizy-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MessageSquare size={16} className="text-brand-500" /> Share Details
                        </h2>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you like about the property? Were there any issues with the landlord or neighbors?..."
                            rows={6}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:border-brand-500 outline-none text-gray-900 dark:text-white font-medium resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || rating === 0}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'Submit Review'
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}
