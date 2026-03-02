'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    MessageCircle,
    Search,
    ChevronRight,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle,
    Info,
    HelpCircle,
    FileText,
    Shield
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { getStudentTickets } from '@/app/actions/support';
import toast from 'react-hot-toast';

const FAQ = [
    {
        q: 'How do I track my delivery order?',
        a: 'Go to the Activity section in the bottom navigation to see all active and past orders.'
    },
    {
        q: 'Can I cancel a housing viewing?',
        a: 'Yes, go to your Activity center, select the housing request, and tap "Cancel".'
    },
    {
        q: 'How do I redeem a promo code?',
        a: 'Browse the Deals section, tap on a deal you like, and click "Reveal Code".'
    }
];

export default function SupportDashboard() {
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        setIsLoading(true);
        const res = await getStudentTickets();
        if (res.success) {
            setTickets(res.tickets);
        } else {
            toast.error(res.error || 'Failed to fetch tickets');
        }
        setIsLoading(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'RESOLVED':
            case 'CLOSED':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'IN_PROGRESS':
                return <Clock className="w-4 h-4 text-orange-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32">
            {/* Header */}
            <header className="bg-white dark:bg-unizy-dark pt-12 pb-8 px-6 border-b border-gray-100 dark:border-white/5">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        {isRTL ? 'مركز المساعدة' : 'Help Center'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {isRTL ? 'كيف يمكننا مساعدتك اليوم؟' : 'How can we help you today?'}
                    </p>

                    <div className="mt-8 relative">
                        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} w-5 h-5 text-gray-400`} />
                        <input
                            type="text"
                            placeholder={isRTL ? 'ابحث عن حلول...' : 'Search for solutions...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-gray-900 dark:text-white focus:ring-2 focus:ring-unizy-primary transition-all shadow-sm`}
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Support Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    <Link href="/support/new" className="group bg-unizy-primary p-6 rounded-3xl shadow-xl shadow-unizy-primary/20 hover:scale-[1.02] transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-white/20 p-3 rounded-2xl">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <ChevronRight className={`w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">{isRTL ? 'تذكرة جديدة' : 'Open New Ticket'}</h3>
                        <p className="text-white/70 text-sm">{isRTL ? 'أرسل طلباً لفريق الدعم' : 'Send a request to our support team'}</p>
                    </Link>

                    <Link href="/activity" className="group bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 hover:scale-[1.02] transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl">
                                <Clock className="w-6 h-6 text-blue-500" />
                            </div>
                            <ChevronRight className={`w-5 h-5 text-gray-300 dark:text-white/20 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                        </div>
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">{isRTL ? 'طلباتك الحالية' : 'Recent Orders'}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{isRTL ? 'تحقق من حالة طلباتك' : 'Check the status of your activities'}</p>
                    </Link>

                    <Link href="/support/refunds" className="group bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 hover:scale-[1.02] transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-2xl">
                                <Info className="w-6 h-6 text-rose-500" />
                            </div>
                            <ChevronRight className={`w-5 h-5 text-gray-300 dark:text-white/20 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                        </div>
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">{isRTL ? 'طلبات الاسترجاع' : 'Refund Requests'}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{isRTL ? 'تتبع حالة استرجاعك' : 'Track your refund status'}</p>
                    </Link>
                </div>

                {/* My Tickets Section */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">
                            {isRTL ? 'تذاكري' : 'My Support Tickets'}
                        </h2>
                        <span className="text-xs font-bold text-unizy-primary uppercase tracking-widest">{tickets.length} {isRTL ? 'تذاكر' : 'Tickets'}</span>
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            [1, 2].map(i => (
                                <div key={i} className="h-24 bg-white dark:bg-unizy-dark rounded-3xl animate-pulse border border-gray-100 dark:border-white/5"></div>
                            ))
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    href={`/support/${ticket.id}`}
                                    className="block bg-white dark:bg-unizy-dark p-5 rounded-3xl border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getStatusIcon(ticket.status)}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    {ticket.category}
                                                </span>
                                            </div>
                                            <h4 className="text-gray-900 dark:text-white font-bold truncate">
                                                {ticket.subject}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                                {ticket.description}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-md mb-2 block ${ticket.priority === 'URGENT' ? 'bg-red-50 text-red-500 dark:bg-red-950/20' :
                                                ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-500 dark:bg-orange-950/20' :
                                                    'bg-gray-100 text-gray-500 dark:bg-white/5'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                            <p className="text-[10px] font-bold text-gray-400">
                                                {new Date(ticket.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white dark:bg-unizy-dark rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                                <div className="bg-gray-50 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <HelpCircle className="w-8 h-8 text-gray-300" />
                                </div>
                                <h4 className="text-gray-900 dark:text-white font-bold mb-1">{isRTL ? 'لا توجد تذاكر حالياً' : 'No tickets open'}</h4>
                                <p className="text-gray-500 text-sm">{isRTL ? 'سنقوم بمراجعة طلباتك هنا بمجرد إرسالها' : 'Any support requests you make will appear here'}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* FAQ Section */}
                <section>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">
                        {isRTL ? 'الأسئلة المتكررة' : 'Common Questions'}
                    </h2>
                    <div className="space-y-4">
                        {FAQ.map((item, i) => (
                            <div key={i} className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-unizy-primary/10 text-unizy-primary flex items-center justify-center text-xs">Q</span>
                                    {isRTL ? item.q_ar || item.q : item.q}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pl-8">
                                    {isRTL ? item.a_ar || item.a : item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Other Help Links */}
                <div className="mt-12 grid grid-cols-2 gap-4">
                    <button className="flex flex-col items-center p-6 bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5 gap-3 transition-colors hover:bg-gray-50">
                        <Shield className="w-8 h-8 text-unizy-primary" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{isRTL ? 'الأمان' : 'Safety'}</span>
                    </button>
                    <button className="flex flex-col items-center p-6 bg-white dark:bg-unizy-dark rounded-3xl border border-gray-100 dark:border-white/5 gap-3 transition-colors hover:bg-gray-50">
                        <FileText className="w-8 h-8 text-unizy-primary" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{isRTL ? 'الشروط' : 'Terms'}</span>
                    </button>
                </div>
            </main>
        </div>
    );
}
