"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { Home, Car, Package, Ticket, ChevronRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const TABS = [
    { id: 'all', en: 'All Activity', ar: 'كل النشاطات' },
    { id: 'housing', en: 'Housing', ar: 'السكن', icon: Home },
    { id: 'transport', en: 'Rides', ar: 'المشاوير', icon: Car },
    { id: 'delivery', en: 'Orders', ar: 'الطلبات', icon: Package },
];

const MOCK_ACTIVITIES = [
    {
        id: 'act1',
        category: 'delivery',
        title: 'Food Order - Burger Bros',
        arTitle: 'طلب طعام - برجر بروز',
        status: 'in_progress',
        statusEn: 'Preparing',
        statusAr: 'جاري التجهيز',
        date: 'Today, 2:30 PM',
        arDate: 'اليوم، 2:30 م',
        price: '150 EGP',
        icon: Package,
        color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
    },
    {
        id: 'act2',
        category: 'transport',
        title: 'Ride to University Campus',
        arTitle: 'مشوار إلى الحرم الجامعي',
        status: 'completed',
        statusEn: 'Completed',
        statusAr: 'مكتمل',
        date: 'Yesterday, 8:15 AM',
        arDate: 'أمس، 8:15 ص',
        price: '45 EGP',
        icon: Car,
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
    },
    {
        id: 'act3',
        category: 'housing',
        title: 'Viewing Request - 3BR Dorm',
        arTitle: 'طلب معاينة - سكن 3 غرف',
        status: 'pending',
        statusEn: 'Pending Approval',
        statusAr: 'قيد الموافقة',
        date: 'Oct 20, 10:00 AM',
        arDate: '20 أكتوبر، 10:00 ص',
        price: 'Free',
        icon: Home,
        color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'
    }
];

export default function ActivityPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [activeTab, setActiveTab] = useState('all');
    const [realActivities, setRealActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [reviewingOrder, setReviewingOrder] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleSubmitReview = async () => {
        setIsSubmittingReview(true);
        const { createReview } = await import('@/app/actions/reviews');
        const result = await createReview({
            rating,
            comment,
            orderId: reviewingOrder.id
        });
        setIsSubmittingReview(false);
        if (result.success) {
            alert('Review submitted successfully!');
            setReviewingOrder(null);
            setRating(5);
            setComment('');
        } else {
            alert(result.error || 'Failed to submit review');
        }
    };

    React.useEffect(() => {
        async function fetchOrders() {
            try {
                const { getStudentOrders } = await import('@/app/actions/orders');
                const orders = await getStudentOrders();
                if (orders && orders.length > 0) {
                    const formatted = orders.map(order => {
                        const isTransport = order.service === 'TRANSPORT';
                        let title = isTransport ? 'Ride Request' : 'Delivery Order';
                        let arTitle = isTransport ? 'طلب مشوار' : 'طلب توصيل';
                        try {
                            const details = JSON.parse(order.details);
                            if (isTransport && details.destination) title += ` - To ${details.destination}`;
                            if (!isTransport && details.vendor) title += ` - ${details.vendor}`;
                        } catch (e) { }

                        return {
                            id: order.id,
                            category: isTransport ? 'transport' : 'delivery',
                            title,
                            arTitle,
                            status: order.status.toLowerCase(),
                            statusEn: order.status,
                            statusAr: order.status,
                            date: new Date(order.createdAt).toLocaleDateString() + ' ' + new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            arDate: new Date(order.createdAt).toLocaleDateString() + ' ' + new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            price: `${order.total} EGP`,
                            icon: isTransport ? Car : Package,
                            color: isTransport ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                        };
                    });
                    setRealActivities(formatted);
                }
            } catch (error) {
                console.error('Error fetching real orders', error);
            }
            setIsLoading(false);
        }
        fetchOrders();
    }, []);

    const allActivities = [...realActivities, ...MOCK_ACTIVITIES];
    const filteredActivities = activeTab === 'all'
        ? allActivities
        : allActivities.filter(a => a.category === activeTab);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'in_progress': return <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse mx-1" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
            default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <>
            <main className="min-h-screen pb-24 bg-[var(--unizy-bg-light)] dark:bg-[var(--unizy-bg-dark)] px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pt-6 transition-colors duration-300">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--unizy-text-dark)] dark:text-white mb-2">
                        {isRTL ? 'الطلبات والنشاط' : 'Activity Center'}
                    </h1>
                    <p className="text-[var(--unizy-text-muted)] dark:text-gray-400">
                        {isRTL ? 'تابع جميع طلباتك وحجوزاتك في مكان واحد.' : 'Track all your orders and bookings in one place.'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeTab === tab.id
                                ? 'bg-[var(--unizy-primary)] border-[var(--unizy-primary)] text-white shadow-md'
                                : 'bg-white dark:bg-[#1E293B] border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                        >
                            {tab.icon && <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'opacity-100' : 'opacity-70'}`} />}
                            {isRTL ? tab.ar : tab.en}
                        </button>
                    ))}
                </div>

                {/* Activity List */}
                <div className="space-y-4">
                    {filteredActivities.map((activity) => (
                        <div key={activity.id} className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer">

                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${activity.color}`}>
                                    <activity.icon className="w-6 h-6" />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-[var(--unizy-text-dark)] dark:text-white text-sm sm:text-base">
                                            {isRTL ? activity.arTitle : activity.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs sm:text-sm">
                                        <span className="flex items-center gap-1 font-medium px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                                            {getStatusIcon(activity.status)}
                                            {isRTL ? activity.statusAr : activity.statusEn}
                                        </span>
                                        <span className="text-gray-400 font-medium">
                                            {isRTL ? activity.arDate : activity.date}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="font-bold text-[var(--unizy-text-dark)] dark:text-white hidden sm:block">
                                    {activity.price}
                                </span>
                                {activity.status === 'completed' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setReviewingOrder(activity); }}
                                        className="text-xs bg-brand-50 text-brand-600 px-3 py-1.5 rounded-lg border border-brand-100 hover:bg-brand-100 font-bold transition-colors dark:bg-brand-900/20 dark:border-brand-900/30 dark:text-brand-400">
                                        Review
                                    </button>
                                )}
                                <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-[var(--unizy-primary)] transition-colors ${isRTL ? 'rotate-180' : ''}`} />
                            </div>

                        </div>
                    ))}

                    {filteredActivities.length === 0 && (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 border-dashed">
                            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{isRTL ? 'لا يوجد نشاط لعرضه في هذا القسم.' : 'No activity to show in this section yet.'}</p>
                        </div>
                    )}
                </div>

            </main>

            {
                reviewingOrder && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Leave a Review</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">How was your experience with {reviewingOrder.title}?</p>

                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`text-4xl transition-transform ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200 dark:text-gray-700'}`}>
                                        ★
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write your feedback..."
                                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none mb-6 min-h-[100px] text-gray-900 dark:text-white"
                            ></textarea>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setReviewingOrder(null)}
                                    className="flex-1 py-3.5 rounded-2xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={isSubmittingReview}
                                    className="flex-1 py-3.5 rounded-2xl font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-50">
                                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
