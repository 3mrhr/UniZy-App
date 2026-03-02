import Link from 'next/link';
import { ArrowLeft, Gift, Star } from 'lucide-react';

export default function RewardsRulesPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32 transition-colors">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-800 px-6 pt-12 pb-20 relative overflow-hidden">
                <div className="max-w-3xl mx-auto relative z-10">
                    <Link href="/account" className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-bold mb-6 transition-all group w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Account
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <Gift className="text-white w-8 h-8" />
                        <h1 className="text-3xl font-black text-white">Rewards & Referrals Rules</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-10">
                <div className="bg-white dark:bg-unizy-dark rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-white/5 space-y-8 text-gray-700 dark:text-gray-300">

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Earning Points</h2>
                        <p className="leading-relaxed mb-4">
                            UniZy Points are our way of rewarding active members of our campus community. Points can be earned in several ways:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 marker:text-purple-500">
                            <li><strong>Completing Transactions:</strong> Earn points on successful meal orders, deliveries, and ride completions based on the transaction value.</li>
                            <li><strong>Referrals:</strong> Share your unique invite code. See conditions below.</li>
                            <li><strong>Promotions:</strong> Participate in campus events or limited-time campaigns.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Star className="text-amber-500" /> Referral Program Conditions
                        </h2>
                        <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-2xl">
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-2">
                                    <span className="font-black text-brand-600">1.</span>
                                    <span>When a friend registers using your code, the referral is marked as <strong>Pending</strong>.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-black text-brand-600">2.</span>
                                    <span>Points are only awarded (50 to you, 25 to them) after the referred user completes their <strong>first successful transaction</strong> (booking, order, or ride).</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="font-black text-brand-600">3.</span>
                                    <span>Self-referrals, creating fake accounts, or "point farming" via emulators is strictly prohibited and monitored by our abuse detection system.</span>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Using Points</h2>
                        <p className="leading-relaxed">
                            Points can be redeemed for discounts, special promotions, or converted into UniZy Wallet Balance during specific promotional periods. Points have no direct cash value outside of the UniZy platform and cannot be directly withdrawn to a bank account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Expiration & Forfeiture</h2>
                        <p className="leading-relaxed">
                            Points expire 12 months after they are earned if there is no activity on your account. If your account is suspended or banned for violating community guidelines, all accumulated points and pending referrals are immediately forfeited without compensation.
                        </p>
                    </section>

                </div>
            </div>
        </main>
    );
}
