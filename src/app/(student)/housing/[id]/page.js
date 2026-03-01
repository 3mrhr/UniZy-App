import Link from "next/link";
import Image from "next/image";

import { getHousingListingById } from '@/app/actions/housing';
import { getReviewsForHousing } from '@/app/actions/reviews';

export default async function ListingDetails({ params }) {
    const { id } = await params;
    const listingData = await getHousingListingById(id);
    const reviewData = await getReviewsForHousing(id);

    // Provide robust fallbacks if db empty or id missing
    const listing = listingData || {
        id,
        title: "Cozy Studio near Science Faculty (Mock)",
        price: 1500,
        type: "Studio",
        location: "Al Zahraa, New Assiut",
        description: "A perfect quiet studio for a dedicated student. Recently renovated with new appliances. High-speed internet included in rent. 2 months minimum stay.",
        images: "[\"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80\"]",
        amenities: "[\"WiFi\", \"AC\"]",
        provider: { name: "Ahmed Hassan" }
    };

    let images = [];
    try { images = JSON.parse(listing.images); } catch (e) { }
    if (!images.length) images = ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"];

    let amenities = [];
    try { amenities = JSON.parse(listing.amenities); } catch (e) { }

    const landlordName = listing.provider?.name || "Unknown Landlord";

    return (
        <div className="flex flex-col min-h-screen bg-white pb-28 relative">

            {/* Header / Back Button Over Image */}
            <Link href="/housing" className="absolute top-6 left-6 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white shadow-lg transition-colors border border-white/30">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
            </Link>

            <button className="absolute top-6 right-6 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white shadow-lg transition-colors border border-white/30">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </button>

            {/* Hero Image Gallery (Simplified for MVP) */}
            <div className="relative h-72 w-full bg-gray-900 overflow-hidden rounded-b-3xl">
                <Image
                    src={images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover opacity-90 animate-fade-in"
                    priority
                />
                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium tracking-wide">
                    1 / {images.length}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
            </div>

            <main className="px-6 md:px-12 py-6 -mt-8 md:-mt-16 relative z-10 animate-fade-in max-w-5xl mx-auto w-full">

                {/* Title & Price Card */}
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
                        <div className="bg-green-50 text-green-700 p-2 rounded-full border border-green-100 flex-shrink-0" title="Verified Listing">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                    </div>

                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-3xl font-extrabold text-brand-600">{listing.price}</span>
                        <span className="text-sm text-gray-500 font-medium mb-1">EGP / month</span>
                    </div>

                    <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm font-medium">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl">{listing.type}</span>
                        <span className="bg-blue-50 text-brand-700 px-3 py-1.5 rounded-xl border border-brand-100">{listing.location}</span>
                    </div>
                </div>

                {/* Quick Details */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-2xl flex flex-col gap-1">
                        <span className="text-xl">🚶</span>
                        <span className="text-xs text-gray-500 font-medium">Distance</span>
                        <span className="text-sm font-bold text-gray-900">Near Campus</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl flex flex-col gap-1">
                        <span className="text-xl">💰</span>
                        <span className="text-xs text-gray-500 font-medium">Deposit</span>
                        <span className="text-sm font-bold text-gray-900">{listing.price} EGP</span>
                    </div>
                </div>

                {/* Description */}
                <section className="mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">About this place</h2>
                    <p className="text-gray-600 leading-relaxed text-sm">{listing.description}</p>
                </section>

                {/* Amenities */}
                {amenities && amenities.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Amenities</h2>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                            {amenities.map(amenity => (
                                <div key={amenity} className="flex items-center gap-3 text-gray-700 text-sm font-medium">
                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">✓</div>
                                    {amenity}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Landlord Info and Aggregated Reviews */}
                <section className="bg-gray-50 rounded-2xl p-5 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                            {/* Placeholder Avatar */}
                            <div className="w-full h-full bg-gradient-to-tr from-gray-400 to-gray-200"></div>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Hosted by {landlordName}</p>
                            <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                                <span>★</span> <span className="text-gray-700 font-medium">{reviewData.average > 0 ? reviewData.average : 'New'} ({reviewData.count} reviews)</span>
                            </div>
                        </div>
                    </div>
                    <button className="bg-white p-2 rounded-full shadow-sm text-brand-600 border border-gray-100 hover:bg-gray-50 transition-colors">
                        💬
                    </button>
                </section>

                {/* Real Reviews Stream */}
                <section className="mb-12">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Guest Reviews</h2>
                    <div className="space-y-4">
                        {reviewData.reviews && reviewData.reviews.length > 0 ? (
                            reviewData.reviews.map(review => (
                                <div key={review.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
                                                {review.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{review.user?.name || 'A Student'}</p>
                                                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="bg-yellow-50 text-yellow-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                                            <span>★</span> {review.rating}.0
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-gray-600 text-sm">{review.comment}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                                <p className="text-gray-500 text-sm text-center italic">No reviews yet for this listing.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Additional Spacing for Fixed Bottom Bar on Desktop */}
                <div className="h-24 md:h-12"></div>

            </main>

            {/* Floating Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 px-6 md:px-12 flex justify-center z-50 rounded-t-3xl md:rounded-none shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <div className="max-w-5xl w-full flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-0.5">Total per month</p>
                        <p className="text-xl md:text-3xl font-extrabold text-gray-900">{listing.price} <span className="text-sm font-medium text-gray-500">EGP</span></p>
                    </div>
                    <button className="bg-brand-600 hover:bg-brand-700 text-white px-8 md:px-12 py-3.5 md:py-4 rounded-2xl font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95 text-lg">
                        Request Viewing
                    </button>
                </div>
            </div>

        </div>
    );
}
