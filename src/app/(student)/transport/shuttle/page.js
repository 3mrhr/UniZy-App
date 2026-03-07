'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, Bus, MapPin, Navigation, Info, Clock } from 'lucide-react';
import { getShuttleBuses, getShuttleStations } from '@/app/actions/transport';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false });

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
    const [stations, setStations] = useState([]);
    const [userLoc, setUserLoc] = useState([27.185, 31.171]); // Default Assiut Univ
    const [nearestBus, setNearestBus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fix Leaflet marker icons icon issue in Next.js
        if (typeof window !== 'undefined') {
            import('leaflet').then(L => {
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                });
            });
        }

        const loadData = async () => {
            const [busRes, stationRes] = await Promise.all([
                getShuttleBuses(),
                getShuttleStations()
            ]);

            if (busRes.success) setBuses(busRes.data);
            if (stationRes.success) setStations(stationRes.data);
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
                {typeof window !== 'undefined' && (
                    <MapContainer center={userLoc} zoom={15} className="h-full w-full">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {/* User Location Marker with Pulsing Ring */}
                        <Marker position={userLoc} icon={L.divIcon({
                            className: 'custom-user-icon',
                            html: `<div class="relative w-6 h-6 flex items-center justify-center">
                                    <div class="absolute inset-0 bg-orange-500 rounded-full opacity-20 animate-radar"></div>
                                    <div class="w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-lg z-10"></div>
                                   </div>`,
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        })}>
                            <Popup>Your current area</Popup>
                        </Marker>

                        {/* Bus Markers with Radar Pulse */}
                        {buses.map(bus => (
                            <Marker
                                key={bus.id}
                                position={[bus.lat, bus.lng]}
                                icon={L.divIcon({
                                    className: 'custom-bus-icon',
                                    html: `<div class="relative w-12 h-12 flex items-center justify-center">
                                            <div class="absolute inset-0 bg-brand-500 rounded-full opacity-20 animate-radar"></div>
                                            <div class="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-xl glow-brand border border-white/20 z-10 transition-transform hover:scale-110">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h8"/><path d="M4 10h16"/><path d="M4 14h16"/><path d="M19 18H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2Z"/><path d="M7 21v-3"/><path d="M17 21v-3"/></svg>
                                            </div>
                                           </div>`,
                                    iconSize: [48, 48],
                                    iconAnchor: [24, 24]
                                })}
                            >
                                <Popup>
                                    <div className="p-3 min-w-[180px] glass-frosted rounded-2xl border-none">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-lg">
                                                <Bus size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-sm text-gray-900 dark:text-white">Bus #{bus.busNumber}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Live Tracking</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plate Number</p>
                                            <p className="text-xs font-black text-gray-700 dark:text-gray-300">{bus.plateNumber}</p>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">{bus.status}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}

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
