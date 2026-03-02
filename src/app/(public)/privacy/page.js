import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-unizy-navy py-16 px-6 md:px-12">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-brand-600 font-bold text-sm mb-8 inline-block hover:underline">← Back to Home</Link>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-8">Privacy Policy</h1>

                <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-600 dark:text-gray-400">
                    <p className="text-lg font-medium">Last updated: March 2026</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">1. Data We Collect</h2>
                    <p>UniZy collects your name, email, phone number, university ID, and profile information for account verification and service delivery.</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">2. How We Use Your Data</h2>
                    <p>Your data is used to verify student identity, match you with services, process bookings, and improve the platform experience. We never sell your personal data.</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">3. Data Security</h2>
                    <p>All passwords are hashed with bcrypt. Sessions are encrypted with iron-session. Student IDs are stored securely and only accessible to verification staff.</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">4. Third-Party Services</h2>
                    <p>We use Cloudinary for media storage. No personal data is shared with third-party advertisers.</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">5. Your Rights</h2>
                    <p>You can request data deletion by contacting support. Account deletion removes all personal data from our systems within 30 days.</p>

                    <h2 className="text-xl font-black text-gray-900 dark:text-white">6. Contact</h2>
                    <p>Privacy inquiries: <span className="text-brand-600 font-bold">privacy@unizy.app</span></p>
                </div>
            </div>
        </main>
    );
}
