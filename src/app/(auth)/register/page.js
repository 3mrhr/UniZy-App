'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ThemeLangControls from '@/components/ThemeLangControls';
import { registerUser } from '@/app/actions/auth';
import { requestOTP } from '@/app/actions/verification';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function Register() {
    const router = useRouter();
    const { dict } = useLanguage();
    const a = dict?.auth || {};
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('STUDENT');
    const [university, setUniversity] = useState('Assiut University');
    const [faculty, setFaculty] = useState('');
    const [academicYear, setAcademicYear] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await registerUser({
                name,
                email,
                password,
                phone,
                role,
                university,
                faculty,
                academicYear,
                referralCode
            });

            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            // Phase 16 & 41: Redirect to OTP verification for new students
            if (result.role === 'STUDENT') {
                // Trigger OTP request
                await requestOTP(phone);
                router.push(`/register/otp?phone=${encodeURIComponent(phone)}`);
            } else {
                // Other roles go to their hubs
                const newRole = result.role;
                if (newRole === 'ADMIN') {
                    router.push('/admin');
                } else if (newRole === 'DRIVER') {
                    router.push('/driver');
                } else if (newRole === 'PROVIDER' || newRole === 'LANDLORD') {
                    router.push('/provider');
                } else if (newRole === 'MERCHANT') {
                    router.push('/merchant');
                } else {
                    router.push('/students');
                }
            }
        } catch (err) {
            setError('An error occurred during registration.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">

            {/* Decorative Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-200 dark:bg-brand-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="max-w-xl w-full relative z-10 my-8">
                <div className="text-center mb-8 animate-fade-in-down">
                    <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-cyan-400 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-brand-500/40 mb-4 transform cursor-pointer">
                        <Image src="/images/unizy-logo-icon.png" alt="UniZy" width={32} height={32} className="object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{a.signup || 'Join UniZy'}</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 text-xs uppercase tracking-widest italic">{a.createAccountSub || 'The Student Super App Experience'}</p>
                </div>

                <form onSubmit={handleRegister} className="bg-white/70 dark:bg-unizy-dark/70 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl border border-white/50 dark:border-white/5 animate-fade-in-up">

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{a.name || 'Full Name'}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                                placeholder="Omar Hassan"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{a.email || 'Email'}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                                placeholder="omar@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{a.phone || 'Phone Number'}</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                            placeholder="01012345678"
                            required
                            minLength={10}
                            maxLength={15}
                            pattern="[0-9]+"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{a.password || 'Password'}</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">{a.role || 'I am a...'}</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold appearance-none cursor-pointer"
                            >
                                <option value="STUDENT">{a.student || 'Student'}</option>
                                <option value="PROVIDER">{a.housingProvider || 'Housing Provider'}</option>
                                <option value="MERCHANT">{a.merchant || 'Local Merchant'}</option>
                                <option value="DRIVER">{a.driver || 'Delivery / Ride Driver'}</option>
                                <option value="ADMIN">Administrator</option>
                            </select>
                        </div>
                    </div>

                    {role === 'STUDENT' && (
                        <div className="space-y-4 mb-8 p-4 bg-brand-50 dark:bg-brand-900/10 rounded-3xl border border-brand-100 dark:border-brand-900/20">
                            <div>
                                <label className="block text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2 ml-1 text-[10px]">University</label>
                                <select
                                    value={university}
                                    onChange={(e) => setUniversity(e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-unizy-navy border-2 border-transparent focus:border-brand-500 outline-none transition-all text-gray-900 dark:text-white font-bold appearance-none cursor-pointer"
                                >
                                    <option value="Assiut University">Assiut University</option>
                                    <option value="Sphinx University">Sphinx University</option>
                                    <option value="Badari University">Badari University</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2 ml-1 text-[10px]">Faculty</label>
                                    <input
                                        type="text"
                                        value={faculty}
                                        onChange={(e) => setFaculty(e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-unizy-navy border-2 border-transparent focus:border-brand-500 outline-none transition-all text-gray-900 dark:text-white font-bold"
                                        placeholder="Engineering"
                                        required={role === 'STUDENT'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2 ml-1 text-[10px]">Academic Year</label>
                                    <select
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-unizy-navy border-2 border-transparent focus:border-brand-500 outline-none transition-all text-gray-900 dark:text-white font-bold appearance-none cursor-pointer"
                                        required={role === 'STUDENT'}
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                        <option value="5th+ Year">5th+ Year</option>
                                        <option value="Postgraduate">Postgraduate</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2 ml-1 text-[10px]">Referral Code (Optional)</label>
                                <input
                                    type="text"
                                    value={referralCode}
                                    onChange={(e) => setReferralCode(e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-unizy-navy border-2 border-transparent focus:border-brand-500 outline-none transition-all text-gray-900 dark:text-white font-bold"
                                    placeholder="UNI-123"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            role === 'STUDENT' ? 'Continue to Verify' : 'Join Now'
                        )}
                    </button>

                    <p className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 mt-8">
                        {a.alreadyHaveAccount || 'Already have an account?'} <Link href="/login" className="text-brand-600 font-extrabold hover:underline">{a.login || 'Sign In'}</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
