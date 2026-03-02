import Link from 'next/link';
import { ArrowLeft, XCircle, Clock } from 'lucide-react';

export default function CancellationPolicyPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32 transition-colors">
            <div className="bg-gradient-to-br from-red-600 to-rose-700 px-6 pt-12 pb-20 relative overflow-hidden">
                <div className="max-w-3xl mx-auto relative z-10">
                    <Link href="/account" className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-bold mb-6 transition-all group w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Account
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <XCircle className="text-white w-8 h-8" />
                        <h1 className="text-3xl font-black text-white">Cancellation Policy</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-10">
                <div className="bg-white dark:bg-unizy-dark rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-white/5 space-y-8 text-gray-700 dark:text-gray-300">

                    <section>
                        <p className="leading-relaxed text-lg font-medium text-gray-900 dark:text-white">
                            To ensure a reliable experience for both consumers and providers (merchants, drivers, service professionals), UniZy enforces the following cancellation windows and penalties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-white/10 pb-2">Food & Delivery</h2>
                        <ul className="space-y-4 marker:text-red-500">
                            <li>
                                <strong className="text-gray-900 dark:text-white flex items-center gap-2"><Clock size={16} className="text-green-500" /> Grace Period:</strong>
                                <span className="block mt-1">Orders can be cancelled without penalty within <strong>2 minutes</strong> of placement, provided the merchant hasn't accepted it yet.</span>
                            </li>
                            <li>
                                <strong className="text-gray-900 dark:text-white flex items-center gap-2"><XCircle size={16} className="text-red-500" /> Late Cancellation:</strong>
                                <span className="block mt-1">If the merchant has already started preparing the food or the driver is en route, you cannot cancel the order through the app. Rejecting delivery at the door will result in an account strike and no refund.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-white/10 pb-2">Transport Rides</h2>
                        <ul className="space-y-4">
                            <li>
                                <strong className="text-gray-900 dark:text-white">Before Driver Arrival:</strong>
                                <span className="block mt-1">You may cancel without penalty within 3 minutes of a driver accepting your request.</span>
                            </li>
                            <li>
                                <strong className="text-gray-900 dark:text-white">Driver Wait Time Penalty:</strong>
                                <span className="block mt-1">If you cancel after the driver has arrived at the pickup location and waited for over 5 minutes, a <strong>Cancellation Fee of 15 EGP</strong> may be deducted from your wallet or applied to your next ride.</span>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-white/10 pb-2">Home Services (Cleaning)</h2>
                        <ul className="space-y-4">
                            <li>
                                <span className="block"><strong>Free Cancellation:</strong> Up to 24 hours before the scheduled time slot.</span>
                            </li>
                            <li>
                                <span className="block"><strong>Late Cancellation Penalty:</strong> Cancelling within 24 hours of the appointment will incur a fee equal to 20% of the service cost to compensate the provider's reserved time.</span>
                            </li>
                        </ul>
                    </section>

                </div>
            </div>
        </main>
    );
}
