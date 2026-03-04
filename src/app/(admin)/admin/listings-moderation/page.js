"use client";

import { useState, useEffect } from "react";
import { getPendingListings, approveListing, rejectListing } from "@/app/actions/housing";
import { toast } from "react-hot-toast";

export default function ListingsModerationPage() {
    const [pendingListings, setPendingListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        const res = await getPendingListings();
        setPendingListings(res || []);
        setLoading(false);
    };

    const handleApprove = async (id) => {
        setActionLoading(id);
        const res = await approveListing(id, "ADMIN_OVERRIDE");
        if (res?.success) {
            toast.success("Listing approved");
            await fetchListings();
        } else {
            toast.error(res?.error || "Error approving");
        }
        setActionLoading(null);
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Rejection reason:") || "Violates guidelines";
        setActionLoading(id);
        const res = await rejectListing(id, "ADMIN_OVERRIDE", reason);
        if (res?.success) {
            toast.success("Listing rejected");
            await fetchListings();
        } else {
            toast.error(res?.error || "Error rejecting");
        }
        setActionLoading(null);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Listings Moderation</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Review housing listings submitted by providers before they go live.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500">Loading listings...</div>
            ) : pendingListings.length === 0 ? (
                <div className="flex-1 flex items-center justify-center bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 p-12 text-center text-slate-500 dark:text-slate-400">
                    No pending housing listings for moderation.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {pendingListings.map((listing) => {
                        const images = listing.images ? JSON.parse(listing.images) : [];
                        return (
                            <div key={listing.id} className="bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col overflow-hidden">
                                <div className="h-48 bg-slate-200 dark:bg-unizy-navy relative mb-4">
                                    {images.length > 0 ? (
                                        <img src={images[0]} alt="Property" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">No Image</div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                                        EGP {listing.price}/mo
                                    </div>
                                </div>

                                <div className="p-4 flex-1 flex flex-col gap-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{listing.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{listing.description}</p>

                                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                        <p><strong>Provider:</strong> {listing.provider?.name} ({listing.provider?.phone})</p>
                                        <p><strong>Location:</strong> {listing.location}</p>
                                        <p><strong>Type:</strong> {listing.type}</p>
                                    </div>

                                    <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-white/5">
                                        <button
                                            onClick={() => handleReject(listing.id)}
                                            disabled={actionLoading === listing.id}
                                            className="flex-1 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 text-sm font-semibold shadow-sm"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApprove(listing.id)}
                                            disabled={actionLoading === listing.id}
                                            className="flex-1 px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 rounded-xl transition-all disabled:opacity-50 text-sm font-semibold shadow-md shadow-brand-500/20"
                                        >
                                            {actionLoading === listing.id ? "Working..." : "Approve"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
