import { useCartStore } from '@/store/cartStore';

// We need to reset Zustand store between tests
const initialStoreState = useCartStore.getState();

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset store state before each test to ensure isolation
    useCartStore.setState(initialStoreState, true);
  });

  const mockMeal1 = { id: 'meal1', merchantId: 'merchantA', price: 10, name: 'Burger' };
  const mockMeal2 = { id: 'meal2', merchantId: 'merchantA', price: 5, name: 'Fries' };
  const mockMeal3 = { id: 'meal3', merchantId: 'merchantB', price: 15, name: 'Pizza' };

  describe('Initial State', () => {
    it('should have an empty cart initially', () => {
      const state = useCartStore.getState();
      expect(state.items).toEqual({});
      expect(state.merchantId).toBeNull();
      expect(state.getCartTotal()).toBe(0);
      expect(state.getCartCount()).toBe(0);
    });
  });

  describe('addToCart', () => {
    it('should add a single item with default quantity 1', () => {
      useCartStore.getState().addToCart(mockMeal1);
      const state = useCartStore.getState();

      expect(state.merchantId).toBe('merchantA');
      expect(state.items).toEqual({
        'meal1': { meal: mockMeal1, quantity: 1 }
      });
      expect(state.getCartCount()).toBe(1);
      expect(state.getCartTotal()).toBe(10);
    });

    it('should add a single item with a specific quantity', () => {
      useCartStore.getState().addToCart(mockMeal1, 3);
      const state = useCartStore.getState();

      expect(state.items['meal1'].quantity).toBe(3);
      expect(state.getCartCount()).toBe(3);
      expect(state.getCartTotal()).toBe(30);
    });

    it('should increase quantity when adding the same item multiple times', () => {
      useCartStore.getState().addToCart(mockMeal1, 2);
      useCartStore.getState().addToCart(mockMeal1, 1);
      const state = useCartStore.getState();

      expect(state.items['meal1'].quantity).toBe(3);
      expect(state.getCartCount()).toBe(3);
    });

    it('should clear previous items and update merchantId when adding from a different merchant', () => {
      useCartStore.getState().addToCart(mockMeal1);
      expect(useCartStore.getState().merchantId).toBe('merchantA');

      useCartStore.getState().addToCart(mockMeal3);
      const state = useCartStore.getState();

      expect(state.merchantId).toBe('merchantB');
      expect(state.items).toEqual({
        'meal3': { meal: mockMeal3, quantity: 1 }
      });
      expect(state.items['meal1']).toBeUndefined();
    });
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      useCartStore.getState().addToCart(mockMeal1, 2);
      useCartStore.getState().addToCart(mockMeal2, 1);
    });

    it('should decrease quantity when removing an item with quantity > 1', () => {
      useCartStore.getState().removeFromCart('meal1');
      const state = useCartStore.getState();

      expect(state.items['meal1'].quantity).toBe(1);
      expect(state.getCartCount()).toBe(2); // 1 meal1 + 1 meal2
    });

    it('should remove the item entirely when quantity is 1', () => {
      useCartStore.getState().removeFromCart('meal2');
      const state = useCartStore.getState();

      expect(state.items['meal2']).toBeUndefined();
      expect(state.items['meal1'].quantity).toBe(2);
      expect(state.getCartCount()).toBe(2);
      expect(state.merchantId).toBe('merchantA'); // Merchant still active
    });

    it('should set merchantId to null when removing the last item in the cart', () => {
      useCartStore.getState().removeFromCart('meal2');
      useCartStore.getState().removeFromCart('meal1');
      useCartStore.getState().removeFromCart('meal1'); // cart is now empty
      const state = useCartStore.getState();

      expect(state.items).toEqual({});
      expect(state.merchantId).toBeNull();
      expect(state.getCartCount()).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should completely empty the cart and reset merchantId', () => {
      useCartStore.getState().addToCart(mockMeal1, 5);
      expect(useCartStore.getState().getCartCount()).toBe(5);

      useCartStore.getState().clearCart();
      const state = useCartStore.getState();

      expect(state.items).toEqual({});
      expect(state.merchantId).toBeNull();
      expect(state.getCartCount()).toBe(0);
      expect(state.getCartTotal()).toBe(0);
    });
  });

  describe('getCartTotal and getCartCount', () => {
    it('should accurately calculate total price and quantity', () => {
      useCartStore.getState().addToCart(mockMeal1, 2); // 2 * $10 = $20
      useCartStore.getState().addToCart(mockMeal2, 3); // 3 * $5 = $15
      const state = useCartStore.getState();

      expect(state.getCartCount()).toBe(5);
      expect(state.getCartTotal()).toBe(35);
    });
  });
});
