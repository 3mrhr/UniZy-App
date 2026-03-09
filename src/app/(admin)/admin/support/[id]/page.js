'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ChevronLeft,
    Send,
    User,
    Mail,
    Phone,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    Shield,
    MoreVertical,
    Paperclip,
    AlertTriangle,
    Flag,
    RefreshCw
} from 'lucide-react';
import { getTicketDetails, sendTicketMessage, updateTicketStatus, claimTicket } from '@/app/actions/support';
import toast from 'react-hot-toast';

export default function AdminTicketDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [ticket, setTicket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchDetails();
        const interval = setInterval(fetchDetails, 10000);
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [ticket?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchDetails = async () => {
        const res = await getTicketDetails(id);
        if (res.success) {
            setTicket(res.ticket);
        } else if (isLoading) {
            toast.error(res.error || 'Failed to fetch ticket');
            router.push('/admin/support');
        }
        setIsLoading(false);
    };

    const [isInternal, setIsInternal] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isSending) return;

        setIsSending(true);
        const res = await sendTicketMessage({
            ticketId: id,
            content: message,
            isAdmin: true,
            isInternal: isInternal
        });

        if (res.success) {
            setMessage('');
            setIsInternal(false);
            fetchDetails();
        } else {
            toast.error(res.error || 'Failed to send message');
        }
        setIsSending(false);
    };

    const handleStatusUpdate = async (status) => {
        setIsUpdatingStatus(true);
        const res = await updateTicketStatus(id, status);
        if (res.success) {
            toast.success(`Status updated to ${status}`);
            fetchDetails();
        } else {
            toast.error(res.error || 'Failed to update status');
        }
        setIsUpdatingStatus(false);
    };

    const handleClaim = async () => {
        const res = await claimTicket(id);
        if (res.success) {
            toast.success('Ticket claimed');
            fetchDetails();
        } else {
            toast.error(res.error || 'Failed to claim');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex flex-col items-center justify-center font-bold text-gray-400 dark:text-gray-500 gap-4">
                <RefreshCw className="w-12 h-12 animate-spin text-unizy-primary" />
                <p className="text-xl animate-pulse">Synchronizing Ticket Data...</p>
            </div>
        );
    }

    if (!ticket) return null;

    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex flex-col h-screen overflow-hidden">
            {/* Admin Header */}
            <header className="bg-white dark:bg-unizy-dark border-b border-gray-100 dark:border-white/5 py-4 px-8 shrink-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/admin/support')} className="p-2 rounded-xl bg-gray-100 dark:bg-unizy-navy hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-black text-gray-900 dark:text-white">{ticket.subject}</h1>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded shadow-sm ${ticket.priority === 'URGENT' ? 'bg-red-500 text-white' :
                                    ticket.priority === 'HIGH' ? 'bg-orange-500 text-white' :
                                        'bg-gray-200 text-gray-600'
                                    }`}>{ticket.priority}</span>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Ticket ID: {ticket.id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {!ticket.assignedAgent && (
                            <button onClick={handleClaim} className="bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-black shadow-lg shadow-indigo-500/20 transition-all">
                                Claim Ticket
                            </button>
                        )}
                        <select
                            value={ticket.status}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            disabled={isUpdatingStatus}
                            className="bg-gray-50 dark:bg-unizy-navy border border-gray-100 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-black text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-unizy-primary outline-none"
                        >
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Content (Chat) */}
                <main className="flex-1 flex flex-col bg-white dark:bg-unizy-dark overflow-hidden border-r border-gray-100 dark:border-white/5">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Initial Description */}
                        <div className="bg-gray-50 dark:bg-unizy-navy/50 p-6 rounded-3xl mb-10 border border-gray-100 dark:border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-unizy-primary/30" />
                            <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-unizy-primary">
                                <Flag size={14} /> Initial Complaint
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
                                {ticket.description}
                            </p>
                        </div>

                        {/* Messages */}
                        {ticket.messages.map((msg) => {
                            const fromStaff = msg.isAdmin;
                            const isInternalMsg = msg.isInternal;
                            return (
                                <div key={msg.id} className={`flex ${fromStaff ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-3xl p-5 shadow-sm relative ${isInternalMsg
                                        ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 rounded-br-none'
                                        : fromStaff
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-gray-100 dark:bg-unizy-navy text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-white/5'
                                        }`}>
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                                {fromStaff ? (isInternalMsg ? 'Agent Note (Private)' : 'You (Support)') : ticket.user.name}
                                            </span>
                                            {isInternalMsg && <Shield size={12} className="text-amber-500" />}
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                                        <p className={`text-[10px] mt-2 opacity-60 font-bold`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Admin Input Area */}
                    <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-unizy-dark">
                        <form onSubmit={handleSendMessage} className="space-y-4">
                            <div className="flex items-center gap-6 px-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ${isInternal ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-200 ${isInternal ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={isInternal}
                                        onChange={() => setIsInternal(!isInternal)}
                                    />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isInternal ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                        {isInternal ? 'Internal Note (Hidden from Student)' : 'Public (visible to Student)'}
                                    </span>
                                </label>
                                <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
                                <button type="button" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-unizy-primary transition-colors flex items-center gap-1">
                                    <Paperclip size={12} /> Attach Assets
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="text"
                                    placeholder={isInternal ? "Type a private note for other agents..." : "Type your response to the student..."}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className={`flex-1 border-none rounded-2xl py-4 px-6 text-sm font-medium focus:ring-2 transition-all ${isInternal
                                        ? 'bg-amber-50 dark:bg-amber-900/10 placeholder:text-amber-700/40 text-amber-900 dark:text-amber-100 focus:ring-amber-500'
                                        : 'bg-gray-50 dark:bg-unizy-navy placeholder:text-gray-400 dark:text-white focus:ring-unizy-primary'
                                        }`}
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || isSending}
                                    className={`p-4 rounded-2xl shadow-lg transition-all disabled:opacity-50 hover:scale-105 active:scale-95 ${isInternal
                                        ? 'bg-amber-600 shadow-amber-600/20'
                                        : 'bg-unizy-primary shadow-unizy-primary/20'
                                        } text-white`}
                                >
                                    {isSending ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : <Send size={20} />}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>

                {/* Sidebar (User Info) */}
                <aside className="w-80 bg-gray-50 dark:bg-unizy-dark p-8 overflow-y-auto hidden lg:block">
                    <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">Requester Profile</h3>

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-unizy-primary mb-4 border-4 border-white shadow-sm overflow-hidden">
                            {ticket.user.profileImage ? (
                                <img src={ticket.user.profileImage} alt={ticket.user.name} className="w-full h-full object-cover" />
                            ) : <User size={32} />}
                        </div>
                        <h4 className="font-black text-gray-900 dark:text-white text-center">{ticket.user.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">Standard Student</p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-unizy-navy p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-2">Contact Details</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                                    <Mail size={14} className="text-gray-400" />
                                    <span className="truncate">{ticket.user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                                    <Phone size={14} className="text-gray-400" />
                                    <span>+20 123 456 789</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                                    <Calendar size={14} className="text-gray-400" />
                                    <span>Joined {new Date(ticket.user.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={14} className="text-orange-500" />
                                <span className="text-[10px] font-black text-orange-600 uppercase">Warning</span>
                            </div>
                            <p className="text-[10px] text-orange-700 font-bold leading-relaxed">
                                This user has 2 open tickets. Please consolidate communication if they are related.
                            </p>
                        </div>

                        <button className="w-full py-4 text-xs font-black text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest border border-dashed border-gray-300 dark:border-white/10 rounded-2xl">
                            Ban User Account
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
