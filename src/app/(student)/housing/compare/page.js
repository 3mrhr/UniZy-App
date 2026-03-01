'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, Home, Wifi, Wind, Zap, Droplets, MapPin, Star, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const MOCK_LISTINGS = [
    {
        id: '1',
        title: 'Modern Studio near Campus',
        location: 'New Assiut, Zone A',
        price: 3500,
        deposit: 5000,
        type: 'Studio',
        distance: '5 min walk',
        rating: 4.8,
        amenities: ['wifi', 'ac', 'kitchen', 'washer'],
        utilities: 'Included',
        gender: 'Mixed',
        furnished: true,
    },
    {
        id: '2',
        title: 'Shared Room - Budget Friendly',
        location: 'University District',
        price: 1800,
        deposit: 2500,
        type: 'Shared',
        distance: '10 min walk',
        rating: 4.2,
        amenities: ['wifi', 'kitchen'],
        utilities: 'Separate',
        gender: 'Male Only',
        furnished: false,
    },
    {
        id: '3',
        title: 'Full Apartment - 2BR',
        location: 'Al Walideyya',
        price: 5500,
        deposit: 8000,
        type: 'Apartment',
        distance: '15 min ride',
        rating: 4.9,
        amenities: ['wifi', 'ac', 'kitchen', 'washer', 'balcony'],
        utilities: 'Included',
        gender: 'Mixed',
        furnished: true,
    },
];

const AMENITY_ICONS = {
    wifi: { icon: Wifi, label: 'WiFi' },
    ac: { icon: Wind, label: 'AC' },
    kitchen: { icon: Zap, label: 'Kitchen' },
    washer: { icon: Droplets, label: 'Washer' },
    balcony: { icon: Home, label: 'Balcony' },
};

export default function CompareListingsPage() {
    const router = useRouter();
    const [selected, setSelected] = useState([MOCK_LISTINGS[0], MOCK_LISTINGS[1]]);

    const fields = [
        { label: 'Monthly Rent', key: 'price', format: (v) => `${v} EGP` },
        { label: 'Deposit', key: 'deposit', format: (v) => `${v} EGP` },
        { label: 'Type', key: 'type' },
        { label: 'Distance', key: 'distance' },
        { label: 'Utilities', key: 'utilities' },
        { label: 'Gender', key: 'gender' },
        { label: 'Furnished', key: 'furnished', format: (v) => v ? '✅ Yes' : '❌ No' },
        { label: 'Rating', key: 'rating', format: (v) => `⭐ ${v}` },
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
                    <div className="col-span-1"></div>
                    {selected.map((listing) => (
                        <div key={listing.id} className="bg-white dark:bg-unizy-dark rounded-2xl p-4 border border-gray-100 dark:border-white/5 text-center">
                            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/20 rounded-2xl mx-auto flex items-center justify-center mb-3">
                                <Home size={28} className="text-brand-600" />
                            </div>
                            <h3 className="font-black text-sm text-gray-900 dark:text-white truncate">{listing.title}</h3>
                            <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                                <MapPin size={10} /> {listing.location}
                            </p>
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
                        {selected.map((listing) => (
                            <div key={listing.id} className="flex flex-wrap gap-1 justify-center">
                                {listing.amenities.map((a) => {
                                    const amenity = AMENITY_ICONS[a];
                                    if (!amenity) return null;
                                    const Icon = amenity.icon;
                                    return (
                                        <span key={a} className="inline-flex items-center gap-1 px-2 py-1 bg-brand-50 dark:bg-brand-900/10 text-brand-600 dark:text-brand-400 rounded-lg text-[10px] font-bold">
                                            <Icon size={10} /> {amenity.label}
                                        </span>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {selected.map((listing) => (
                        <Link key={listing.id} href={`/housing/${listing.id}`} className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-2xl shadow-lg text-center text-sm transition-all active:scale-95">
                            View {listing.title.split(' ').slice(0, 2).join(' ')}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
