'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <main className="min-h-screen bg-white dark:bg-unizy-navy py-16 px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-brand-600 font-bold text-sm mb-8 inline-block hover:underline">← Back to Home</Link>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-4">Contact Us</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-12">Have a question, partnership inquiry, or need help? Reach out below.</p>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 shrink-0">
                                <Mail size={22} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white">Email</h3>
                                <p className="text-gray-500 text-sm font-medium">hello@unizy.app</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 shrink-0">
                                <Phone size={22} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white">Phone</h3>
                                <p className="text-gray-500 text-sm font-medium">+20 100 123 4567</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 shrink-0">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white">Office</h3>
                                <p className="text-gray-500 text-sm font-medium">Assiut University Campus, Egypt</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    {sent ? (
                        <div className="bg-green-50 dark:bg-green-900/10 rounded-3xl p-8 text-center border border-green-100 dark:border-green-900/20">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto flex items-center justify-center text-green-500 mb-4">
                                <Send size={28} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                            <p className="text-gray-500 text-sm font-medium">We'll get back to you within 24 hours.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Your Name" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-unizy-dark rounded-2xl border-2 border-transparent focus:border-brand-500 outline-none font-bold text-gray-900 dark:text-white" />
                            <input type="email" placeholder="Email Address" required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-unizy-dark rounded-2xl border-2 border-transparent focus:border-brand-500 outline-none font-bold text-gray-900 dark:text-white" />
                            <textarea placeholder="Your Message" rows={4} required className="w-full px-5 py-3.5 bg-gray-50 dark:bg-unizy-dark rounded-2xl border-2 border-transparent focus:border-brand-500 outline-none font-bold text-gray-900 dark:text-white resize-none" />
                            <button type="submit" className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Send size={18} /> Send Message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
