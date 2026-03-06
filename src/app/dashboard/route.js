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

export async function GET(request) {
    const res = new NextResponse();
    const session = await getIronSession(request, res, sessionOptions);
    const user = session.user;

    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Role-based redirection
    if (user.role === 'STUDENT') {
        return NextResponse.redirect(new URL('/students', request.url));
    }

    if (user.role.startsWith('ADMIN_')) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    if (user.role === 'DRIVER') {
        return NextResponse.redirect(new URL('/driver', request.url));
    }

    if (user.role === 'MERCHANT') {
        return NextResponse.redirect(new URL('/merchant', request.url));
    }

    if (user.role === 'PROVIDER') {
        return NextResponse.redirect(new URL('/provider', request.url));
    }

    // Fallback to home if role is unknown
    return NextResponse.redirect(new URL('/', request.url));
}
