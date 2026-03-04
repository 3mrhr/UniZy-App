import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MerchantClient from '../MerchantClient';
import { useLanguage } from '@/i18n/LanguageProvider';

// Mock dependencies
jest.mock('@/i18n/LanguageProvider', () => ({
  useLanguage: jest.fn(),
}));

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

describe('MerchantClient error handling', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    useLanguage.mockReturnValue({ dict: {} });

    // Mock window.alert to capture alerts
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Mock console.error to keep test output clean when testing error paths
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

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
