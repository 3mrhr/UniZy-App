import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

// Needs to match the sessionOptions in src/lib/session.js exactly
const sessionOptions = {
    password: process.env.SESSION_SECRET,
    cookieName: 'unizy_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
};

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Bypass public/static files and login routes
    if (
        pathname.startsWith('/_next') ||
        pathname.includes('.') ||
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/admin/login' ||
        pathname === '/dashboard' ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/forgot-password') ||
        pathname === '/terms' ||
        pathname === '/privacy' ||
        pathname === '/contact'
    ) {
        return NextResponse.next();
    }

    // Read session using iron-session Edge support over Response/Request natively
    const res = NextResponse.next();
    const session = await getIronSession(request, res, sessionOptions);
    const user = session.user;

    // If no user found and hitting a protected route
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // ==== Role Based Routing Guards ====

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
        if (!user.role.startsWith('ADMIN_')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Scope enforcement for restricted admins
        if (user.role !== 'ADMIN_SUPER') {
            const hasScope = (mod) => Array.isArray(user.scopes) && user.scopes.includes(mod);

            const adminRoutes = [
                { path: '/admin/housing', role: 'ADMIN_HOUSING', scopes: ['HOUSING'] },
                { path: '/admin/transport', role: 'ADMIN_TRANSPORT', scopes: ['TRANSPORT'] },
                { path: '/admin/delivery', role: 'ADMIN_DELIVERY', scopes: ['DELIVERY'] },
                { path: '/admin/commerce', role: 'ADMIN_COMMERCE', scopes: ['DEALS', 'MEALS'] },
                { path: '/admin/services', role: null, scopes: ['SERVICES', 'CLEANING'] },
            ];

            const matchedRoute = adminRoutes.find((route) => pathname.startsWith(route.path));
            if (matchedRoute) {
                const hasRole = matchedRoute.role ? user.role === matchedRoute.role : false;
                const hasRequiredScope = matchedRoute.scopes.some(hasScope);

                if (!hasRole && !hasRequiredScope) {
                    return NextResponse.redirect(new URL('/admin', request.url));
                }
            }
        }
    }

    // Protect /students routes
    const studentRoutes = [
        '/students', '/housing', '/transport', '/delivery',
        '/deals', '/meals', '/hub', '/services',
        '/rewards', '/activity'
    ];

    if (studentRoutes.some((route) => pathname.startsWith(route))) {
        if (user.role !== 'STUDENT') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Protect Service Portals
    if (pathname.startsWith('/driver') && user.role !== 'DRIVER') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/provider') && user.role !== 'PROVIDER') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname.startsWith('/merchant') && user.role !== 'MERCHANT') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return res;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
