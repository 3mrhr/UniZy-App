import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

// Needs to match the sessionOptions to read the cookie in Edge
const sessionOptions = {
    password: process.env.SESSION_SECRET || 'unizy-super-secret-session-key-2026-change-in-production',
    cookieName: 'unizy_session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
};

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Bypass public/static files
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') ||
        pathname === '/' ||
        pathname === '/login' ||
        pathname.startsWith('/register') ||
        pathname.startsWith('/forgot-password') ||
        pathname === '/terms' ||
        pathname === '/privacy' ||
        pathname === '/contact'
    ) {
        return NextResponse.next();
    }

    // Read session using iron-session Edge support
    const res = NextResponse.next();
    const cookieStore = await cookies();
    const session = await getIronSession(cookieStore, sessionOptions);

    const user = session.user;

    // If no user found and hitting a protected route
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // ==== Role Based Routing Guards ====

    // Protect /admin routes
    if (pathname.startsWith('/admin')) {
        if (!user.role.startsWith('ADMIN')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Scope enforcement
        if (user.role !== 'ADMIN_SUPER') {
            const hasScope = (mod) => user.scopes && user.scopes.includes(mod);

            if (pathname.startsWith('/admin/housing') && user.role !== 'ADMIN_HOUSING' && !hasScope('HOUSING')) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            if (pathname.startsWith('/admin/transport') && user.role !== 'ADMIN_TRANSPORT' && !hasScope('TRANSPORT')) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            if (pathname.startsWith('/admin/delivery') && user.role !== 'ADMIN_DELIVERY' && !hasScope('DELIVERY')) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            if (pathname.startsWith('/admin/commerce') && user.role !== 'ADMIN_COMMERCE' && !hasScope('DEALS') && !hasScope('MEALS')) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            if (pathname.startsWith('/admin/services') && !hasScope('SERVICES') && !hasScope('CLEANING')) {
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        }
    }

    // Protect /students routes
    if (pathname.startsWith('/students') ||
        pathname.startsWith('/housing') ||
        pathname.startsWith('/transport') ||
        pathname.startsWith('/delivery') ||
        pathname.startsWith('/deals') ||
        pathname.startsWith('/meals') ||
        pathname.startsWith('/hub') ||
        pathname.startsWith('/services') ||
        pathname.startsWith('/rewards') ||
        pathname.startsWith('/activity')
    ) {
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
