import { describe, it, expect, vi, beforeEach } from 'vitest';
import { middleware } from './middleware';
import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

vi.mock('next/server', () => {
    return {
        NextResponse: {
            next: vi.fn(() => ({ type: 'next' })),
            redirect: vi.fn((url) => ({ type: 'redirect', url: url.toString() })),
        },
    };
});

vi.mock('next/headers', () => {
    return {
        cookies: vi.fn(() => ({})),
    };
});

vi.mock('iron-session', () => {
    return {
        getIronSession: vi.fn(),
    };
});

describe('middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const createRequest = (pathname) => ({
        nextUrl: { pathname },
        url: `http://localhost${pathname}`,
    });

    it('should bypass public paths', async () => {
        const publicPaths = ['/_next/static/css/app.css', '/login', '/admin/login', '/register', '/forgot-password', '/terms', '/privacy', '/contact', '/'];

        for (const path of publicPaths) {
            const req = createRequest(path);
            const res = await middleware(req);
            expect(res).toEqual({ type: 'next' });
            expect(NextResponse.next).toHaveBeenCalled();
            expect(getIronSession).not.toHaveBeenCalled();
            vi.clearAllMocks();
        }
    });

    it('should redirect unauthenticated users to /login', async () => {
        getIronSession.mockResolvedValueOnce({ user: null });

        const req = createRequest('/students');
        const res = await middleware(req);

        expect(res).toEqual({ type: 'redirect', url: 'http://localhost/login' });
        expect(NextResponse.redirect).toHaveBeenCalledWith(new URL('http://localhost/login'));
    });

    it('should redirect non-admin users trying to access /admin', async () => {
        getIronSession.mockResolvedValueOnce({ user: { role: 'STUDENT' } });

        const req = createRequest('/admin/dashboard');
        const res = await middleware(req);

        expect(res).toEqual({ type: 'redirect', url: 'http://localhost/login' });
    });

    it('should allow ADMIN_SUPER to access any admin route', async () => {
        getIronSession.mockResolvedValueOnce({ user: { role: 'ADMIN_SUPER' } });

        const req = createRequest('/admin/housing');
        const res = await middleware(req);

        expect(res).toEqual({ type: 'next' });
    });

    it('should redirect restricted admins without correct scopes to /admin', async () => {
        const testCases = [
            { path: '/admin/housing', role: 'ADMIN_SUPPORT', scopes: [] },
            { path: '/admin/transport', role: 'ADMIN_SUPPORT', scopes: ['HOUSING'] },
            { path: '/admin/delivery', role: 'ADMIN_SUPPORT', scopes: [] },
            { path: '/admin/commerce', role: 'ADMIN_SUPPORT', scopes: [] },
            { path: '/admin/services', role: 'ADMIN_SUPPORT', scopes: [] },
        ];

        for (const { path, role, scopes } of testCases) {
            getIronSession.mockResolvedValueOnce({ user: { role, scopes } });

            const req = createRequest(path);
            const res = await middleware(req);

            expect(res).toEqual({ type: 'redirect', url: 'http://localhost/admin' });
            vi.clearAllMocks();
        }
    });

    it('should allow restricted admins with correct scopes or specific admin role', async () => {
        const testCases = [
            { path: '/admin/housing', role: 'ADMIN_HOUSING', scopes: [] },
            { path: '/admin/housing', role: 'ADMIN_SUPPORT', scopes: ['HOUSING'] },
            { path: '/admin/transport', role: 'ADMIN_TRANSPORT', scopes: [] },
            { path: '/admin/transport', role: 'ADMIN_SUPPORT', scopes: ['TRANSPORT'] },
            { path: '/admin/delivery', role: 'ADMIN_DELIVERY', scopes: [] },
            { path: '/admin/delivery', role: 'ADMIN_SUPPORT', scopes: ['DELIVERY'] },
            { path: '/admin/commerce', role: 'ADMIN_COMMERCE', scopes: [] },
            { path: '/admin/commerce', role: 'ADMIN_SUPPORT', scopes: ['DEALS'] },
            { path: '/admin/commerce', role: 'ADMIN_SUPPORT', scopes: ['MEALS'] },
            { path: '/admin/services', role: 'ADMIN_SUPPORT', scopes: ['SERVICES'] },
            { path: '/admin/services', role: 'ADMIN_SUPPORT', scopes: ['CLEANING'] },
        ];

        for (const { path, role, scopes } of testCases) {
            getIronSession.mockResolvedValueOnce({ user: { role, scopes } });

            const req = createRequest(path);
            const res = await middleware(req);

            expect(res).toEqual({ type: 'next' });
            vi.clearAllMocks();
        }
    });

    it('should redirect non-student users accessing student routes to /login', async () => {
        const studentPaths = [
            '/students', '/housing', '/transport', '/delivery',
            '/deals', '/meals', '/hub', '/services', '/rewards', '/activity'
        ];

        for (const path of studentPaths) {
            getIronSession.mockResolvedValueOnce({ user: { role: 'DRIVER' } });

            const req = createRequest(path);
            const res = await middleware(req);

            expect(res).toEqual({ type: 'redirect', url: 'http://localhost/login' });
            vi.clearAllMocks();
        }
    });

    it('should allow STUDENT to access student routes', async () => {
        getIronSession.mockResolvedValueOnce({ user: { role: 'STUDENT' } });

        const req = createRequest('/students/dashboard');
        const res = await middleware(req);

        expect(res).toEqual({ type: 'next' });
    });

    it('should enforce DRIVER role for driver portal', async () => {
        getIronSession.mockResolvedValueOnce({ user: { role: 'STUDENT' } });
        const reqFail = createRequest('/driver');
        const resFail = await middleware(reqFail);
        expect(resFail).toEqual({ type: 'redirect', url: 'http://localhost/login' });

        getIronSession.mockResolvedValueOnce({ user: { role: 'DRIVER' } });
        const reqPass = createRequest('/driver');
        const resPass = await middleware(reqPass);
        expect(resPass).toEqual({ type: 'next' });
    });

    it('should enforce PROVIDER role for provider portal', async () => {
        getIronSession.mockResolvedValueOnce({ user: { role: 'STUDENT' } });
        const reqFail = createRequest('/provider');
        const resFail = await middleware(reqFail);
        expect(resFail).toEqual({ type: 'redirect', url: 'http://localhost/login' });

        getIronSession.mockResolvedValueOnce({ user: { role: 'PROVIDER' } });
        const reqPass = createRequest('/provider');
        const resPass = await middleware(reqPass);
        expect(resPass).toEqual({ type: 'next' });
    });

    it('should enforce MERCHANT role for merchant portal', async () => {
        getIronSession.mockResolvedValueOnce({ user: { role: 'STUDENT' } });
        const reqFail = createRequest('/merchant');
        const resFail = await middleware(reqFail);
        expect(resFail).toEqual({ type: 'redirect', url: 'http://localhost/login' });

        getIronSession.mockResolvedValueOnce({ user: { role: 'MERCHANT' } });
        const reqPass = createRequest('/merchant');
        const resPass = await middleware(reqPass);
        expect(resPass).toEqual({ type: 'next' });
    });
});
