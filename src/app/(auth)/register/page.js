'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ThemeLangControls from '@/components/ThemeLangControls';
import { registerUser } from '@/app/actions/auth';
import { getOAuthUrl } from '@/app/actions/oauth';
import { requestOTP } from '@/app/actions/verification';
import { useLanguage } from '@/i18n/LanguageProvider';
import { toast } from 'react-hot-toast';

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
    const [gender, setGender] = useState('MALE');
    const [age, setAge] = useState('');
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
                gender,
                age,
                referralCode
            });

            if (result.error) {
                setError(result.error);
                setIsLoading(false);
                return;
            }

            // Phase 16 & 41: Redirect to OTP verification for new students
            if (result.role === 'STUDENT') {
                // Trigger OTP request - prefer email if available, otherwise phone
                const identifier = email || phone;
                await requestOTP(identifier);
                router.push(`/register/otp?${email ? `email=${encodeURIComponent(email)}` : `phone=${encodeURIComponent(phone)}`}`);
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Gender</label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold appearance-none cursor-pointer"
                                required
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 ml-1">Age</label>
                            <input
                                type="number"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-unizy-navy/50 border-2 border-transparent focus:bg-white dark:focus:bg-unizy-navy focus:border-brand-500 focus:ring-0 outline-none transition-all text-gray-900 dark:text-white font-bold"
                                placeholder="20"
                                required
                                min="16"
                                max="100"
                            />
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

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-gray-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#fbfcff] dark:bg-[#0a0c10] px-2 text-gray-400 font-black tracking-widest">{a.orContinueWith || 'Or Continue With'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={async () => {
                                const res = await getOAuthUrl('google');
                                if (res.url) window.location.href = res.url;
                                else toast.error('OAuth initiation failed');
                            }}
                            className="flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-unizy-navy border border-gray-200 dark:border-white/5 rounded-2xl hover:bg-gray-50 dark:hover:bg-unizy-navy/80 transition-all active:scale-95 shadow-sm group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="#EA4335" d="M24 12.48c0-.86-.07-1.74-.22-2.31H12v4.38h6.76c-.29 1.58-1.2 2.91-2.54 3.79v3.15h4.1A12 12 0 0 0 24 12.48z" />
                                <path fill="#4285F4" d="M12 24c3.24 0 5.97-1.07 7.97-2.91l-4.1-3.15c-1.12.76-2.56 1.25-3.87 1.25-2.97 0-5.5-2-6.42-4.66H1.42v3.6A12 12 0 0 0 12 24z" />
                                <path fill="#FBBC05" d="M5.58 14.53c-.23-.69-.36-1.42-.36-2.18s.13-1.5.36-2.19V6.57H1.42A12 12 0 0 0 0 12c0 1.95.46 3.8 1.42 5.43l4.16-3.32z" />
                                <path fill="#34A853" d="M12 4.4c1.76 0 3.36.6 4.6 1.77l3.43-3.41A12 12 0 0 0 1.42 6.57l4.16 3.32c.92-2.66 3.45-4.66 6.42-4.66z" />
                            </svg>
                            <span className="text-xs font-black text-gray-700 dark:text-gray-300">Google</span>
                        </button>
                        <button
                            type="button"
                            onClick={async () => {
                                const res = await getOAuthUrl('apple');
                                if (res.url) window.location.href = res.url;
                                else toast.error('OAuth initiation failed');
                            }}
                            className="flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-unizy-navy border border-gray-200 dark:border-white/5 rounded-2xl hover:bg-gray-50 dark:hover:bg-unizy-navy/80 transition-all active:scale-95 shadow-sm group"
                        >
                            <svg className="w-5 h-5 dark:fill-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.96.95-2.21 1.72-3.71 1.72-1.42 0-2.33-.87-3.79-.87-1.44 0-2.54.87-3.81.87-1.39 0-2.82-.91-3.83-1.92C.1 18.27-.47 15.39.42 12.3c.63-2.2 2.4-3.52 4.25-3.52 1.42 0 2.4.91 3.73.91s2.21-.91 3.71-.91c1.55 0 2.91.89 3.66 1.91-3.15 1.55-2.6 5.86.58 7.15-.65 1.54-1.34 2.4-2.3 3.35zM12.03 8.24c-.02-2.06 1.47-3.82 3.33-3.9 0.17 2.19-1.9 4.09-3.33 3.9z" />
                            </svg>
                            <span className="text-xs font-black text-gray-700 dark:text-gray-300">Apple</span>
                        </button>
                    </div>

                    <p className="text-center text-sm font-bold text-gray-500 dark:text-gray-400 mt-8">
                        {a.alreadyHaveAccount || 'Already have an account?'} <Link href="/login" className="text-brand-600 font-extrabold hover:underline">{a.login || 'Sign In'}</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
