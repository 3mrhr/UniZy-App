import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../page';
import { registerUser } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/app/actions/auth', () => ({
    registerUser: jest.fn(),
}));

jest.mock('@/app/actions/verification', () => ({
    requestOTP: jest.fn(),
}));

jest.mock('@/i18n/LanguageProvider', () => ({
    useLanguage: () => ({ dict: {} }),
}));

jest.mock('@/components/ThemeLangControls', () => {
    return function MockThemeLangControls() {
        return <div data-testid="theme-lang-controls"></div>;
    };
});

describe('Register Page', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useRouter.mockReturnValue({ push: jest.fn() });
    });

    it('handles registration error when API throws an exception', async () => {
        // Arrange
        registerUser.mockRejectedValue(new Error('Network error'));

        render(<Register />);

        // Fill out form
        fireEvent.change(screen.getByPlaceholderText('Omar Hassan'), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByPlaceholderText('omar@example.com'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('01012345678'), { target: { value: '01012345678' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText('Engineering'), { target: { value: 'Engineering' } });
        fireEvent.change(screen.getByText('Select Year').closest('select'), { target: { value: '1st Year' } });

        // Submit
        const submitButton = screen.getByRole('button', { name: /continue to verify/i });
        fireEvent.click(submitButton);

        // Assert
        await waitFor(() => {
            expect(screen.getByText('An error occurred during registration.')).toBeInTheDocument();
        });

        // Loading state should be reset
        expect(submitButton).not.toBeDisabled();
    });
});
