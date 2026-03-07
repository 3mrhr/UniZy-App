'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ChevronLeft, Plus, Bus, MapPin, Save, Trash2, RefreshCcw } from 'lucide-react';
import { getShuttleBuses, adminUpdateShuttleLocation, adminCreateShuttle, adminDeleteShuttle } from '@/app/actions/transport';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const DraggableMarker = dynamic(() => import('react-leaflet').then(mod => {
    // We'll define a custom draggable marker component here
    return function DraggableMarker({ position, onDragEnd, children }) {
        const [pos, setPos] = useState(position);
        return (
            <mod.Marker
                draggable={true}
                eventHandlers={{
                    dragend: (e) => {
                        const marker = e.target;
                        const newPos = marker.getLatLng();
                        setPos([newPos.lat, newPos.lng]);
                        onDragEnd([newPos.lat, newPos.lng]);
                    }
                }}
                position={pos}
            >
                {children}
            </mod.Marker>
        );
    };
}), { ssr: false });

export default function AdminShuttlePage() {
    const [buses, setBuses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newBus, setNewBus] = useState({ busNumber: '', plateNumber: '', lat: 27.185, lng: 31.171 });
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        const res = await getShuttleBuses();
        if (res.success) setBuses(res.data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
        // Fix icons
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
    }, []);

    const handleUpdateLocation = async (id, newPos) => {
        const res = await adminUpdateShuttleLocation(id, newPos[0], newPos[1]);
        if (res.success) {
            toast.success('Bus location updated!');
            fetchData();
        } else {
            toast.error(res.error || 'Update failed');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await adminCreateShuttle(newBus);
        if (res.success) {
            toast.success('New bus added!');
            setNewBus({ busNumber: '', plateNumber: '', lat: 27.185, lng: 31.171 });
            fetchData();
        } else {
            toast.error(res.error || 'Creation failed');
        }
        setIsSaving(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to remove this bus?')) return;
        const res = await adminDeleteShuttle(id);
        if (res.success) {
            toast.success('Bus removed');
            fetchData();
        } else {
            toast.error(res.error || 'Delete failed');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-unizy-navy overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 bg-white dark:bg-unizy-dark border-b border-gray-100 dark:border-white/5 flex items-center justify-between z-[1000]">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                        <ChevronLeft size={20} className="text-gray-900 dark:text-white" />
                    </Link>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white">Shuttle Fleet Manager</h1>
                </div>
                <button onClick={fetchData} className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 transition-all">
                    <RefreshCcw size={20} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </header>

            <div className="flex-1 flex flex-col md:flex-row h-full">
                {/* Control Panel */}
                <aside className="w-full md:w-96 bg-white dark:bg-unizy-dark border-r border-gray-100 dark:border-white/5 overflow-y-auto p-6 space-y-8 h-full">
                    {/* Add New Bus */}
                    <section>
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Add New Shuttle</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Bus Number (e.g. 104)"
                                required
                                value={newBus.busNumber}
                                onChange={e => setNewBus({ ...newBus, busNumber: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-unizy-navy border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Plate Number"
                                required
                                value={newBus.plateNumber}
                                onChange={e => setNewBus({ ...newBus, plateNumber: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-unizy-navy border-2 border-transparent focus:border-brand-500 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all"
                            />
                            <button type="submit" disabled={isSaving} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                                <Plus size={18} /> Add to Fleet
                            </button>
                        </form>
                    </section>

                    {/* Fleet List */}
                    <section>
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Active Fleet ({buses.length})</h2>
                        <div className="space-y-3">
                            {buses.map(bus => (
                                <div key={bus.id} className="bg-gray-50 dark:bg-white/5 p-5 rounded-3xl border border-gray-100 dark:border-transparent group hover:border-brand-500 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black">
                                                {bus.busNumber}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black dark:text-white">{bus.plateNumber}</p>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Live Tracking Active</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(bus.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                                        <MapPin size={12} /> {bus.lat.toFixed(4)}, {bus.lng.toFixed(4)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </aside>

                {/* Map Interface */}
                <main className="flex-1 relative">
                    <div className="absolute top-6 left-6 z-[1000] bg-white/90 dark:bg-unizy-navy/90 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-xl max-w-xs">
                        <p className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-2">
                            <Info size={14} className="text-brand-500" /> Dispatch Instructions
                        </p>
                        <p className="text-[10px] font-medium text-gray-500 mt-2 leading-relaxed">
                            Drag the bus markers on the map to manually set their stationary positions. Locations update for students in real-time.
                        </p>
                    </div>

                    {typeof window !== 'undefined' && (
                        <MapContainer center={[27.185, 31.171]} zoom={14} className="h-full w-full">
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {buses.map(bus => (
                                <DraggableMarker
                                    key={bus.id}
                                    position={[bus.lat, bus.lng]}
                                    onDragEnd={(newPos) => handleUpdateLocation(bus.id, newPos)}
                                >
                                    <Marker position={[bus.lat, bus.lng]}> {/* Fallback for visibility */}
                                        <Popup>
                                            <div className="text-center font-black">
                                                Bus #{bus.busNumber}
                                            </div>
                                        </Popup>
                                    </Marker>
                                </DraggableMarker>
                            ))}
                        </MapContainer>
                    )}
                </main>
            </div>
        </div>
    );
}
