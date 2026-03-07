'use client';

import { create } from 'zustand';
import { getOrCreateWallet } from '@/app/actions/wallet';

/**
 * Wallet Store for Student Portal
 * Following zustand-store-ts best practices for UniZy
 */
export const useWalletStore = create((set, get) => ({
    wallet: null,
    loading: false,
    error: null,
    initialized: false,

    // Actions
    fetchWallet: async () => {
        if (get().loading) return;
        set({ loading: true, error: null });

        try {
            const result = await getOrCreateWallet();
            if (result.success) {
                set({
                    wallet: result.wallet,
                    initialized: true,
                    loading: false
                });
            } else {
                set({ error: result.error, loading: false });
            }
        } catch (err) {
            set({ error: 'Failed to connect to wallet service.', loading: false });
        }
    },

    // Setters for optimistic updates
    setBalance: (newBalance) => {
        set((state) => ({
            wallet: state.wallet ? { ...state.wallet, balance: newBalance } : null
        }));
    },

    reset: () => set({ wallet: null, loading: false, error: null, initialized: false })
}));
