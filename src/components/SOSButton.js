'use client';

import { useState } from 'react';
import { Phone, Shield, MapPin, X, AlertTriangle } from 'lucide-react';

import { createTransportSOS } from '@/app/actions/sos';

export default function SOSButton({ transportOrderId, contextData }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    const handleSOS = async () => {
        setIsCalling(true);
        try {
            const result = await createTransportSOS({
                transportOrderId,
                message: 'Emergency SOS triggered',
                contextData
            });
            if (result.success) {
                alert('SOS Alert sent successfully. Help is on the way.');
            } else {
                alert('Failed to send SOS. Call emergency services immediately: 122');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to send SOS. Call emergency services immediately: 122');
        } finally {
            setIsCalling(false);
        }
    };

    const contacts = [
        { label: 'University Security', phone: '088-2412345', icon: Shield, color: 'bg-red-500' },
        { label: 'Police Emergency', phone: '122', icon: AlertTriangle, color: 'bg-blue-600' },
        { label: 'Ambulance', phone: '123', icon: Phone, color: 'bg-green-600' },
        { label: 'UniZy Support', phone: '01099887766', icon: MapPin, color: 'bg-brand-600' },
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-28 right-4 z-[100] w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl shadow-red-500/50 flex items-center justify-center animate-pulse transition-all active:scale-90"
            >
                <AlertTriangle size={24} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-unizy-dark rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="bg-red-600 px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-white" size={24} />
                        <div>
                            <h2 className="text-lg font-black text-white">Emergency SOS</h2>
                            <p className="text-red-200 text-xs font-bold">Tap to call for help</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white p-2 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Contacts */}
                <div className="p-4 space-y-3">
                    {contacts.map((c) => {
                        const Icon = c.icon;
                        return (
                            <a
                                key={c.phone}
                                href={`tel:${c.phone}`}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border border-gray-100 dark:border-white/5 hover:border-red-200 dark:hover:border-red-900/30 transition-all active:scale-[0.98] group"
                            >
                                <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center shrink-0`}>
                                    <Icon size={22} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-gray-900 dark:text-white text-sm">{c.label}</p>
                                    <p className="text-xs text-gray-500 font-bold">{c.phone}</p>
                                </div>
                                <Phone size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                            </a>
                        );
                    })}
                </div>

                {/* Share Location */}
                <div className="px-4 pb-4">
                    <button
                        onClick={handleSOS}
                        disabled={isCalling}
                        className={`w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 ${isCalling ? 'opacity-70 cursor-not-allowed' : ''}`}>
                        <MapPin size={18} /> {isCalling ? 'Sending Alert...' : 'Share Live Location & Send SOS'}
                    </button>
                </div>
            </div>
        </div>
    );
}
