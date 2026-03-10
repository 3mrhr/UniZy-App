import Link from "next/link";
import Image from "next/image";
import { getSavedHousing } from "@/app/actions/housing";

export const dynamic = 'force-dynamic';

export default async function SavedHousingPage() {
    const savedListings = await getSavedHousing();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 pb-24 dark:bg-unizy-navy transition-colors">

            {/* Header */}
            <header className="bg-white dark:bg-unizy-dark px-6 md:px-12 py-6 shadow-sm sticky top-0 z-10 flex items-center justify-between max-w-7xl mx-auto w-full border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <Link href="/housing" className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </Link>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Saved Housing</h1>
                </div>
            </header>

            <main className="px-6 md:px-12 py-6 flex flex-col gap-5 animate-fade-in max-w-7xl mx-auto w-full">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-red-500">❤️</span> Your Favorites
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedListings.length > 0 ? (
                        savedListings.map((listing) => {
                            let images = [];
                            try { images = JSON.parse(listing.images); } catch (e) { }
                            const mainImage = images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80";

                            return (
                                <Link href={`/housing/${listing.id}`} key={listing.id} className="block group">
                                    <div className="bg-white dark:bg-unizy-dark rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-white/5 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 relative">

                                        <div className="absolute top-4 right-4 z-10 bg-red-500 text-white p-2 rounded-full shadow-lg">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                        </div>

                                        <div className="relative h-48 w-full bg-gray-200 dark:bg-unizy-navy/30">
                                            <Image
                                                src={mainImage}
                                                alt={listing.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />

                                            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-unizy-dark/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white/50 dark:border-white/10">
                                                <p className="font-bold text-gray-900 dark:text-white">{listing.price} <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">EGP/mo</span></p>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-gray-900 dark:text-white leading-tight w-4/5 group-hover:text-brand-600 transition-colors">{listing.title}</h3>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                <span className="flex-shrink-0">📍</span>
                                                <p className="truncate">{listing.location}</p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs font-medium">
                                                <span className="bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-lg border border-brand-100 dark:border-brand-900/30">{listing.type}</span>
                                            </div>
                                        </div>

                                    </div>
                                </Link>
                            )
                        })
                    ) : (
                        <div className="col-span-full py-12 flex flex-col items-center bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5">
                            <span className="text-5xl mb-4">💔</span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No saved listings</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center text-sm max-w-sm">
                                You haven&apos;t favorited any housing listings yet. Explore properties and hit the heart icon to save them here!
                            </p>
                            <Link href="/housing" className="mt-6 bg-brand-600 font-bold text-white px-6 py-3 rounded-xl hover:bg-brand-700 transition-colors">
                                Explore Housing
                            </Link>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}