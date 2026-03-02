import Link from 'next/link';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-unizy-navy py-16 px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-brand-600 font-bold text-sm mb-8 inline-block hover:underline">← Back to Home</Link>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-8">Terms of Service</h1>

                <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
                    <p className="text-lg font-medium">Last updated: March 2026</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">1. Acceptance of Terms</h2>
                    <p>By accessing and using UniZy, you agree to be bound by these Terms of Service. UniZy is a student-focused platform providing housing, transport, delivery, and campus services for university communities.</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">2. Eligibility</h2>
                    <p>UniZy is available to registered university students, faculty, and authorized service providers. You must provide a valid university ID for verification.</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">3. User Responsibilities</h2>
                    <p>Users must maintain accurate account information, respect community guidelines, and not misuse the platform for unauthorized commercial purposes.</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">4. Service Providers</h2>
                    <p>Service providers (drivers, landlords, merchants) must maintain valid certifications and comply with local regulations. UniZy facilitates connections but is not liable for third-party service quality.</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">5. Payments & Refunds</h2>
                    <p>Payment processing and refund policies will be detailed upon the launch of integrated payment features. Current MVP operates with cash-on-delivery and direct transfers.</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">6. Contact</h2>
                    <p>For questions about these terms, contact us at <span className="text-brand-600 font-bold">legal@unizy.app</span></p>
                </div>
            </div>
        </main>
    );
}
