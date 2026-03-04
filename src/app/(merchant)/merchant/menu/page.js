'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createMeal } from '@/app/actions/merchant';

export default function MerchantMenuPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stockCount: '10'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await createMeal({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stockCount: parseInt(formData.stockCount, 10),
                trackInventory: true,
                tags: 'Meals', // Default tag for now
            });

            if (result.error) {
                setError(result.error);
            } else {
                router.push('/merchant'); // Redirect back to hub on success
            }
        } catch (err) {
            setError('Failed to create item');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-unizy-navy p-6 flex flex-col items-center">
            <div className="max-w-4xl w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Manage Menu</h1>
                    <Link href="/merchant" className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-xl text-sm font-bold hover:bg-gray-300 transition-colors">
                        ← Back to Hub
                    </Link>
                </div>

                <div className="bg-white dark:bg-unizy-dark p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                    <h2 className="text-xl font-bold mb-6">Add New Item</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Item Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-unizy-navy focus:border-brand-500 outline-none transition-all"
                                placeholder="e.g., Smoke Test Supreme Pizza"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-unizy-navy focus:border-brand-500 outline-none transition-all"
                                placeholder="Item description..."
                            ></textarea>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Price (EGP)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-unizy-navy focus:border-brand-500 outline-none transition-all"
                                    placeholder="250"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stockCount"
                                    value={formData.stockCount}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-unizy-navy focus:border-brand-500 outline-none transition-all"
                                    placeholder="10"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-4 mt-4 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-xl transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
                        >
                            {isLoading ? 'Saving...' : 'Save Item'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
