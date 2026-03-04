'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Star, Clock, Info, Heart, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ReportButton from '@/components/ReportButton';
import { useCartStore } from '@/store/cartStore';

function MerchantDetailContent() {
    const router = useRouter();
    const { id } = useParams();

    const [merchant, setMerchant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Use global Zustand cart state
    const {
        items,
        merchantId: cartMerchantId,
        addToCart,
        removeFromCart,
        getCartTotal,
        getCartCount
    } = useCartStore();

    const [promoCode, setPromoCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchMerchantDetails = async () => {
            setIsLoading(true);
            try {
                const { getMerchantDetails } = await import('@/app/actions/merchants');
                const res = await getMerchantDetails(id);
                if (res.success) {
                    setMerchant(res.data);
                } else {
                    toast.error(res.error || 'Failed to load merchant');
                }
            } catch (error) {
                console.error("Failed to load merchant", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchMerchantDetails();
    }, [id]);

    const cartItems = Object.values(items).filter(Boolean);
    const cartTotal = getCartTotal();
    const cartCount = getCartCount();

    const handleCheckout = async () => {
        if (cartCount === 0) return;
        setIsSubmitting(true);
        try {
            const { createOrder } = await import('@/app/actions/orders');

            // Format items natively
            const lineItems = cartItems.map(i => ({
                mealId: i.meal.id,
                quantity: i.quantity,
                variants: [],
                addons: [],
                notes: ''
            }));

            const result = await createOrder('DELIVERY', {
                vendorId: merchant.id
            }, cartTotal, promoCode, lineItems);

            if (result.ok) {
                useCartStore.getState().clearCart();
                router.push(`/activity/tracking/${result.data.order.id}`);
            } else {
                toast.error(result.error?.message || 'Failed to checkout');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('An error occurred during checkout');
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div></div>;
    }

    if (!merchant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-xl font-bold mb-2">Merchant not found</h1>
                <p className="text-gray-500 mb-6">This store might be closed or doesn't exist.</p>
                <button onClick={() => router.back()} className="bg-brand-600 text-white px-6 py-2 rounded-xl font-bold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32">
            {/* Store Cover Header */}
            <div className="relative h-64 md:h-80 w-full bg-gray-900 overflow-hidden">
                {merchant.profileImage ? (
                    <Image src={merchant.profileImage} alt={merchant.name} fill className="object-cover opacity-60" priority />
                ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-brand-600 to-indigo-800 opacity-60"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>

                {/* Navbar Overlay */}
                <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-10">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-colors border border-white/30">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:text-red-400 border border-white/30 transition-colors">
                        <Heart size={20} />
                    </button>
                </div>

                {/* Store Info */}
                <div className="absolute bottom-6 left-6 right-6">
                    <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg mb-3 inline-block">
                        {merchant.tag || 'Restaurant'}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2 drop-shadow-md">{merchant.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200 font-medium">
                        <span className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg border border-yellow-500/30">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 font-bold">4.8</span> <span className="opacity-70">(124+)</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> 20-30 min</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Info size={14} /> Free Delivery</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">

                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Menu</h2>

                {(!merchant.meals || merchant.meals.length === 0) ? (
                    <div className="text-center py-12 bg-white dark:bg-unizy-dark rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                        <span className="text-4xl mb-4 block">🍽️</span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No items available</h3>
                        <p className="text-gray-500">This merchant hasn't published any menu items yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {merchant.meals.map(meal => {
                            const qty = items[meal.id]?.quantity || 0;
                            return (
                                <div key={meal.id} className="bg-white dark:bg-unizy-dark p-4 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm flex gap-4">
                                    {/* Image Holder */}
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shrink-0 relative">
                                        {meal.image ? (
                                            <Image src={meal.image} alt={meal.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">🍲</div>
                                        )}
                                    </div>

                                    {/* Item Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{meal.name}</h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{meal.description}</p>
                                        </div>

                                        <div className="flex justify-between items-end mt-2">
                                            <span className="font-black text-brand-600">{meal.price} <span className="text-[10px] text-gray-400 font-bold uppercase">EGP</span></span>

                                            {qty > 0 ? (
                                                <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/5 rounded-full p-1 border border-gray-200 dark:border-white/10">
                                                    <button onClick={() => removeFromCart(meal.id)} className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white shadow-sm hover:bg-gray-50 transition-colors">
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-bold text-sm min-w-[1ch] text-center">{qty}</span>
                                                    <button onClick={() => addToCart(meal)} className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-sm hover:bg-brand-700 transition-colors">
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => addToCart(meal)} className="bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 dark:text-brand-400 text-xs font-black px-4 py-2 rounded-xl transition-colors">
                                                    Add
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="flex justify-center mt-12 mb-8 border-t border-gray-100 dark:border-white/5 pt-8">
                    <ReportButton type="MERCHANT" targetId={merchant.id} targetUserId={merchant.id} />
                </div>
            </div>

            {/* Sticky Checkout Bar */}
            {cartCount > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/90 dark:bg-unizy-navy/90 backdrop-blur-xl border-t border-gray-100 dark:border-white/5 z-50 rounded-t-3xl md:rounded-none shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] flex justify-center">
                    <div className="max-w-4xl w-full flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center font-black text-gray-900 dark:text-white relative">
                                🛒
                                <div className="absolute -top-2 -right-2 bg-brand-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-unizy-navy">{cartCount}</div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</p>
                                <p className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-none">{cartTotal} <span className="text-[10px] text-gray-400 font-bold">EGP</span></p>
                            </div>
                        </div>

                        <div className="hidden sm:block flex-1 max-w-[150px]">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                placeholder="PROMO CODE"
                                className="w-full bg-gray-100 dark:bg-unizy-dark border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white uppercase tracking-wider text-center"
                            />
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting}
                            className="flex-1 max-w-xs bg-brand-600 hover:bg-brand-700 text-white font-black py-4 px-6 md:px-8 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    Checkout <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs ml-1 group-hover:bg-white/30 transition-colors">→</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MerchantDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div></div>}>
            <MerchantDetailContent />
        </Suspense>
    );
}
