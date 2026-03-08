'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, CheckCircle2, Star } from 'lucide-react';

export default function HousingCard({ listing, isSaved, onToggleSave, dict }) {
    const h = dict?.housing || {};
    const c = dict?.common || {};

    return (
        <Link href={`/housing/${listing.id}`} className="block group">
            <div className="relative bg-white/40 dark:bg-unizy-dark/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/40 dark:border-white/10 shadow-glass hover:shadow-glass-intense transition-all duration-500 group-hover:-translate-y-2">

                {/* Brand Aura Glow - Dynamic based on verification */}
                {listing.verified && (
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 blur-[80px] rounded-full group-hover:bg-brand-500/20 transition-all duration-700" />
                )}

                {/* Image Container */}
                <div className="relative h-64 w-full overflow-hidden">
                    <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />

                    {/* Glass Overlays on Image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                    {/* Status Badge */}
                    {listing.verified && (
                        <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">{c.verified || "Verified"}</span>
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onToggleSave(listing.id);
                        }}
                        className={`absolute top-6 right-6 p-3 rounded-2xl backdrop-blur-md border transition-all duration-300 ${isSaved
                                ? "bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/40 scale-110"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/30"
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
                    </button>

                    {/* Price Tag */}
                    <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl shadow-2xl">
                        <span className="text-xl font-black text-white tracking-tighter">
                            {listing.price}
                        </span>
                        <span className="ml-1 text-[10px] font-bold text-white/70 uppercase tracking-tighter">
                            {h.perMonth || "EGP/mo"}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg border border-brand-500/20">
                                {listing.type}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-500/20">
                                {listing.gender}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-bold text-gray-400 tracking-tighter">PRO MAX</span>
                        </div>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-brand-600 transition-colors duration-300">
                        {listing.title}
                    </h3>

                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        <MapPin className="w-4 h-4 text-brand-500" />
                        <span className="text-sm font-medium truncate">{listing.area} • {listing.distance}</span>
                    </div>

                    {/* Action Row - Physics Button */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <div className="h-1.5 w-12 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-0 group-hover:w-full bg-brand-500 transition-all duration-700 ease-out" />
                        </div>
                        <span className="text-xs font-black text-brand-600 dark:text-brand-400 tracking-widest uppercase opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                            {h.viewDetails || "View Listing"} →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
