'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeLangControls from '@/components/ThemeLangControls';
import { Camera, FileText, CheckCircle, UploadCloud, ShieldAlert } from 'lucide-react';
import Image from 'next/image';

export default function VerifyIDPage() {
    const router = useRouter();
    const [idPhoto, setIdPhoto] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIdPhoto(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Mock upload and verification
        setTimeout(() => {
            setIsLoading(false);
            setIsComplete(true);
            setTimeout(() => {
                router.push('/students');
            }, 2000);
        }, 2000);
    };

    if (isComplete) {
        return (
            <div className="min-h-screen bg-white dark:bg-unizy-navy flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-500 animate-bounce">
                    <CheckCircle size={60} />
                </div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Verification Sent!</h1>
                <p className="text-gray-500 dark:text-gray-400 font-bold max-w-xs mx-auto">
                    Welcome to the UniZy community. Our team will verify your Student ID within 24 hours.
                </p>
                <div className="mt-8 text-brand-600 font-black flex items-center gap-2">
                    Redirecting to Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-6 right-6 z-50">
                <ThemeLangControls />
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="mb-10 text-center animate-fade-in-down">
                    <div className="w-16 h-16 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl shadow-brand-500/30">
                        <Camera size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter mb-2">Student Verification</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">To unlock all university services, we need to verify your student status.</p>
                </div>

                <div className="bg-white/80 dark:bg-unizy-dark/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/50 dark:border-white/5 animate-fade-in-up">
                    <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                        <ShieldAlert className="text-amber-600 shrink-0" size={24} />
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-500">
                            Your data is encrypted and used only for internal identity verification purposes.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                className="hidden"
                                id="id-upload"
                            />
                            <label
                                htmlFor="id-upload"
                                className={`w-full h-56 border-3 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${idPhoto ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'border-gray-200 dark:border-white/10 hover:border-brand-400 bg-gray-50 dark:bg-unizy-navy/50'}`}
                            >
                                {idPhoto ? (
                                    <div className="relative w-full h-full p-4">
                                        <Image src={idPhoto} alt="ID Preview" fill className="object-contain rounded-2xl" />
                                        <div className="absolute inset-0 bg-brand-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                            <span className="bg-white dark:bg-unizy-dark px-4 py-2 rounded-xl text-sm font-black shadow-lg">Change Photo</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-white dark:bg-unizy-navy rounded-2xl flex items-center justify-center shadow-md">
                                            <UploadCloud className="text-brand-600" size={32} />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black text-gray-900 dark:text-white">Upload Student ID</p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Accepts PNG, JPG (Max 5MB)</p>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                                <FileText size={18} className="text-brand-500" />
                                <span>Ensure your name and photo are visible</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                                <ShieldAlert size={18} className="text-brand-500" />
                                <span>Must be a valid current-year ID</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!idPhoto || isLoading}
                            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Submit for Verification'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/students')}
                            className="w-full text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold text-sm py-2 transition-all"
                        >
                            I'll do this later
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
