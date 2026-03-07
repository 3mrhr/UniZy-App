import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { getSessionOptions } from '@/lib/sessionOptions';

export async function GET(request) {
    const res = new NextResponse();
    const session = await getIronSession(request, res, getSessionOptions());
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
