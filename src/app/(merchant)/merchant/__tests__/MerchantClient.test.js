import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MerchantClient from '../MerchantClient';
import * as ordersActions from '@/app/actions/orders';
import { useLanguage } from '@/i18n/LanguageProvider';

// Mock language context
jest.mock('@/i18n/LanguageProvider', () => ({
  useLanguage: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children }) => {
    return children;
  }
});

jest.mock('@/components/ThemeLangControls', () => {
  return function MockThemeLangControls() {
    return <div data-testid="theme-lang-controls">ThemeLangControls</div>;
  };
});

let mockUpdateMerchantSettings;
jest.mock('@/app/actions/merchant', () => {
  return {
    get updateMerchantSettings() {
      return mockUpdateMerchantSettings;
    }
  };
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

  beforeEach(() => {
    jest.clearAllMocks();
    useLanguage.mockReturnValue({ dict: {} });
    jest.spyOn(window, 'alert').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  describe('Order status updates', () => {
    it('catches and logs an exception thrown when updating order status', async () => {
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
        expect(console.error).toHaveBeenCalledWith('Failed to update order status:', expect.any(Error));
      });
    });

    it('alerts the user when updateMerchantOrderStatus returns ok: false', async () => {
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
        expect(window.alert).toHaveBeenCalledWith('Insufficient inventory');
      });
    });
  });

  describe('Merchant settings updates', () => {
    it('triggers the catch block and logs the error when updateMerchantSettings throws an exception', async () => {
      mockUpdateMerchantSettings = jest.fn().mockRejectedValue(new Error('Network error'));

      render(<MerchantClient settlements={[]} merchantName="Test Store" />);

      // Open settings modal
      fireEvent.click(screen.getByText('Store Settings'));

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(expect.any(Error));
      });

      expect(window.alert).not.toHaveBeenCalled();
    });

    it('shows an alert when updateMerchantSettings returns an error response', async () => {
      mockUpdateMerchantSettings = jest.fn().mockResolvedValue({
        ok: false,
        error: { message: 'Custom API error message' }
      });

      render(<MerchantClient settlements={[]} merchantName="Test Store" />);

      // Open settings modal
      fireEvent.click(screen.getByText('Store Settings'));

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Custom API error message');
      });
    });

    it('shows an alert when updateMerchantSettings returns an error response with fallback message', async () => {
      mockUpdateMerchantSettings = jest.fn().mockResolvedValue({
        ok: false
      });

      render(<MerchantClient settlements={[]} merchantName="Test Store" />);

      // Open settings modal
      fireEvent.click(screen.getByText('Store Settings'));

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /save settings/i }));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to update settings');
      });
    });
  });
});
