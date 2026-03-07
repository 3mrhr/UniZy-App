'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, Bus, MapPin, Navigation, Info, Clock } from 'lucide-react';
import { getShuttleBuses, getShuttleStations } from '@/app/actions/transport';
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
            <header className="fixed top-0 left-0 right-0 z-[1000] px-6 py-6 bg-white/80 dark:bg-unizy-navy/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 flex items-center gap-4">
                <Link href="/transport" className="w-10 h-10 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <ChevronLeft size={20} className="text-gray-900 dark:text-white" />
                </Link>
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white leading-none">Live Shuttle Map</h1>
                    <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mt-1">Campus Fleet Status</p>
                </div>
            </header>

            {/* Map Area */}
            <div className="flex-1 mt-20 relative">
                {typeof window !== 'undefined' && (
                    <MapContainer center={userLoc} zoom={15} className="h-full w-full">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {/* User Location Marker */}
                        <Marker position={userLoc}>
                            <Popup>Your current area</Popup>
                        </Marker>

                        {/* Bus Markers */}
                        {buses.map(bus => (
                            <Marker key={bus.id} position={[bus.lat, bus.lng]}>
                                <Popup>
                                    <div className="p-2 min-w-[150px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600">
                                                <Bus size={16} />
                                            </div>
                                            <h4 className="font-black text-sm text-gray-900">Bus #{bus.busNumber}</h4>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plate Number</p>
                                            <p className="text-xs font-black text-gray-700">{bus.plateNumber}</p>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">{bus.status}</span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}

                {/* Info Panel Overlay */}
                <div className="absolute bottom-8 left-6 right-6 z-[1000] space-y-4">
                    {nearestBus && (
                        <div className="bg-white dark:bg-unizy-dark p-6 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 animate-fade-in-up">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-xl shadow-brand-600/20">
                                        <Navigation size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white">Nearest Bus Found</h3>
                                        <p className="text-xs font-bold text-gray-400">Located {nearestBus.distance.toFixed(2)} km away</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    Live Info
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-transparent">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Bus size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bus Details</span>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">Bus #{nearestBus.busNumber} ({nearestBus.plateNumber})</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-transparent">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">{nearestBus.status}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
