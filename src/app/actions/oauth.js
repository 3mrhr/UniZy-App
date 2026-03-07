'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';

/**
 * Generates the authorization URL for the chosen provider.
 */
export async function getOAuthUrl(provider) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/api/auth/callback/${provider}`;

    if (provider === 'google') {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            redirect_uri: callbackUrl,
            client_id: process.env.GOOGLE_CLIENT_ID,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ].join(' '),
        };
        const qs = new URLSearchParams(options);
        return { url: `${rootUrl}?${qs.toString()}` };
    }

    if (provider === 'apple') {
        const rootUrl = 'https://appleid.apple.com/auth/authorize';
        const options = {
            client_id: process.env.APPLE_CLIENT_ID,
            redirect_uri: callbackUrl,
            response_type: 'code',
            scope: 'name email',
            response_mode: 'form_post', // Apple often requires form_post for name/email
        };
        const qs = new URLSearchParams(options);
        return { url: `${rootUrl}?${qs.toString()}` };
    }

    return { error: 'Invalid provider' };
}

/**
 * Handles the logic after a successful OAuth provider callback.
 * This is generic and can be used by both Google and Apple.
 * @param {Object} authProfile - The profile returned by the provider (Google/Apple)
 * @param {string} provider - 'google' or 'apple'
 */
export async function handleOAuthLogin(authProfile, provider) {
    const { email, name, providerAccountId } = authProfile;

    try {
        // 1. Check if an account already exists for this provider/id
        let account = await prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider,
                    providerAccountId,
                }
            },
            include: { user: true }
        });

        let user;

        if (account) {
            user = account.user;
        } else {
            // 2. Check if a user with this email already exists
            user = await prisma.user.findUnique({ where: { email } });

            if (!user) {
                // 3. Create a new user if not exists
                // Note: We generate a random password since OAuth users don't need one initially
                const randomPassword = crypto.randomBytes(32).toString('hex');
                const hashedPassword = await bcrypt.hash(randomPassword, 10);
                const userReferralCode = `UNI-${name.replace(/\s/g, '').substring(0, 3).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;

                user = await prisma.user.create({
                    data: {
                        email,
                        name,
                        password: hashedPassword,
                        role: 'STUDENT',
                        referralCode: userReferralCode,
                        isVerified: true, // Social accounts are trusted emails
                    }
                });
            }

            // 4. Link the account to the user
            await prisma.account.create({
                data: {
                    userId: user.id,
                    provider,
                    providerAccountId,
                    type: 'oauth',
                }
            });
        }

        if (user.status === 'BANNED') {
            return { success: false, error: 'Account is banned.' };
        }

        // 5. Establish Session (same logic as loginUser)
        const session = await getSession();
        const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
        const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000);

        const dbSession = await prisma.session.create({
            data: {
                userId: user.id,
                token: crypto.randomBytes(32).toString('hex'),
                userAgent: (await headers()).get('user-agent'),
                ipAddress: ip,
                expiresAt,
            }
        });

        session.user = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            isVerified: true,
            sessionId: dbSession.id,
        };
        await session.save();

        return { success: true, role: user.role };
    } catch (error) {
        console.error(`OAuth login error (${provider}):`, error);
        return { success: false, error: 'Failed to authenticate with social account.' };
    }
}
