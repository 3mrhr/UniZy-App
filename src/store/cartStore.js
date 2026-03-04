import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: {}, // { mealId: { meal, quantity } }
            merchantId: null, // Store active merchant ID to prevent mixing orders

            addToCart: (meal, quantity = 1) => set((state) => {
                // If adding from a different merchant, optionally clear the cart or block it. 
                // For simplicity now, we reset the cart if merchant changes.
                let newItems = { ...state.items };
                let newMerchantId = state.merchantId;

                if (state.merchantId && state.merchantId !== meal.merchantId) {
                    newItems = {}; // Clear cart for new merchant
                    newMerchantId = meal.merchantId;
                } else if (!state.merchantId) {
                    newMerchantId = meal.merchantId;
                }

                if (newItems[meal.id]) {
                    newItems[meal.id].quantity += quantity;
                } else {
                    newItems[meal.id] = { meal, quantity };
                }

                return { items: newItems, merchantId: newMerchantId };
            }),

            removeFromCart: (mealId) => set((state) => {
                const newItems = { ...state.items };
                if (newItems[mealId]) {
                    if (newItems[mealId].quantity > 1) {
                        newItems[mealId].quantity -= 1;
                    } else {
                        delete newItems[mealId];
                    }
                }

                // Clear merchant ID if cart is empty
                const isCartEmpty = Object.keys(newItems).length === 0;
                return { items: newItems, merchantId: isCartEmpty ? null : state.merchantId };
            }),

            clearCart: () => set({ items: {}, merchantId: null }),

            getCartTotal: () => {
                const items = get().items;
                return Object.values(items).reduce((sum, item) => sum + (item.meal.price * item.quantity), 0);
            },

            getCartCount: () => {
                const items = get().items;
                return Object.values(items).reduce((sum, item) => sum + item.quantity, 0);
            }
        }),
        {
            name: 'unizy-cart', // name of the item in the storage (must be unique)
        }
    )
);
