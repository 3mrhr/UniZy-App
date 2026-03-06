// We use standard jest mocks, because `next/jest` transpiles this as CommonJS.

// Set up process.env BEFORE requiring the module under test so that
// top-level constants in `session.js` (like sessionOptions) get the configured env vars
process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-chars-long';

// Mock dependencies
jest.mock('iron-session', () => ({
  getIronSession: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Require the actual dependencies and module to test
const { getIronSession } = require('iron-session');
const { cookies } = require('next/headers');
const { getSession } = require('../session');

describe('getSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call cookies and getIronSession with correct parameters', async () => {
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

    // In next/jest SWC, process.env.NODE_ENV is hardcoded as 'test'.
    // The compiled module `session.js` will evaluate `secure: 'test' === 'production'` to false.
    expect(getIronSession).toHaveBeenCalledWith(mockCookieStore, expect.objectContaining({
      password: process.env.SESSION_SECRET,
      cookieName: 'unizy_session',
      cookieOptions: expect.objectContaining({
        httpOnly: true,
        secure: false, // The test runner statically transpiles `process.env.NODE_ENV === 'production'` to false
        maxAge: 60 * 60 * 24 * 7, // 1 week
      }),
    }));

    // Verify it returns the session object from getIronSession
    expect(result).toBe(mockSession);
  });

  it('should propagate errors if cookies() fails', async () => {
    const error = new Error('Cookies error');
    cookies.mockImplementation(() => { throw error; });

    await expect(getSession()).rejects.toThrow('Cookies error');
    expect(cookies).toHaveBeenCalledTimes(1);
    expect(getIronSession).not.toHaveBeenCalled();
  });

  it('should propagate errors if getIronSession() fails', async () => {
    const mockCookieStore = { name: 'mockStore' };
    const error = new Error('Session error');

    // Support both sync and async returns for cookies() depending on Next.js version mocked
    cookies.mockReturnValue(Promise.resolve(mockCookieStore));
    getIronSession.mockRejectedValue(error);

    await expect(getSession()).rejects.toThrow('Session error');
    expect(cookies).toHaveBeenCalledTimes(1);
    expect(getIronSession).toHaveBeenCalledTimes(1);
  });
});