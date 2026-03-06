import { useCartStore } from '../cartStore';

// Mock zustand/middleware to avoid localStorage issues in tests
jest.mock('zustand/middleware', () => {
  return {
    persist: (config) => config, // Return the basic store configuration
  };
});

describe('useCartStore', () => {
  const initialStoreState = useCartStore.getState();

  beforeEach(() => {
    // Reset store state before each test
    useCartStore.setState(initialStoreState, true);
  });

  it('should have correct initial state', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual({});
    expect(state.merchantId).toBeNull();
  });

  describe('addToCart', () => {
    it('should add a single meal and set merchantId', () => {
      const meal = { id: 'm1', merchantId: 'merch1', price: 10 };
      useCartStore.getState().addToCart(meal, 2);

      const state = useCartStore.getState();
      expect(state.merchantId).toBe('merch1');
      expect(state.items['m1']).toEqual({ meal, quantity: 2 });
    });

    it('should default quantity to 1 if not provided', () => {
      const meal = { id: 'm2', merchantId: 'merch1', price: 15 };
      useCartStore.getState().addToCart(meal);

      const state = useCartStore.getState();
      expect(state.merchantId).toBe('merch1');
      expect(state.items['m2']).toEqual({ meal, quantity: 1 });
    });

    it('should increment quantity if the same meal is added again', () => {
      const meal = { id: 'm1', merchantId: 'merch1', price: 10 };

      useCartStore.getState().addToCart(meal, 1);
      useCartStore.getState().addToCart(meal, 3);

      const state = useCartStore.getState();
      expect(state.items['m1'].quantity).toBe(4);
    });

    it('should clear cart and update merchantId if a meal from a different merchant is added', () => {
      const meal1 = { id: 'm1', merchantId: 'merch1', price: 10 };
      const meal2 = { id: 'm2', merchantId: 'merch2', price: 15 };

      useCartStore.getState().addToCart(meal1, 2);

      // Add from different merchant
      useCartStore.getState().addToCart(meal2, 1);

      const state = useCartStore.getState();
      expect(state.merchantId).toBe('merch2');
      expect(state.items['m1']).toBeUndefined();
      expect(state.items['m2']).toEqual({ meal: meal2, quantity: 1 });
    });
  });

  describe('removeFromCart', () => {
    it('should decrement quantity if greater than 1', () => {
      const meal = { id: 'm1', merchantId: 'merch1', price: 10 };
      useCartStore.getState().addToCart(meal, 3);

      useCartStore.getState().removeFromCart('m1');

      const state = useCartStore.getState();
      expect(state.items['m1'].quantity).toBe(2);
      expect(state.merchantId).toBe('merch1');
    });

    it('should remove item entirely if quantity is 1', () => {
      const meal1 = { id: 'm1', merchantId: 'merch1', price: 10 };
      const meal2 = { id: 'm2', merchantId: 'merch1', price: 15 };

      useCartStore.getState().addToCart(meal1, 1);
      useCartStore.getState().addToCart(meal2, 2);

      useCartStore.getState().removeFromCart('m1');

      const state = useCartStore.getState();
      expect(state.items['m1']).toBeUndefined();
      expect(state.items['m2'].quantity).toBe(2);
      expect(state.merchantId).toBe('merch1');
    });

    it('should clear merchantId when the last item is removed', () => {
      const meal = { id: 'm1', merchantId: 'merch1', price: 10 };
      useCartStore.getState().addToCart(meal, 1);

      useCartStore.getState().removeFromCart('m1');

      const state = useCartStore.getState();
      expect(state.items).toEqual({});
      expect(state.merchantId).toBeNull();
    });

    it('should do nothing if item does not exist in cart', () => {
      const meal = { id: 'm1', merchantId: 'merch1', price: 10 };
      useCartStore.getState().addToCart(meal, 1);

      useCartStore.getState().removeFromCart('non_existent');

      const state = useCartStore.getState();
      expect(state.items['m1'].quantity).toBe(1);
      expect(state.merchantId).toBe('merch1');
    });
  });

  describe('clearCart', () => {
    it('should reset items and merchantId', () => {
      const meal = { id: 'm1', merchantId: 'merch1', price: 10 };
      useCartStore.getState().addToCart(meal, 2);

      useCartStore.getState().clearCart();

      const state = useCartStore.getState();
      expect(state.items).toEqual({});
      expect(state.merchantId).toBeNull();
    });
  });

  describe('getCartTotal and getCartCount', () => {
    beforeEach(() => {
      const meal1 = { id: 'm1', merchantId: 'merch1', price: 10 }; // Total: 20
      const meal2 = { id: 'm2', merchantId: 'merch1', price: 15 }; // Total: 45

      useCartStore.getState().addToCart(meal1, 2);
      useCartStore.getState().addToCart(meal2, 3);
    });

    it('should calculate correct total price', () => {
      const total = useCartStore.getState().getCartTotal();
      expect(total).toBe(65); // (10 * 2) + (15 * 3)
    });

    it('should calculate correct total count', () => {
      const count = useCartStore.getState().getCartCount();
      expect(count).toBe(5); // 2 + 3
    });

    it('should return 0 when cart is empty', () => {
      useCartStore.getState().clearCart();

      expect(useCartStore.getState().getCartTotal()).toBe(0);
      expect(useCartStore.getState().getCartCount()).toBe(0);
    });
  });
});
