'use client';

import { useState, useEffect } from 'react';
import {
    generateMFASecret,
    verifyAndEnableMFA,
    getActiveSessions,
    revokeSession,
    revokeOtherSessions
} from '@/app/actions/auth';
import { toast } from 'react-hot-toast';
import {
    ShieldCheck,
    Key,
    Smartphone,
    LogOut,
    Trash2,
    AlertTriangle,
    Clock,
    Monitor
} from 'lucide-react';
import Image from 'next/image';

export default function SecuritySettings() {
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [mfaData, setMfaData] = useState(null); // { secret, qrDataURL }
    const [mfaToken, setMfaToken] = useState('');
    const [showMfaSetup, setShowMfaSetup] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    async function fetchSessions() {
        setLoading(true);
        const res = await getActiveSessions();
        if (res.success) setSessions(res.sessions);
        setLoading(false);
    }

    async function handleSetupMFA() {
        const res = await generateMFASecret();
        if (res.success) {
            setMfaData(res);
            setShowMfaSetup(true);
        } else {
            toast.error(res.error);
        }
    }

    async function handleVerifyMFA() {
        if (!mfaToken) return;
        const res = await verifyAndEnableMFA(mfaData.secret, mfaToken);
        if (res.success) {
            toast.success('MFA Enabled successfully!');
            setShowMfaSetup(false);
            setMfaData(null);
            setMfaToken('');
        } else {
            toast.error(res.error);
        }
    }

    async function handleRevoke(id) {
        const res = await revokeSession(id);
        if (res.success) {
            toast.success('Session revoked');
            fetchSessions();
        } else {
            toast.error(res.error);
        }
    }

    const formatDate = (date) => new Date(date).toLocaleString();

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col gap-2 border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Identity & Security
                </h1>
                <p className="text-zinc-400">Manage your account protection and active sessions.</p>
            </header>

            {/* MFA Section */}
            <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl transition hover:border-blue-500/30">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Multi-Factor Authentication</h2>
                        <p className="text-sm text-zinc-400">Add an extra layer of security to your account.</p>
                    </div>
                </div>

                {!showMfaSetup ? (
                    <button
                        onClick={handleSetupMFA}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium flex items-center gap-2"
                    >
                        <Smartphone className="w-4 h-4" />
                        Enable MFA
                    </button>
                ) : (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col md:flex-row gap-8 items-center bg-zinc-800/40 p-6 rounded-2xl border border-white/5">
                            <div className="bg-white p-2 rounded-xl">
                                <Image
                                    src={mfaData.qrDataURL}
                                    alt="MFA QR Code"
                                    width={180}
                                    height={180}
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="space-y-4 max-w-sm">
                                <p className="text-sm text-zinc-300">
                                    1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc).
                                </p>
                                <p className="text-sm text-zinc-300">
                                    2. Enter the 6-digit code from your app below.
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        value={mfaToken}
                                        onChange={(e) => setMfaToken(e.target.value)}
                                        placeholder="000000"
                                        className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-[0.5em] font-mono text-xl"
                                        maxLength={6}
                                    />
                                    <button
                                        onClick={handleVerifyMFA}
                                        className="bg-white text-zinc-950 px-6 py-2 rounded-xl font-semibold hover:bg-zinc-200 transition"
                                    >
                                        Verify
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowMfaSetup(false)}
                                    className="text-xs text-zinc-500 hover:text-zinc-300 underline"
                                >
                                    Cancel Setup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Sessions Section */}
            <section className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <Monitor className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Active Sessions</h2>
                            <p className="text-sm text-zinc-400">Devices currently logged into your account.</p>
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            if (confirm('Log out of all other devices?')) {
                                await revokeOtherSessions();
                                fetchSessions();
                            }
                        }}
                        className="text-sm text-zinc-400 hover:text-red-400 transition flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out other devices
                    </button>
                </div>

                <div className="grid gap-4">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 border border-dashed border-white/5 rounded-2xl">
                            No active sessions found.
                        </div>
                    ) : (
                        sessions.map((session) => (
                            <div key={session.id} className="group flex items-center justify-between p-4 bg-zinc-800/20 hover:bg-zinc-800/40 rounded-xl border border-white/5 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
                                        {session.userAgent?.includes('Mobile') ? (
                                            <Smartphone className="w-5 h-5 text-zinc-500" />
                                        ) : (
                                            <Monitor className="w-5 h-5 text-zinc-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm truncate max-w-[200px] md:max-w-xs">
                                            {session.userAgent || 'Unknown Device'}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Key className="w-3 h-3" /> {session.ipAddress}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatDate(session.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRevoke(session.id)}
                                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition text-zinc-500"
                                    title="Revoke session"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* DANGER ZONE */}
            <section className="border border-red-500/20 rounded-2xl p-6 bg-red-950/5">
                <div className="flex items-center gap-4 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-semibold text-red-500">Security Best Practices</h2>
                </div>
                <ul className="text-sm text-zinc-400 space-y-2 list-disc pl-5">
                    <li>Never share your MFA secret or recovery codes.</li>
                    <li>UniZy will never ask for your password via email or chat.</li>
                    <li>Update your password regularly (every 90 days recommended).</li>
                </ul>
            </section>
        </div>
    );
}
