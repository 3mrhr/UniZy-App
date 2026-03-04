'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, Home, Wifi, Wind, Zap, Droplets, MapPin, ChevronLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const AMENITY_ICONS = {
    'WiFi': { icon: Wifi, label: 'WiFi' },
    'AC': { icon: Wind, label: 'AC' },
    'Kitchen': { icon: Zap, label: 'Kitchen' },
    'Washer': { icon: Droplets, label: 'Washer' },
    'Balcony': { icon: Home, label: 'Balcony' },
};

function CompareListingsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [allListings, setAllListings] = useState([]);
    const [selected, setSelected] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { getHousingListings } = await import('@/app/actions/housing');
            const data = await getHousingListings();
            setAllListings(data);

            // Default to first two if they exist
            if (data.length >= 2) {
                const idsParam = searchParams.get('ids');
                if (idsParam) {
                    const ids = idsParam.split(',');
                    const s = ids.map(id => data.find(l => l.id === id)).filter(Boolean);
                    if (s.length === 2) setSelected(s);
                    else setSelected([data[0], data[1]]);
                } else {
                    setSelected([data[0], data[1]]);
                }
            } else if (data.length === 1) {
                setSelected([data[0]]);
            }
            setIsLoading(false);
        }
        load();
    }, [searchParams]);

    const handleSelectChange = (index, newId) => {
        const newSelected = [...selected];
        newSelected[index] = allListings.find(l => l.id === newId);
        setSelected(newSelected);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div></div>;
    }

    if (allListings.length < 2) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <span className="text-4xl mb-4">🏠</span>
                <h2 className="text-xl font-bold mb-2">Not enough listings</h2>
                <p className="text-gray-500 mb-6">You need at least two housing listings to use the compare feature.</p>
                <button onClick={() => router.back()} className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold">Go Back</button>
            </div>
        );
    }

    const fields = [
        { label: 'Monthly Rent', key: 'price', format: (v) => `${v} EGP` },
        { label: 'Type', key: 'type' },
        { label: 'Gender', key: 'gender', format: () => 'Mixed' }, // Note: Add proper DB field if needed
        { label: 'Rating', key: 'rating', format: () => `⭐ 5.0` }, // Placeholder until reviews tied
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                        <ChevronLeft size={24} className="text-gray-900 dark:text-white" />
                    </button>
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight size={20} className="text-brand-500" />
                        <h1 className="text-lg font-black text-gray-900 dark:text-white">Compare Listings</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Listing Headers */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="col-span-1 border-b border-gray-100 dark:border-white/5 pb-2">
                        <p className="text-xs font-bold text-gray-500 text-center">Select to change:</p>
                    </div>
                    {selected.map((listing, index) => (
                        <div key={`sel-${index}`} className="flex flex-col gap-2">
                            <select
                                value={listing?.id || ''}
                                onChange={(e) => handleSelectChange(index, e.target.value)}
                                className="w-full text-xs font-bold bg-gray-100 dark:bg-white/5 p-2 rounded-xl outline-none"
                            >
                                {allListings.map(l => (
                                    <option key={l.id} value={l.id}>{l.title}</option>
                                ))}
                            </select>
                            <div className="bg-white dark:bg-unizy-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 text-center">
                                <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/20 rounded-2xl mx-auto flex items-center justify-center mb-3">
                                    <Home size={28} className="text-brand-600" />
                                </div>
                                <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">{listing?.title}</h3>
                                <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                                    <MapPin size={10} /> {listing?.location}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
                    {fields.map((field, idx) => {
                        const vals = selected.map((l) => field.format ? field.format(l[field.key]) : l[field.key]);
                        const isBetter = (i) => {
                            if (field.key === 'price' || field.key === 'deposit') return selected[i][field.key] <= Math.min(...selected.map(s => s[field.key]));
                            if (field.key === 'rating') return selected[i][field.key] >= Math.max(...selected.map(s => s[field.key]));
                            return false;
                        };
                        return (
                            <div key={field.key} className={`grid grid-cols-3 gap-4 px-6 py-4 ${idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-white/[0.02]' : ''}`}>
                                <div className="text-sm font-black text-gray-500 dark:text-gray-400 flex items-center">{field.label}</div>
                                {vals.map((val, i) => (
                                    <div key={i} className={`text-sm font-bold text-center ${isBetter(i) ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                        {val}
                                    </div>
                                ))}
                            </div>
                        );
                    })}

                    {/* Amenities Row */}
                    <div className="grid grid-cols-3 gap-4 px-6 py-4">
                        <div className="text-sm font-black text-gray-500 dark:text-gray-400 flex items-center">Amenities</div>
                        {selected.map((listing, index) => {
                            let parsedAmenities = [];
                            try {
                                parsedAmenities = JSON.parse(listing?.amenities || '[]');
                            } catch (e) {
                                console.error(`Failed to parse amenities for listing ${listing?.id}:`, e);
                            }

                            return (
                                <div key={`am-${index}`} className="flex flex-wrap gap-1 justify-center">
                                    {parsedAmenities.map((a) => {
                                        const amenity = AMENITY_ICONS[a] || { icon: Home, label: a };
                                        const Icon = amenity.icon;
                                        return (
                                            <span key={a} className="inline-flex items-center gap-1 px-2 py-1 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 rounded-lg text-[10px] font-bold">
                                                <Icon size={10} /> {amenity.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {selected.map((listing, idx) => (
                        <Link key={`action-${idx}`} href={`/housing/${listing?.id}`} className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-2xl shadow-lg text-center text-sm transition-all active:scale-95">
                            View {listing?.title?.split(' ').slice(0, 2).join(' ')}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function CompareListingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CompareListingsContent />
        </Suspense>
    );
}
