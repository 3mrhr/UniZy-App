import Link from 'next/link';
import { ArrowLeft, Users, ShieldAlert } from 'lucide-react';

export default function CommunityGuidelinesPage() {
    return (
        <main className="min-h-screen bg-gray-50 dark:bg-unizy-navy pb-32 transition-colors">
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-6 pt-12 pb-20 relative overflow-hidden">
                <div className="max-w-3xl mx-auto relative z-10">
                    <Link href="/account" className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-bold mb-6 transition-all group w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Account
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="text-white w-8 h-8" />
                        <h1 className="text-3xl font-black text-white">Community Guidelines</h1>
                    </div>
                    <p className="text-emerald-100 font-medium opacity-90">Building a safe campus environment</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 -mt-10 relative z-10">
                <div className="bg-white dark:bg-unizy-dark rounded-[2rem] p-8 shadow-xl border border-gray-100 dark:border-white/5 space-y-8 text-gray-700 dark:text-gray-300">

                    <section>
                        <p className="leading-relaxed text-lg font-medium text-gray-900 dark:text-white">
                            UniZy is designed strictly for university students, local campus merchants, and service providers. Trust and respect are the foundation of our platform. By using UniZy, you agree to adhere to these community guidelines.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">1. Respect & Safety</h2>
                        <ul className="list-disc pl-5 space-y-2 marker:text-green-500">
                            <li><strong className="text-gray-900 dark:text-white">Zero Tolerance for Harassment:</strong> We do not tolerate hate speech, bullying, stalking, or any form of harassment towards students, drivers, or merchants.</li>
                            <li><strong className="text-gray-900 dark:text-white">Physical Safety:</strong> Do not engage in behavior that threatens the physical safety of yourself or others during a delivery, ride, or home service.</li>
                            <li><strong className="text-gray-900 dark:text-white">Privacy:</strong> Do not share personal information, phone numbers, or exact dorm locations of other users outside of the necessary service context.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">2. Honest Transactions</h2>
                        <ul className="list-disc pl-5 space-y-2 marker:text-green-500">
                            <li><strong className="text-gray-900 dark:text-white">No Scamming or Fraud:</strong> Any attempt to defraud merchants, evade payment, or abuse the referral/rewards system will result in an immediate permanent ban.</li>
                            <li><strong className="text-gray-900 dark:text-white">Accurate Reporting:</strong> Do not file false support tickets, manipulate ratings, or submit fake reports against other users.</li>
                            <li><strong className="text-gray-900 dark:text-white">Authenticity:</strong> You must use your real university credentials and maintain accurate profile information.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <ShieldAlert className="text-red-500" /> Violations & Enforcement
                        </h2>
                        <p className="leading-relaxed mb-4">
                            We actively monitor reports submitted through the UniZy Trust & Safety system. If a guideline is violated, our moderation team will take appropriate action based on the severity of the offense:
                        </p>
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                            <ul className="space-y-2 text-sm text-red-900 dark:text-red-300">
                                <li><strong>1st Offense (Minor):</strong> Formal warning via email/notification.</li>
                                <li><strong>2nd Offense:</strong> Temporary account suspension (24-72 hours) and loss of reward points.</li>
                                <li><strong>Severe/Repeated Offenses:</strong> Permanent account ban and potential reporting to university authorities or local law enforcement if illegal activity is suspected.</li>
                            </ul>
                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
}
