import Image from "next/image";

export default function AdminHousing() {
    const listings = [
        { id: "1024", title: "Cozy Studio near Science Faculty", provider: "Ahmed Hassan", price: 1500, type: "Studio", status: "Active", date: "Oct 12" },
        { id: "1025", title: "Shared Room in Luxury Dorm", provider: "Al Amal Dorms", price: 800, type: "Shared", status: "Active", date: "Oct 12" },
        { id: "1026", title: "Spacious Private Bedroom", provider: "Sarah K.", price: 2000, type: "Private", status: "Pending", date: "Oct 13" },
        { id: "1027", title: "Affordable Bed in Mixed Appartment", provider: "Property Bros", price: 650, type: "Shared", status: "Rejected", date: "Oct 13" },
        { id: "1028", title: "Premium Studio with Balcony", provider: "Nour R.", price: 2200, type: "Studio", status: "Pending", date: "Oct 14" },
    ];

    return (
        <div className="flex flex-col gap-6">

            {/* Header Array */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Housing Moderation</h1>
                    <p className="text-slate-500 text-sm">Review, approve, and manage all student housing listings.</p>
                </div>
                <button className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-brand-500/20 transition-all text-sm flex items-center gap-2">
                    <span>+</span> Add Listing Manually
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 border-b border-slate-200">
                <button className="pb-3 text-sm font-bold text-brand-600 border-b-2 border-brand-600">All Listings (420)</button>
                <button className="pb-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Pending Review (12)</button>
                <button className="pb-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Active (389)</button>
                <button className="pb-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Rejected/Suspended (19)</button>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                {/* Table Header Controls */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">🔍</span>
                            <input type="text" placeholder="Search by title, provider, ID..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500 w-64" />
                        </div>
                        <button className="border border-slate-200 bg-white text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <span>⚙️</span> Filters
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Showing 1-5 of 420</span>
                        <div className="flex gap-1 ml-2">
                            <button className="p-1 rounded bg-slate-100 text-slate-400 cursor-not-allowed">◀</button>
                            <button className="p-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50">▶</button>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white border-b border-slate-100">
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16">ID</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Listing Details</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Provider</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Price / Type</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {listings.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="p-4 text-sm font-mono text-slate-500">#{item.id}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0 overflow-hidden relative">
                                            <Image src={`https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100&q=80`} alt="thumb" fill className="object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors cursor-pointer">{item.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Added {item.date}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm font-medium text-slate-700">{item.provider}</p>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm font-bold text-slate-900">{item.price} <span className="text-xs text-slate-500 font-medium">EGP/mo</span></p>
                                    <p className="text-xs text-slate-500 mt-0.5">{item.type}</p>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${item.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                                            item.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-red-50 text-red-700 border-red-100'
                                        }`}>
                                        {item.status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>}
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.status === 'Pending' && (
                                            <>
                                                <button className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">✓</button>
                                                <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">✕</button>
                                            </>
                                        )}
                                        <button className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit/View">✏️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>

        </div>
    );
}
