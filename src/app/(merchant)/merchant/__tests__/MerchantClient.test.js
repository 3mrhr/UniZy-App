import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MerchantClient from '../MerchantClient';
import * as ordersActions from '@/app/actions/orders';

// Mock language context
jest.mock('@/i18n/LanguageProvider', () => ({
    useLanguage: () => ({ dict: {} }),
}));

// Mock next/link
jest.mock('next/link', () => {
    return ({ children }) => {
        return children;
    }
});

// Mock module explicitly with a variable
jest.mock('@/app/actions/orders', () => ({
    updateMerchantOrderStatus: jest.fn()
}));

const mockOrders = [
    {
        id: '1',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        orderItems: [{ nameSnapshot: 'Burger', qty: 2 }],
        user: { name: 'John Doe' },
        total: 100
    }
];

describe('MerchantClient error handling', () => {
    let originalConsoleError;
    let originalAlert;

    beforeAll(() => {
        originalConsoleError = console.error;
        originalAlert = window.alert;
    });

    afterAll(() => {
        console.error = originalConsoleError;
        window.alert = originalAlert;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('catches and logs an exception thrown when updating order status', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        ordersActions.updateMerchantOrderStatus.mockRejectedValueOnce(new Error('Network failure'));

        render(<MerchantClient
            dbOrders={mockOrders}
            dbMeals={[]}
            dbDeals={[]}
            settlements={[]}
        />);

        const acceptButton = screen.getByText('Accept');

        await userEvent.click(acceptButton);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to update order status:', expect.any(Error));
        });
    });

    it('alerts the user when updateMerchantOrderStatus returns ok: false', async () => {
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

        ordersActions.updateMerchantOrderStatus.mockResolvedValueOnce({
            ok: false,
            error: { message: 'Insufficient inventory' }
        });

        render(<MerchantClient
            dbOrders={mockOrders}
            dbMeals={[]}
            dbDeals={[]}
            settlements={[]}
        />);

        const acceptButton = screen.getByText('Accept');

        await userEvent.click(acceptButton);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Insufficient inventory');
        });
    });
});
