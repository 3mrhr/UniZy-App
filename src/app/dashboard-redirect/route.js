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
    const role = user.role;

    // GUEST -> Food/Delivery Entry
    if (role === 'GUEST') {
        return NextResponse.redirect(new URL('/meals', request.url));
    }

    // STUDENT -> Student Hub
    if (role === 'STUDENT') {
        return NextResponse.redirect(new URL('/students', request.url));
    }

    // ADMINS -> Admin Panel
    if (role.startsWith('ADMIN_')) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // SUPPLY-SIDE PARTNERS (Unified Portal)
    const providerRoles = ['HOUSE_OWNER', 'SERVICE_PROVIDER', 'CLEANER'];
    if (providerRoles.includes(role)) {
        return NextResponse.redirect(new URL('/provider', request.url));
    }

    // MERCHANT -> Merchant Portal
    if (role === 'MERCHANT') {
        return NextResponse.redirect(new URL('/merchant', request.url));
    }

    // DRIVER -> Driver Portal
    if (role === 'DRIVER') {
        return NextResponse.redirect(new URL('/driver', request.url));
    }

    // Fallback to home if role is unknown or GUEST default
    return NextResponse.redirect(new URL('/', request.url));
}
