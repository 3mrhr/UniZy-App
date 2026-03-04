import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VerifyIDPage from '../../../../../src/app/(auth)/register/verify-id/page';
import { uploadVerificationDocument } from '../../../../../src/app/actions/verification';
import { getCurrentUser } from '../../../../../src/app/actions/auth';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} fill={props.fill ? "true" : undefined} />;
  },
}));
jest.mock('../../../../../src/app/actions/verification', () => ({
  uploadVerificationDocument: jest.fn(),
}));
jest.mock('../../../../../src/app/actions/auth', () => ({
  getCurrentUser: jest.fn(),
}));
jest.mock('react-hot-toast', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('VerifyIDPage Error Handling', () => {
  let originalCreateObjectURL;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock URL.createObjectURL since it's not available in jsdom
    originalCreateObjectURL = global.URL.createObjectURL;
    global.URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  afterAll(() => {
    if (originalCreateObjectURL) {
        global.URL.createObjectURL = originalCreateObjectURL;
    } else {
        delete global.URL.createObjectURL;
    }
  });

  it('should display an error toast when user is not logged in', async () => {
    // Setup mock to return null for user
    getCurrentUser.mockResolvedValueOnce(null);

    render(<VerifyIDPage />);

    // Upload a file to enable the submit button
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/upload student id/i);
    await userEvent.upload(input, file);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit for verification/i });
    fireEvent.click(submitButton);

    // Assert error toast is called with specific message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please log in first');
    });
  });

  it('should display an error toast when upload verification document throws an error', async () => {
     getCurrentUser.mockResolvedValueOnce({ id: 'user-123' });
     const errorMessage = 'Network Error';
     uploadVerificationDocument.mockRejectedValueOnce(new Error(errorMessage));

     render(<VerifyIDPage />);

     const file = new File(['hello'], 'hello.png', { type: 'image/png' });
     const input = screen.getByLabelText(/upload student id/i);
     await userEvent.upload(input, file);

     const submitButton = screen.getByRole('button', { name: /submit for verification/i });
     fireEvent.click(submitButton);

     await waitFor(() => {
         expect(toast.error).toHaveBeenCalledWith(errorMessage);
     });
  });

  it('should display an error toast when upload verification document returns success: false', async () => {
     getCurrentUser.mockResolvedValueOnce({ id: 'user-123' });
     const apiErrorMessage = 'Invalid document type';
     uploadVerificationDocument.mockResolvedValueOnce({ success: false, error: apiErrorMessage });

     render(<VerifyIDPage />);

     const file = new File(['hello'], 'hello.png', { type: 'image/png' });
     const input = screen.getByLabelText(/upload student id/i);
     await userEvent.upload(input, file);

     const submitButton = screen.getByRole('button', { name: /submit for verification/i });
     fireEvent.click(submitButton);

     await waitFor(() => {
         expect(toast.error).toHaveBeenCalledWith(apiErrorMessage);
     });
  });
});
