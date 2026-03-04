import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProviderClient from './ProviderClient';

// Mock Next.js dependencies
jest.mock('next/link', () => {
  return ({children}) => {
    return children;
  }
});
jest.mock('next/image', () => {
    return ({src, alt}) => {
        return <img src={src} alt={alt} />
    }
});

// Mock i18n LanguageProvider hook
jest.mock('@/i18n/LanguageProvider', () => ({
  useLanguage: () => ({ dict: {} })
}));

// Mock the ThemeLangControls component
jest.mock('@/components/ThemeLangControls', () => {
  return function MockThemeLangControls() {
    return <div data-testid="theme-lang-controls">Theme Lang Controls</div>;
  };
});

describe('ProviderClient component', () => {
    let mockCreateHousingListing;

    beforeEach(() => {
        mockCreateHousingListing = jest.fn();

        jest.clearAllMocks();
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.resetModules();
    });

    it('should catch and log errors during listing creation', async () => {
        const fakeError = new Error('Create listing failed network error');
        mockCreateHousingListing.mockRejectedValue(fakeError);

        jest.doMock('@/app/actions/housing', () => {
            return {
                __esModule: true,
                createHousingListing: mockCreateHousingListing
            };
        });

        // Suppress console.error
        const originalConsoleError = console.error;
        console.error = jest.fn();

        render(<ProviderClient settlements={[]} dbListings={[]} dbLeads={[]} />);

        // Open modal
        fireEvent.click(screen.getByText('List New Property'));

        // Fill form
        fireEvent.change(screen.getByPlaceholderText(/Property Title/i), { target: { value: 'Test Title' } });
        fireEvent.change(screen.getByPlaceholderText(/Price/i), { target: { value: '1000' } });
        fireEvent.change(screen.getByPlaceholderText(/Location/i), { target: { value: 'Test Location' } });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /Submit Listing/i }));

        // Wait for state to be reset
        await waitFor(() => {
            const submitBtn = screen.getByRole('button', { name: /Submit Listing/i });
            expect(submitBtn).toHaveTextContent('Submit Listing');
        });

        // The error should have been caught and logged
        expect(console.error).toHaveBeenCalledWith(fakeError);

        // Restore console.error
        console.error = originalConsoleError;
    });

    it('should show alert on listing creation failure', async () => {
        mockCreateHousingListing.mockResolvedValue({ success: false, error: 'Custom error message' });

        jest.doMock('@/app/actions/housing', () => {
            return {
                __esModule: true,
                createHousingListing: mockCreateHousingListing
            };
        });

        render(<ProviderClient settlements={[]} dbListings={[]} dbLeads={[]} />);

        // Open modal
        fireEvent.click(screen.getByText('List New Property'));

        // Fill form
        fireEvent.change(screen.getByPlaceholderText(/Property Title/i), { target: { value: 'Test Title' } });
        fireEvent.change(screen.getByPlaceholderText(/Price/i), { target: { value: '1000' } });
        fireEvent.change(screen.getByPlaceholderText(/Location/i), { target: { value: 'Test Location' } });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /Submit Listing/i }));

        // Wait for the alert to be called
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Custom error message');
        });

        // Check state reset
        const submitBtn = screen.getByRole('button', { name: /Submit Listing/i });
        expect(submitBtn).toHaveTextContent('Submit Listing');
    });

    it('should show success alert and close modal on successful listing creation', async () => {
        mockCreateHousingListing.mockResolvedValue({ success: true });

        jest.doMock('@/app/actions/housing', () => {
            return {
                __esModule: true,
                createHousingListing: mockCreateHousingListing
            };
        });

        render(<ProviderClient settlements={[]} dbListings={[]} dbLeads={[]} />);

        // Open modal
        fireEvent.click(screen.getByText('List New Property'));

        // Fill form
        fireEvent.change(screen.getByPlaceholderText(/Property Title/i), { target: { value: 'Test Title' } });
        fireEvent.change(screen.getByPlaceholderText(/Price/i), { target: { value: '1000' } });
        fireEvent.change(screen.getByPlaceholderText(/Location/i), { target: { value: 'Test Location' } });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /Submit Listing/i }));

        // Wait for the success alert
        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Property listed successfully! (Pending approval)');
        });

        // Wait for modal to be closed
        await waitFor(() => {
            expect(screen.queryByText('List New Property', { selector: 'h2' })).not.toBeInTheDocument();
        });
    });
});
