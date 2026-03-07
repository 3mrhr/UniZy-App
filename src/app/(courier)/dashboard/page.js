'use client';

import { useState, useEffect } from 'react';
import {
    getAvailableCustomRequests,
    acceptCustomDelivery,
    setCustomItemPrice,
    getCourierActiveTasks,
    completeCustomDelivery
} from '@/app/actions/delivery';
import { getAvailableOrders, acceptOrder, updateOrderStatus } from '@/app/actions/orders';
import { Package, Bike, Clock, MapPin, CheckCircle, XCircle, DollarSign, Zap, Power, ChevronRight, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourierDashboard() {
    const [isOnline, setIsOnline] = useState(false);
    const [activeTab, setActiveTab] = useState('available'); // 'available', 'active'
    const [customTasks, setCustomTasks] = useState([]);
    const [merchantTasks, setMerchantTasks] = useState([]);
    const [activeTasks, setActiveTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [priceInput, setPriceInput] = useState('');
    const [otpInput, setOtpInput] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        const [availCustom, availMerchant, activeRes] = await Promise.all([
            getAvailableCustomRequests(),
            getAvailableOrders('READY'),
            getCourierActiveTasks()
        ]);

        // Let's use a simpler approach for now to keep it server-action friendly
        setCustomTasks(availCustom.data || []);
        setMerchantTasks(availMerchant.data || []);
        setActiveTasks(activeRes.data || []);
        setIsLoading(false);
    };

    // Need a real action for current courier active tasks
    useEffect(() => {
        if (isOnline) {
            fetchData();
            const interval = setInterval(fetchData, 10000);
            return () => clearInterval(interval);
        }
    }, [isOnline]);

    const handleConfirmPrice = async (taskId) => {
        if (!priceInput) return toast.error('Enter Price');
        const res = await setCustomItemPrice(taskId, priceInput);
        if (res.success) {
            toast.success('Price Confirmed!');
            fetchData();
            setPriceInput('');
        }
    };

    const handleVerifyCompletion = async (taskId, type) => {
        if (!otpInput) return toast.error('Enter Verification Code');

        let res;
        if (type === 'custom') {
            res = await completeCustomDelivery(taskId, otpInput);
        } else {
            res = await updateOrderStatus(taskId, 'DELIVERED', otpInput);
        }

        if (res.success) {
            toast.success('Delivery Completed & Wallet Credited! 💰');
            setOtpInput('');
            fetchData();
        } else {
            toast.error(res.error || 'Verification failed');
        }
    };

    const handleAccept = async (id, type) => {
        const res = type === 'custom' ? await acceptCustomDelivery(id) : await acceptOrder(id);
        if (res.success) {
            toast.success('Task Accepted! 🛵');
            fetchData();
        } else {
            toast.error(res.error || 'Failed to accept task');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32">

            {/* Courier Status Header */}
            <div className="bg-white dark:bg-unizy-dark px-6 py-10 shadow-sm border-b border-gray-100 dark:border-white/5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Courier <span className="text-brand-600">Mode</span></h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 italic">UniZy Logistics Engine</p>
                    </div>

                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all ${isOnline ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-unizy-navy dark:text-gray-400'}`}
                    >
                        <Power size={18} className={isOnline ? 'animate-pulse' : ''} />
                        {isOnline ? 'Online' : 'Go Online'}
                    </button>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 mt-10">

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { label: 'Today', value: '12', icon: <Package size={16} />, color: 'brand' },
                        { label: 'Earned', value: '450 EGP', icon: <DollarSign size={16} />, color: 'emerald' },
                        { label: 'Rating', value: '4.9', icon: <Star size={16} />, color: 'yellow' }
                    ].map(stat => (
                        <div key={stat.label} className="bg-white dark:bg-unizy-dark p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className={`w-8 h-8 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 flex items-center justify-center text-${stat.color}-600 mb-3`}>
                                {stat.icon}
                            </div>
                            <div className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {!isOnline ? (
                    <div className="bg-white dark:bg-unizy-dark rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 dark:border-white/5">
                        <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-unizy-navy flex items-center justify-center text-5xl mx-auto mb-8 opacity-50 grayscale">🛵</div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">You are currently Offline</h2>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto">Toggle the switch above to start receiving delivery requests on campus.</p>
                    </div>
                ) : (
                    <>
                        {/* Tabs */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={() => setActiveTab('available')}
                                className={`px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'available' ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/20' : 'bg-white dark:bg-unizy-dark text-gray-400 border border-gray-100 dark:border-white/5'}`}
                            >
                                Available ({customTasks.length + merchantTasks.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/20' : 'bg-white dark:bg-unizy-dark text-gray-400 border border-gray-100 dark:border-white/5'}`}
                            >
                                In Progress ({activeTasks.length})
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="py-20 flex justify-center"><div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div></div>
                        ) : activeTab === 'available' ? (
                            <div className="space-y-6">
                                {/* Custom Tasks (Order Anything) */}
                                {customTasks.map(task => (
                                    <div key={task.id} className="group bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center text-orange-600">
                                                    <Package size={28} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">Custom Order</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">#{task.id.slice(0, 8)}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{task.itemDescription}</h3>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-gray-900 dark:text-white">Est. 50 EGP</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Fee</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-50 dark:border-white/5 my-6">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-unizy-navy flex items-center justify-center text-gray-400"><MapPin size={16} /></div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup</div>
                                                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300">{task.pickupLocation || 'Ask Student'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600"><CheckCircle size={16} /></div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dropoff</div>
                                                    <div className="text-sm font-bold text-gray-700 dark:text-gray-300">{task.dropoffLocation}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden border-2 border-white dark:border-unizy-dark shadow-sm" />
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 dark:text-white">{task.user?.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{task.user?.university}</div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleAccept(task.id, 'custom')}
                                                className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-600/20 active:scale-95 transition-all"
                                            >
                                                Accept Task
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {merchantTasks.map(task => (
                                    <div key={task.id} className="group bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600">
                                                    <Package size={28} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">Merchant Order</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">#{task.id.slice(0, 8)}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">{task.merchant?.name}</h3>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-gray-900 dark:text-white">35 EGP</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Payout</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAccept(task.id, 'merchant')}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
                                        >
                                            Pick Up Order
                                        </button>
                                    </div>
                                ))}

                                {customTasks.length === 0 && merchantTasks.length === 0 && (
                                    <div className="py-20 text-center opacity-30 italic">Searching for campus requests...</div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {activeTasks.map(task => (
                                    <div key={task.id} className="bg-white dark:bg-unizy-dark rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-2xl">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white">{task.itemDescription || task.merchant?.name}</h3>
                                            <span className="px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">{task.status}</span>
                                        </div>

                                        {task.itemDescription && !task.actualCost && (
                                            <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-2xl mb-6">
                                                <p className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-4">Input actual item cost to continue:</p>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="number"
                                                        placeholder="0.00 EGP"
                                                        className="flex-1 bg-white dark:bg-unizy-navy border-2 border-orange-200 dark:border-orange-500/20 rounded-xl px-4 py-3 outline-none font-bold"
                                                        onChange={(e) => setPriceInput(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={() => handleConfirmPrice(task.id)}
                                                        className="bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase"
                                                    >
                                                        Confirm
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl mb-6">
                                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-4">Verification Code (from Student):</p>
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="000000"
                                                    maxLength={6}
                                                    className="flex-1 bg-white dark:bg-unizy-navy border-2 border-emerald-200 dark:border-emerald-500/20 rounded-xl px-4 py-3 outline-none font-bold text-center tracking-widest"
                                                    onChange={(e) => setOtpInput(e.target.value)}
                                                />
                                                <button
                                                    onClick={() => handleVerifyCompletion(task.id, task.itemDescription ? 'custom' : 'merchant')}
                                                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase"
                                                >
                                                    Verify & Complete
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button className="flex-1 bg-gray-100 dark:bg-white/5 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                                                <MessageCircle size={14} /> Contact
                                            </button>
                                            <button className="flex-1 bg-brand-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest opacity-50 cursor-not-allowed">
                                                Code Required
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {activeTasks.length === 0 && (
                                    <div className="py-20 text-center opacity-30 italic">No tasks in progress.</div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

function Star({ size, className }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
}
