import { NextResponse } from 'next/server';
import { handleOAuthLogin } from '@/app/actions/oauth';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const redirect_uri = `${baseUrl}/api/auth/callback/google`;

        // 1. Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
            console.error('Google token exchange error:', tokens);
            return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
        }

        // 2. Fetch user profile
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const profile = await profileResponse.json();

        // 3. Sync with DB and establish session
        const result = await handleOAuthLogin({
            email: profile.email,
            name: profile.name,
            providerAccountId: profile.id,
        }, 'google');

        if (result.success) {
            const redirectUrl = result.role === 'STUDENT' ? '/students' : '/admin';
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        } else {
            return NextResponse.redirect(new URL(`/login?error=${result.error || 'auth_failed'}`, request.url));
        }

    } catch (err) {
        console.error('Google OAuth Callback Error:', err);
        return NextResponse.redirect(new URL('/login?error=server_error', request.url));
    }
}
