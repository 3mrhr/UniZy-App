import { requestPasswordReset } from '../auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    passwordReset: {
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/rate-limit', () => ({
  rateLimit: jest.fn(),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({
    get: jest.fn().mockReturnValue('127.0.0.1'),
  }),
}));

describe('Auth Actions - requestPasswordReset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rateLimit.mockResolvedValue({ success: true });
  });

  it('should not return the token when a reset is requested for an existing user', async () => {
    const email = 'test@example.com';
    prisma.user.findUnique.mockResolvedValue({ id: 'user-123', email });
    prisma.passwordReset.create.mockResolvedValue({ id: 'reset-123' });

    const result = await requestPasswordReset(email);

    expect(result.success).toBe(true);
    expect(result.token).toBeUndefined();
    expect(result.message).toBe('If that email exists, a reset link has been generated.');
    expect(prisma.passwordReset.create).toHaveBeenCalled();
  });

  it('should return the same success message even if the user does not exist', async () => {
    const email = 'nonexistent@example.com';
    prisma.user.findUnique.mockResolvedValue(null);

    const result = await requestPasswordReset(email);

    expect(result.success).toBe(true);
    expect(result.token).toBeUndefined();
    expect(result.message).toBe('If that email exists, a reset link has been generated.');
    expect(prisma.passwordReset.create).not.toHaveBeenCalled();
  });
});
