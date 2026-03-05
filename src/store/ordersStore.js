import { create } from 'zustand';

export const useOrdersStore = create((set) => ({
    pendingCount: 0,
    setPendingCount: (count) => set({ pendingCount: count }),
    incrementPending: () => set((state) => ({ pendingCount: state.pendingCount + 1 })),
    decrementPending: () => set((state) => ({ pendingCount: Math.max(0, state.pendingCount - 1) })),
}));
