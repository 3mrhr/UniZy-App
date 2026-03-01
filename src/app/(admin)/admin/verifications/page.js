import Image from "next/image";

export default function AdminVerifications() {
    const verifications = [
        { id: "VER-8921", user: "Omar Ahmed", type: "Student ID", uploaded: "10 mins ago", status: "Pending", documentPreview: "https://images.unsplash.com/photo-1544813545-4827b64fcacb?w=400&q=80" },
        { id: "VER-8922", user: "Ahmed Hassan", type: "Landlord Title Deed", uploaded: "1 hour ago", status: "Pending", documentPreview: "https://images.unsplash.com/photo-1554188249-1dcbd4618e4a?w=400&q=80" },
        { id: "VER-8923", user: "Mohamed S.", type: "Driver License", uploaded: "2 hours ago", status: "Approved", documentPreview: "https://images.unsplash.com/photo-1621252179027-94459d278660?w=400&q=80" },
        { id: "VER-8919", user: "Ali G.", type: "National ID", uploaded: "1 day ago", status: "Rejected", documentPreview: "https://images.unsplash.com/photo-1614850715649-1d0106293cb1?w=400&q=80" },
    ];

    return (
        <div className="flex flex-col gap-6 h-full">

            {/* Header */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Verification Center</h1>
                    <p className="text-slate-500 text-sm">Review documents submitted by Students, Drivers, and Providers.</p>
                </div>
            </div>

            {/* Grid Layout for Queue vs Preview */}
            <div className="flex gap-8 flex-1 min-h-[600px]">

                {/* Queue List (Left Side) */}
                <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h2 className="font-bold text-slate-800 text-sm flex justify-between">
                            Pending Queue <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md text-xs">2</span>
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto w-full p-2 space-y-2">
                        {verifications.map((item, i) => (
                            <div key={item.id} className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all ${i === 0 ? 'bg-brand-50 border-brand-200 shadow-inner' : 'bg-white border-slate-100 hover:border-brand-200'}`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-mono font-bold text-slate-500">{item.id}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${item.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                            item.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>{item.status}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{item.user}</p>
                                    <p className="text-xs font-medium text-slate-600 mt-0.5">{item.type}</p>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Uploaded {item.uploaded}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Document Preview (Right Side) */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">

                    {/* Viewer Header */}
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <div>
                            <h2 className="font-bold text-slate-900">Reviewing: Omar Ahmed</h2>
                            <p className="text-sm text-slate-500">Student ID Verification</p>
                        </div>
                        <div className="flex gap-2 text-sm">
                            <span className="font-medium text-slate-600">University:</span>
                            <span className="font-bold text-slate-900">Assiut University</span>
                        </div>
                    </div>

                    {/* Viewer Area */}
                    <div className="flex-1 bg-slate-100 relative p-8 flex items-center justify-center">
                        <div className="absolute inset-0 pattern-dots text-slate-200 opacity-50"></div>

                        <div className="w-[500px] h-[320px] bg-white rounded-xl shadow-lg relative p-2 border-2 border-slate-300">
                            <div className="w-full h-full relative bg-slate-200 rounded-lg overflow-hidden">
                                <Image
                                    src={verifications[0].documentPreview}
                                    alt="Document Preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {/* Mock Watermark/Overlay */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded text-xs font-mono">
                                Scan Quality: 94%
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-5 border-t border-slate-100 bg-white flex justify-between items-center">
                        <button className="text-slate-500 font-medium text-sm hover:text-slate-800 transition-colors">
                            Flag as Suspicious
                        </button>
                        <div className="flex gap-3">
                            <button className="px-6 py-2.5 rounded-xl font-bold bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm">
                                Reject Document
                            </button>
                            <button className="px-8 py-2.5 rounded-xl font-bold bg-green-600 border border-green-600 text-white hover:bg-green-700 transition-colors shadow-md shadow-green-500/20">
                                Approve
                            </button>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
