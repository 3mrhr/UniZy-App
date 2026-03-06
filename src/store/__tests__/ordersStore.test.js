import { useOrdersStore } from '../ordersStore';

describe('useOrdersStore', () => {
    beforeEach(() => {
        // Reset the store to initial state before each test
        const store = useOrdersStore.getState();
        store.setPendingCount(0);
        store.setOrders([]);
    });

    it('should initialize with orders as empty array', () => {
        const state = useOrdersStore.getState();
        expect(state.orders).toEqual([]);
    });

    it('should set orders to a specific value', () => {
        const store = useOrdersStore.getState();
        store.setOrders([{ id: 1 }, { id: 2 }]);
        expect(useOrdersStore.getState().orders).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should initialize with pendingCount as 0', () => {
        const state = useOrdersStore.getState();
        expect(state.pendingCount).toBe(0);
    });

    it('should set pendingCount to a specific value', () => {
        const store = useOrdersStore.getState();
        store.setPendingCount(5);
        expect(useOrdersStore.getState().pendingCount).toBe(5);
    });

    it('should increment pendingCount by 1', () => {
        const store = useOrdersStore.getState();
        store.incrementPending();
        expect(useOrdersStore.getState().pendingCount).toBe(1);

        store.incrementPending();
        expect(useOrdersStore.getState().pendingCount).toBe(2);
    });

    it('should decrement pendingCount by 1', () => {
        const store = useOrdersStore.getState();
        store.setPendingCount(3);

        store.decrementPending();
        expect(useOrdersStore.getState().pendingCount).toBe(2);
    });

    it('should not decrement pendingCount below 0', () => {
        const store = useOrdersStore.getState();
        store.setPendingCount(0);

        store.decrementPending();
        expect(useOrdersStore.getState().pendingCount).toBe(0);
    });
});
