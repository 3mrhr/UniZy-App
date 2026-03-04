// Mock dependencies
jest.mock('iron-session', () => ({
  getIronSession: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('getSession', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv, SESSION_SECRET: 'test-secret-that-is-at-least-32-chars-long' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should call cookies and getIronSession with correct parameters', async () => {
    // Require dependencies after env vars are set
    const { getIronSession } = require('iron-session');
    const { cookies } = require('next/headers');
    const { getSession } = require('../session');

    // Setup mocks
    const mockCookieStore = { name: 'mockStore' };
    const mockSession = { user: { id: 1, role: 'admin' } };

    cookies.mockResolvedValue(mockCookieStore);
    getIronSession.mockResolvedValue(mockSession);

    // Execute
    const result = await getSession();

    // Verify
    expect(cookies).toHaveBeenCalledTimes(1);

    // Verify getIronSession was called with the cookie store and correct options
    expect(getIronSession).toHaveBeenCalledTimes(1);
    expect(getIronSession).toHaveBeenCalledWith(mockCookieStore, expect.objectContaining({
      password: process.env.SESSION_SECRET,
      cookieName: 'unizy_session',
      cookieOptions: expect.objectContaining({
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
      }),
    }));

    // Verify it returns the session object from getIronSession
    expect(result).toBe(mockSession);
  });

  it('should set secure cookie option based on NODE_ENV', async () => {
    const { getIronSession } = require('iron-session');
    const { cookies } = require('next/headers');

    const mockCookieStore = { name: 'mockStore' };
    cookies.mockResolvedValue(mockCookieStore);

    // Test for production environment
    process.env.NODE_ENV = 'production';

    // Require after setting env
    jest.resetModules();
    const ironProd = require('iron-session');
    const cookiesProd = require('next/headers').cookies;
    cookiesProd.mockResolvedValue(mockCookieStore);

    const { getSession: getSessionProd } = require('../session');

    await getSessionProd();

    expect(ironProd.getIronSession).toHaveBeenCalledWith(mockCookieStore, expect.objectContaining({
      cookieOptions: expect.objectContaining({
        secure: true,
      }),
    }));

    // Test for non-production environment
    process.env.NODE_ENV = 'development';

    // Require after setting env
    jest.resetModules();
    const ironDev = require('iron-session');
    const cookiesDev = require('next/headers').cookies;
    cookiesDev.mockResolvedValue(mockCookieStore);

    const { getSession: getSessionDev } = require('../session');

    await getSessionDev();

    expect(ironDev.getIronSession).toHaveBeenCalledWith(mockCookieStore, expect.objectContaining({
      cookieOptions: expect.objectContaining({
        secure: false,
      }),
    }));
  });
});
