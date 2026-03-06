'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft,
    Send,
    MoreVertical,
    User,
    ShieldCheck,
    Clock,
    CheckCircle2,
    XCircle,
    Paperclip
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageProvider';
import { getTicketDetails, sendTicketMessage } from '@/app/actions/support';
import toast from 'react-hot-toast';

export default function TicketDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { language } = useLanguage();
    const isRTL = language === 'ar-EG';

    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchDetails();
        // Setup polling every 10 seconds for real-time-ish chat
        const interval = setInterval(fetchDetails, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages]);

    const fetchDetails = async () => {
        const res = await getTicketDetails(id);
        if (res.success) {
            setTicket(res.ticket);
        } else if (isLoading) {
            toast.error(res.error || 'Failed to fetch ticket');
            router.push('/support');
        }
        setIsLoading(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;

        setIsSending(true);
        const res = await sendTicketMessage({ ticketId: id, content: message, isAdmin: false });

        if (res.success) {
            setMessage('');
            fetchDetails();
        } else {
            toast.error(res.error || 'Failed to send message');
        }
        setIsSending(false);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'RESOLVED':
                return <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full"><CheckCircle2 size={12} /> {isRTL ? 'محلولة' : 'Resolved'}</span>;
            case 'CLOSED':
                return <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full"><XCircle size={12} /> {isRTL ? 'مغلقة' : 'Closed'}</span>;
            case 'IN_PROGRESS':
                return <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full"><Clock size={12} /> {isRTL ? 'قيد المعالجة' : 'In Progress'}</span>;
            default:
                return <span className="flex items-center gap-1 text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full"><Clock size={12} /> {isRTL ? 'مفتوحة' : 'Open'}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-unizy-primary/30 border-t-unizy-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex flex-col h-screen overflow-hidden">
            {/* Header */}
            <div className="bg-white dark:bg-unizy-dark border-b border-gray-100 dark:border-white/5 py-4 px-6 shrink-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            <ChevronLeft className={`w-5 h-5 text-gray-900 dark:text-white ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                        <div>
                            <h1 className="text-lg font-black text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
                                {ticket.subject}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{ticket.category}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="text-[10px] font-bold text-gray-400">#{ticket.id.slice(0, 8)}</span>
                            </div>
                        </div>
                    </div>
                    {getStatusBadge(ticket.status)}
                </div>
            </div>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Initial Description */}
                    <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-unizy-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-unizy-primary" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{ticket.user.name}</h4>
                                <p className="text-[10px] text-gray-400">{new Date(ticket.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                            {ticket.description}
                        </p>
                    </div>

                    {/* Messages */}
                    {ticket.messages.map((msg) => {
                        const isSystem = msg.isAdmin;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isRTL ? (isSystem ? 'flex-row' : 'flex-row-reverse') : (isSystem ? 'flex-row' : 'flex-row-reverse')} gap-3 items-end`}
                            >
                                <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 ${isSystem ? 'bg-indigo-500' : 'bg-gray-200'}`}>
                                    {msg.sender.profileImage ? (
                                        <img src={msg.sender.profileImage} alt={msg.sender.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold">
                                            {isSystem ? <ShieldCheck size={16} /> : msg.sender.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className={`max-w-[80%] rounded-3xl p-4 shadow-sm ${isSystem
                                    ? 'bg-white dark:bg-unizy-dark border border-gray-100 dark:border-white/5 rounded-bl-none'
                                    : 'bg-unizy-primary text-white rounded-br-none'
                                    }`}>
                                    {isSystem && (
                                        <div className="flex items-center gap-1.5 mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                            <ShieldCheck size={12} />
                                            {isRTL ? 'الدعم الفني' : 'Support Agent'}
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed font-medium">
                                        {msg.content}
                                    </p>
                                    <p className={`text-[9px] mt-2 font-bold ${isSystem ? 'text-gray-400' : 'text-white/60'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            {ticket.status !== 'CLOSED' && (
                <div className="bg-white dark:bg-unizy-dark border-t border-gray-100 dark:border-white/5 p-4 md:p-6 shrink-0 z-10">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                            <button type="button" className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-gray-200 transition-colors">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder={isRTL ? 'اكتب ردك هنا...' : 'Type your reply...'}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-3xl py-4 pl-6 pr-14 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-unizy-primary transition-all font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isSending}
                                    className={`absolute top-1/2 -translate-y-1/2 right-2 p-3 rounded-2xl bg-unizy-primary text-white shadow-lg shadow-unizy-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${isRTL ? 'left-2 right-auto rotate-180' : 'right-2'}`}
                                >
                                    {isSending ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
