'use client';

import { useState } from 'react';
import { toggleSavedHousing } from '@/app/actions/housing';
import toast from 'react-hot-toast';

export default function SaveButton({ listingId, initialSaved }) {
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const res = await toggleSavedHousing(listingId);
            if (res.error) {
                toast.error(res.error);
            } else {
                setIsSaved(res.saved);
                toast.success(res.saved ? 'Saved to favorites' : 'Removed from favorites');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`absolute top-6 right-6 z-20 backdrop-blur-md p-3 rounded-full shadow-lg transition-colors border border-white/30 ${isSaved ? 'bg-red-500/90 text-white' : 'bg-white/20 hover:bg-white/40 text-white'
                }`}
        >
            <svg className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
        </button>
    );
}
