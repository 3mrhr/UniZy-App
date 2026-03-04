import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../page';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/app/actions/auth';
import { useLanguage } from '@/i18n/LanguageProvider';

// Mock the hooks and actions
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/app/actions/auth', () => ({
  loginUser: jest.fn(),
}));

jest.mock('@/i18n/LanguageProvider', () => ({
  useLanguage: jest.fn(),
}));

// Mock the ThemeLangControls component
jest.mock('@/components/ThemeLangControls', () => {
  return function MockThemeLangControls() {
    return <div data-testid="theme-lang-controls">ThemeLangControls</div>;
  };
});

describe('Login Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    useRouter.mockReturnValue({
      push: mockPush,
    });

    useLanguage.mockReturnValue({
      dict: {
        auth: {
          email: 'Email',
          password: 'Password',
          login: 'Sign In',
        },
        common: {
          appName: 'UniZy',
        },
      },
      locale: 'en',
    });
  });

  it('handles result.error properly', async () => {
    // Mock loginUser to return an error object
    const errorMessage = 'Invalid credentials';
    loginUser.mockResolvedValueOnce({ error: errorMessage });

    render(<Login />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Verify loginUser was called with correct credentials
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Verify router.push was not called
    expect(mockPush).not.toHaveBeenCalled();

    // Ensure loading state is reset
    expect(screen.getByRole('button', { name: /Sign In/i })).not.toHaveClass('cursor-not-allowed');
  });

  it('handles thrown errors in try/catch block properly', async () => {
    // Mock loginUser to throw an exception
    loginUser.mockRejectedValueOnce(new Error('Network error'));

    render(<Login />);

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Verify loginUser was called
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    // Verify default error message from catch block is displayed
    await waitFor(() => {
      expect(screen.getByText('An error occurred during login')).toBeInTheDocument();
    });

    // Verify router.push was not called
    expect(mockPush).not.toHaveBeenCalled();

    // Ensure loading state is reset
    expect(screen.getByRole('button', { name: /Sign In/i })).not.toHaveClass('cursor-not-allowed');
  });
});
