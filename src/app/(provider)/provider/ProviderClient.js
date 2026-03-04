'use client';

import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import ThemeLangControls from '@/components/ThemeLangControls';
import Image from 'next/image';
import { DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function ProviderClient({ settlements, dbListings = [], dbLeads = [] }) {
    const { dict } = useLanguage();
    const [leads, setLeads] = useState(dbLeads);
    const [isUpdating, setIsUpdating] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', price: '', type: 'Apartment', location: '', amenities: '' });

    const totalRevenue = settlements.reduce((sum, s) => sum + s.netAmount, 0);

    const handleUpdateLeadStatus = async (leadId, newStatus) => {
        setIsUpdating(leadId);
        try {
            const { updateHousingRequestStatus } = await import('@/app/actions/housing');
            const res = await updateHousingRequestStatus(leadId, newStatus);
            if (res.success) {
                setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
            } else {
                alert(res.error || 'Failed to update lead');
            }
        } catch (e) {
            console.error(e);
        }
        setIsUpdating(null);
    };

    const handleCreateListing = async (e) => {
        e.preventDefault();
        setIsUpdating('create');
        try {
            const { createHousingListing } = await import('@/app/actions/housing');

            const payload = {
                ...formData,
                amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
                images: ['/placeholder.png'] // default for MVP
            };

            const res = await createHousingListing(payload);
            if (res.success || res.ok) {
                alert('Property listed successfully! (Pending approval)');
                setIsModalOpen(false);
                setFormData({ title: '', description: '', price: '', type: 'Apartment', location: '', amenities: '' });
                // Note: It will require page refresh to see pending properties depending on server query
            } else {
                alert(res.error?.message || res.error || 'Failed to create listing');
            }
        } catch (error) {
            console.error(error);
        }
        setIsUpdating(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy transition-colors pb-24">

            {/* Provider Top Header */}
            <header className="bg-white dark:bg-unizy-dark px-6 py-6 shadow-sm border-b border-gray-100 dark:border-white/5 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 text-lg">
                        H
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">Housing Hub</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            Verified Provider
                        </p>
                    </div>
                </div>
                <ThemeLangControls />
            </header>

            <main className="px-6 py-8 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8">

                {/* Left Column: Quick Actions & Stats */}
                <div className="lg:col-span-1 flex flex-col gap-6 animate-fade-in-up">
                    <button onClick={() => setIsModalOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-[2rem] shadow-xl shadow-indigo-500/20 flex flex-col items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group">
                        <span className="text-3xl group-hover:rotate-12 transition-transform">➕</span>
                        <span className="font-black text-sm uppercase tracking-wider">List New Property</span>
                    </button>

                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-3xl">
                            <DollarSign className="w-8 h-8 text-indigo-500 mb-1" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Earnings</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">EGP {totalRevenue}</p>
                        </div>
                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-3xl">
                            <span className="text-2xl mb-1">📱</span>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Leads</p>
                            <p className="text-xl font-black text-gray-900 dark:text-white">{leads.length}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6">Recent Leads</h3>
                        <div className="space-y-6">
                            {leads.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center">No leads yet.</p>
                            ) : leads.map(lead => (
                                <div key={lead.id} className="flex flex-col border-b border-gray-50 dark:border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{lead.user?.name || 'Unknown User'}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">Property: {lead.listing?.title || 'Unknown'}</p>
                                            <p className="text-[10px] text-indigo-500 font-bold mt-1 uppercase tracking-tighter">{lead.status}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {lead.user?.phone && (
                                                <a href={`tel:${lead.user.phone}`} className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg text-xs hover:bg-blue-600 transition-colors">📞</a>
                                            )}
                                        </div>
                                    </div>
                                    {lead.status === 'PENDING' && (
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                disabled={isUpdating === lead.id}
                                                onClick={() => handleUpdateLeadStatus(lead.id, 'ACCEPTED')}
                                                className="flex-1 py-1 bg-green-100 text-green-700 text-xs font-bold rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                disabled={isUpdating === lead.id}
                                                onClick={() => handleUpdateLeadStatus(lead.id, 'REJECTED')}
                                                className="flex-1 py-1 bg-red-100 text-red-700 text-xs font-bold rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Listings Manager */}
                <div className="lg:col-span-2 flex flex-col gap-6 animate-fade-in delay-200">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">My Properties</h2>
                    </div>

                    {dbListings.length === 0 ? (
                        <div className="bg-white dark:bg-unizy-dark p-12 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm text-center">
                            <span className="text-4xl mb-4 block">🏠</span>
                            <p className="text-gray-500 font-bold">You don't have any properties listed yet.</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-6">
                            {dbListings.map(listing => {
                                let imageUrl = '/placeholder.png';
                                try {
                                    const images = JSON.parse(listing.images);
                                    if (images.length > 0) imageUrl = images[0];
                                } catch (e) { }

                                return (
                                    <div key={listing.id} className="group bg-white dark:bg-unizy-dark rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col">
                                        <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-white/5">
                                            {imageUrl !== '/placeholder.png' ? (
                                                <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">No Image</div>
                                            )}
                                            <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md ${listing.status === 'ACTIVE' ? 'bg-green-500/90 text-white' : 'bg-orange-500/90 text-white'}`}>
                                                {listing.status}
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="font-black text-gray-900 dark:text-white leading-tight mb-2 flex-1">{listing.title}</h3>
                                            <p className="text-brand-600 font-bold text-sm mb-4">EGP {listing.price} / month</p>

                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                <button className="py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 font-bold text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 transition-colors">Edit</button>
                                                <Link href={`/housing/${listing.id}`} className="py-3 text-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 font-bold text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors">View</Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </main>

            {/* Create Listing Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-unizy-dark w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">✕</button>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">List New Property</h2>

                        <form onSubmit={handleCreateListing} className="flex flex-col gap-4">
                            <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Property Title (e.g. Sunny Studio)" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />

                            <div className="grid grid-cols-2 gap-4">
                                <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="Price (EGP/mo)" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm appearance-none">
                                    <option value="Apartment">Apartment</option>
                                    <option value="Studio">Studio</option>
                                    <option value="Shared Room">Shared Room</option>
                                    <option value="Single Room">Single Room</option>
                                </select>
                            </div>

                            <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Location (e.g. Next to Main Gate)" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Description (Optional)" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm resize-none h-24" />
                            <input value={formData.amenities} onChange={e => setFormData({ ...formData, amenities: e.target.value })} placeholder="Amenities (comma separated, e.g. WiFi, AC)" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />

                            <button disabled={isUpdating === 'create'} type="submit" className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                                {isUpdating === 'create' ? 'Submitting...' : 'Submit Listing'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
