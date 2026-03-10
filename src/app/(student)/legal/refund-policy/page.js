import Link from 'next/link';
import { ArrowLeft, RefreshCcw, CheckCircle } from 'lucide-react';
import MobileHeader from '@/components/MobileHeader';

export default function RefundPolicyPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32 transition-colors">
            <MobileHeader />
            {/* Header */}
            <div className="bg-gradient-to-br from-brand-600 to-indigo-700 px-6 pt-12 pb-20 relative overflow-hidden">
                <div className="max-w-3xl mx-auto relative z-10">
                    <Link href="/account" className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-bold mb-6 transition-all group w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Account
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <RefreshCcw className="text-white w-8 h-8" />
                        <h1 className="text-3xl font-black text-white">Refund Policy</h1>
                    </div>
                    <p className="text-indigo-100 font-medium opacity-90">Last updated: March 2026</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-10">
                <div className="bg-white dark:bg-unizy-dark rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-white/5 space-y-8 text-gray-700 dark:text-gray-300">

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center text-sm">1</span>
                            General Overview
                        </h2>
                        <p className="leading-relaxed">
                            At UniZy, we strive to ensure that all services and transactions meet your expectations. Because UniZy acts as a marketplace connecting students with providers (merchants, drivers, peer helpers), our refund policy is designed to be fair to both parties. All refund requests must be submitted through the UniZy Support Center within 24 hours of the service delivery.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center text-sm">2</span>
                            Eligible Services
                        </h2>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Delivery & Meals</h3>
                                    <p className="text-sm">Full refunds are issued if the order is never delivered, completely incorrect, or arrives severely damaged. Partial refunds may be issued for missing items.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Transport</h3>
                                    <p className="text-sm">Refunds are issued if a driver fails to arrive, cancels after accepting, or if a severe technical issue prevents the ride from being completed after payment.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Home Services</h3>
                                    <p className="text-sm">Refunds apply if the provider does not show up during the scheduled time slot or fails to perform the requested service entirely.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center text-sm">3</span>
                            Non-Refundable Scenarios
                        </h2>
                        <ul className="list-disc pl-5 space-y-2 marker:text-brand-500">
                            <li>Change of mind after a service has been completed or a meal has been prepared.</li>
                            <li>Slight delays due to heavy traffic or weather conditions.</li>
                            <li>Wallet top-ups and transferred credits (unless proven to be an unauthorized transaction).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center text-sm">4</span>
                            How to Request a Refund
                        </h2>
                        <p className="leading-relaxed mb-4">
                            To request a refund, navigate to the specific order or transaction in your Activity tab and select "Report an Issue" or open a ticket in the Support Center.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-brand-500">
                            <li>Provide the Transaction ID.</li>
                            <li>Include photographic evidence if applicable (e.g., damaged items).</li>
                            <li>Submit the request within 24 hours of the incident.</li>
                        </ul>
                        <p className="leading-relaxed mt-4 italic text-sm">
                            Approved refunds are typically returned to your UniZy Wallet within 1-3 business days, or to your original payment method within 5-7 business days depending on your bank.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}
