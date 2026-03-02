"use client";

import { useState, useEffect } from "react";
import { getPendingVerifications, approveVerification, rejectVerification } from "@/app/actions/verification";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function AdminVerifications() {
    const [pendingDocs, setPendingDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("STUDENT"); // STUDENT, DRIVER, PROVIDER, MERCHANT
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        setLoading(true);
        const res = await getPendingVerifications();
        if (res?.success) {
            setPendingDocs(res.verifications);
        } else {
            toast.error("Failed to fetch pending verifications");
        }
        setLoading(false);
    };

    const handleApprove = async (docId) => {
        setActionLoading(docId);
        const res = await approveVerification(docId, "ADMIN_OVERRIDE"); // Assuming admin logic is handled by session usually
        if (res?.success) {
            toast.success("Document approved");
            await fetchDocs();
        } else {
            toast.error(res?.error || "Error approving");
        }
        setActionLoading(null);
    };

    const handleReject = async (docId) => {
        const reason = window.prompt("Rejection reason (optional):") || "Invalid document";
        setActionLoading(docId);
        const res = await rejectVerification(docId, "ADMIN_OVERRIDE", reason);
        if (res?.success) {
            toast.success("Document rejected");
            await fetchDocs();
        } else {
            toast.error(res?.error || "Error rejecting");
        }
        setActionLoading(null);
    };

    const filteredDocs = pendingDocs.filter((doc) => doc.user?.role === activeTab);

    return (
        <div className="flex flex-col gap-6 h-full">

            {/* Header */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Verification Center</h1>
                    <p className="text-slate-500 text-sm">Review documents submitted by Students, Drivers, and Providers.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 pb-0">
                {["STUDENT", "DRIVER", "PROVIDER", "MERCHANT"].map((role) => (
                    <button
                        key={role}
                        onClick={() => setActiveTab(role)}
                        className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${activeTab === role
                                ? "border-brand-600 text-brand-700 bg-brand-50 rounded-t-lg"
                                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg"
                            }`}
                    >
                        {role}s
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400">Loading documents...</div>
            ) : filteredDocs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center text-slate-500">
                    No pending {activeTab.toLowerCase()} verifications found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => (
                        <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-bold text-slate-900">{doc.user?.name}</h3>
                                <p className="text-xs text-slate-500">{doc.user?.email} • {doc.user?.phone || 'No phone'}</p>
                            </div>

                            {/* Document Preview */}
                            <div className="w-full h-48 bg-slate-200 relative">
                                {doc.fileUrl ? (
                                    <Image
                                        src={doc.fileUrl}
                                        alt={doc.type}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-slate-400">No Image Preview</div>
                                )}
                            </div>

                            <div className="p-4 flex flex-col gap-4 flex-1">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-brand-100 text-brand-700">
                                        {doc.type.replace('_', ' ')}
                                    </span>
                                </div>
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-600 hover:underline">
                                    View Full Document ↗
                                </a>

                                <div className="flex gap-2 mt-auto pt-2">
                                    <button
                                        onClick={() => handleReject(doc.id)}
                                        disabled={actionLoading === doc.id}
                                        className="flex-1 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 text-sm font-semibold shadow-sm"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(doc.id)}
                                        disabled={actionLoading === doc.id}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl transition-all disabled:opacity-50 text-sm font-semibold shadow-md shadow-green-500/20"
                                    >
                                        {actionLoading === doc.id ? "Working..." : "Approve"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
