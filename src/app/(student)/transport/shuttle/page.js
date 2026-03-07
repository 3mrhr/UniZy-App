'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Bus, MapPin, Navigation, Info, Clock } from 'lucide-react';
import { getShuttleBuses } from '@/app/actions/transport';
// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

export default function ShuttleMapPage() {
    const [buses, setBuses] = useState([]);
    const [userLoc, setUserLoc] = useState([27.185, 31.171]); // Default Assiut Univ
    const [nearestBus, setNearestBus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const busRes = await getShuttleBuses();

            if (busRes.success) setBuses(busRes.data);
            setIsLoading(false);
        };

        loadData();
    }, []);

    // Calculate nearest bus
    useEffect(() => {
        if (buses.length > 0) {
            let minVal = Infinity;
            let closest = null;
            buses.forEach(bus => {
                const dist = calculateDistance(userLoc[0], userLoc[1], bus.lat, bus.lng);
                if (dist < minVal) {
                    minVal = dist;
                    closest = { ...bus, distance: dist };
                }
            });
            setNearestBus(closest);
        }
    }, [buses, userLoc]);

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-unizy-navy overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-[1000] px-6 py-6 bg-white/40 dark:bg-unizy-navy/40 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 flex items-center gap-4">
                <Link href="/transport" className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <ChevronLeft size={20} className="text-gray-900 dark:text-white" />
                </Link>
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white leading-none tracking-tight">Live Shuttle Pro</h1>
                    <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mt-1">Real-time Campus Fleet</p>
                </div>
            </header>

            {/* Map Area */}
            <div className="flex-1 mt-20 relative">
                <div className="h-full w-full p-6 pt-10">
                    <div className="h-full rounded-3xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md p-6 overflow-auto">
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4">Live Fleet Coordinates</h2>
                        <div className="space-y-3">
                            {buses.map(bus => (
                                <div key={bus.id} className="flex items-center justify-between rounded-2xl bg-gray-50 dark:bg-unizy-dark px-4 py-3 border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Bus size={16} className="text-brand-500" />
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">Bus #{bus.busNumber}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{bus.plateNumber} • {bus.status}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300">{bus.lat.toFixed(4)}, {bus.lng.toFixed(4)}</p>
                                </div>
                            ))}
                            {buses.length === 0 && (
                                <p className="text-sm text-gray-500 italic">No live shuttle data available.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Panel Overlay */}
                <div className="absolute bottom-10 left-6 right-6 z-[1000] space-y-4">
                    {nearestBus && (
                        <div className="glass-frosted p-8 rounded-[2.5rem] shadow-3xl relative overflow-hidden group border-none scale-100 hover:scale-[1.01] transition-transform duration-500">
                            {/* Aura Background Glow */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500/5 blur-[100px] rounded-full"></div>

                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-3xl bg-brand-600 flex items-center justify-center text-white shadow-2xl glow-brand animate-spring">
                                        <Navigation size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Nearest Bus Found</h3>
                                        <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest mt-1">Proximity: {nearestBus.distance.toFixed(2)} km</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 text-right">
                                    <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Live Status
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Real-time sync active</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <div className="bg-gray-500/5 dark:bg-white/5 p-5 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Bus size={14} className="text-brand-500" />
                                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Bus Details</span>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">#{nearestBus.busNumber} • {nearestBus.plateNumber}</p>
                                </div>
                                <div className="bg-gray-500/5 dark:bg-white/5 p-5 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock size={14} className="text-brand-500" />
                                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">ETA Status</span>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white tracking-tight">Stationed & Ready</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
