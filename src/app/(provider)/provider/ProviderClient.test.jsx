import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProviderClient from './ProviderClient';

// Mock dependencies
vi.mock('@/i18n/LanguageProvider', () => ({
  useLanguage: () => ({ dict: {} })
}));

vi.mock('@/components/ThemeLangControls', () => ({
  default: () => <div data-testid="theme-controls">Controls</div>
}));

// We need to mock dynamic imports for actions
const mockUpdateHousingRequestStatus = vi.fn();
vi.mock('@/app/actions/housing', () => ({
  updateHousingRequestStatus: (...args) => mockUpdateHousingRequestStatus(...args)
}));

// Polyfill window.alert and console.error for testing
const originalAlert = window.alert;
const originalError = console.error;

beforeEach(() => {
  window.alert = vi.fn();
  console.error = vi.fn();
  mockUpdateHousingRequestStatus.mockReset();
});

afterEach(() => {
  window.alert = originalAlert;
  console.error = originalError;
  vi.clearAllMocks();
});

describe('ProviderClient', () => {
  const mockSettlements = [{ netAmount: 100 }, { netAmount: 200 }];
  const mockDbListings = [];
  const mockDbLeads = [
    {
      id: 'lead-1',
      status: 'PENDING',
      user: { name: 'John Doe', phone: '1234567890' },
      listing: { title: 'Sunny Studio' }
    }
  ];

  it('handles errors when updating lead status fails completely', async () => {
    // Make the dynamic import action throw an error
    mockUpdateHousingRequestStatus.mockRejectedValue(new Error('Network failure'));

    render(
      <ProviderClient
        settlements={mockSettlements}
        dbListings={mockDbListings}
        dbLeads={mockDbLeads}
      />
    );

    // Find the accept button for the pending lead
    const acceptButton = screen.getByText('Accept');
    expect(acceptButton).toBeInTheDocument();

    // Click it
    fireEvent.click(acceptButton);

    // Verify error was logged and UI state reset
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(expect.any(Error));
      // The button should be re-enabled after processing (isUpdating becomes null)
      expect(acceptButton).not.toBeDisabled();
    });
  });

  it('handles API returning success: false with an error message', async () => {
    // Make the dynamic import action return a failure
    mockUpdateHousingRequestStatus.mockResolvedValue({ success: false, error: 'Custom API Error' });

    render(
      <ProviderClient
        settlements={mockSettlements}
        dbListings={mockDbListings}
        dbLeads={mockDbLeads}
      />
    );

    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Custom API Error');
      expect(acceptButton).not.toBeDisabled();
    });
  });

  it('handles API returning success: false without an error message', async () => {
    // Make the dynamic import action return a failure
    mockUpdateHousingRequestStatus.mockResolvedValue({ success: false });

    render(
      <ProviderClient
        settlements={mockSettlements}
        dbListings={mockDbListings}
        dbLeads={mockDbLeads}
      />
    );

    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to update lead');
      expect(acceptButton).not.toBeDisabled();
    });
  });

  it('handles successful lead status update', async () => {
    // Make the dynamic import action return success
    mockUpdateHousingRequestStatus.mockResolvedValue({ success: true });

    render(
      <ProviderClient
        settlements={mockSettlements}
        dbListings={mockDbListings}
        dbLeads={mockDbLeads}
      />
    );

    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    // Verify success updates UI
    await waitFor(() => {
      // Buttons disappear because status is no longer PENDING
      expect(screen.queryByText('Accept')).not.toBeInTheDocument();
      // Status text should be ACCEPTED
      expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
    });
  });
});
