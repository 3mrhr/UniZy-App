'use server';

import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { logEvent } from './analytics';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { createNotification } from './notifications';

async function getClientIp() {
    const headerList = await headers();
    return headerList.get('x-forwarded-for') || '127.0.0.1';
}

/**
 * Validates password strength: 8+ chars, 1 uppercase, 1 lowercase, 1 number.
 */
function validatePassword(password) {
    const schema = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,}$/;
    return schema.test(password);
}

export async function loginUser(username, password) {
    try {
        const ip = await getClientIp();
        const rl = await rateLimit(`login:${ip}`, 5, 60000); // 5 attempts per minute
        if (!rl.success) {
            return { error: 'Too many login attempts. Please try again in a minute.' };
        }

        // Standard DB check
        const user = await prisma.user.findUnique({
            where: { email: username }
        });

        if (!user) {
            return { error: 'Invalid credentials' };
        }

        if (user.status === 'BANNED' || user.status === 'SUSPENDED') {
            return { error: 'Your account has been suspended or banned. Please contact support.' };
        }

        // Compare hashed password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { error: 'Invalid credentials' };
        }

        let parsedScopes = [];
        try {
            if (user.scopes) {
                // Prisma handles the JSON parsing natively now, so we just ensure it's an array
                parsedScopes = Array.isArray(user.scopes) ? user.scopes : [];
            }
        } catch (e) {
            console.error('Failed to parse user scopes:', e);
        }

        if (user.mfaEnabled) {
            // If MFA is enabled, we don't create the session yet.
            // We return a "MFA_REQUIRED" flag to the client.
            return {
                success: true,
                mfaRequired: true,
                userId: user.id
            };
        }

        const session = await getSession();
        const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000); // 1 week

        // Create DB-backed session
        const dbSession = await prisma.session.create({
            data: {
                userId: user.id,
                token: crypto.randomBytes(32).toString('hex'),
                userAgent: (await headers()).get('user-agent'),
                ipAddress: ip,
                expiresAt: expiresAt,
            }
        });

        session.user = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified || false,
            scopes: Array.isArray(parsedScopes) ? parsedScopes : [],
            sessionId: dbSession.id, // Store sessionId to allow revocation
        };
        await session.save();

        return { success: true, role: user.role };
    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Something went wrong during login.' };
    }
}

export async function registerUser(data) {
    try {
        const ip = await getClientIp();
        const rl = await rateLimit(`register:${ip}`, 3, 3600000); // 3 registrations per hour
        if (!rl.success) {
            return { error: 'Registration limit reached. Please try later.' };
        }
        const {
            name,
            email,
            password,
            phone,
            role,
            university,
            faculty,
            academicYear,
            gender,
            age,
            referralCode
        } = data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: 'Email already in use' };
        }

        // Validate password strength
        if (!validatePassword(password)) {
            return { error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' };
        }

        // Hash password with bcrypt (10 salt rounds)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate unique referral code for this user
        const userReferralCode = `UNI-${name.replace(/\s/g, '').substring(0, 3).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;

        // Create user with hashed password
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone: phone || null,
                role: role || 'STUDENT',
                university: university || 'Assiut University',
                faculty: faculty || null,
                academicYear: academicYear || null,
                gender: gender || null,
                age: age ? parseInt(age) : null,
                referralCode: userReferralCode,
                isVerified: false,
            }
        });

        // Process referral if a code was provided
        if (referralCode) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode: referralCode }
            });

            // Basic Fraud Prevention: Block self-referral (highly unlikely via code but good to have)
            // and check if referrer exists.
            if (referrer && referrer.id !== newUser.id) {
                // Create a PENDING referral record.
                // Points will be awarded only after the new user completes their first transaction.
                await prisma.referral.create({
                    data: {
                        code: referralCode,
                        referrerId: referrer.id,
                        referredId: newUser.id,
                        status: 'PENDING',
                        pointsAwarded: 50, // This is the reward for the referrer
                    }
                });

                // Notify referrer immediately that a friend joined
                try {
                    await createNotification(
                        referrer.id,
                        'Friend Joined! 👋',
                        `${newUser.name} just joined UniZy using your code. You'll get 50 points after their first order!`,
                        'REFERRAL'
                    );
                } catch (_) { }
            }
        }

        // Set session
        const session = await getSession();
        session.user = {
            id: newUser.id,
            role: newUser.role,
            name: newUser.name,
            email: newUser.email,
            isVerified: newUser.isVerified || false,
        };
        await session.save();

        // Log analytics event
        await logEvent('SIGNUP', newUser.id, { role: newUser.role });

        return { success: true, role: newUser.role };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Failed to register user.' };
    }
}

export async function logoutUser() {
    const session = await getSession();
    if (session.user?.sessionId) {
        try {
            await prisma.session.delete({
                where: { id: session.user.sessionId }
            });
        } catch (e) {
            console.error("Failed to delete DB session on logout:", e);
        }
    }
    session.destroy();
    return { success: true };
}

export async function getCurrentUser() {
    const session = await getSession();
    if (!session.user) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { status: true, isVerified: true }
        });

        if (!user || user.status !== 'ACTIVE') {
            session.destroy();
            return null;
        }

        // Verify DB session
        if (session.user.sessionId) {
            const dbSession = await prisma.session.findUnique({
                where: { id: session.user.sessionId }
            });
            if (!dbSession || new Date() > dbSession.expiresAt) {
                session.destroy();
                return null;
            }
        }

        // Sync isVerified in case it changed since login
        if (session.user.isVerified !== user.isVerified) {
            session.user.isVerified = user.isVerified;
            await session.save();
        }
    } catch (e) {
        console.error("Session revalidation failed:", e);
    }

    return session.user;
}

export async function requestPasswordReset(email) {
    try {
        const ip = await getClientIp();
        const rl = await rateLimit(`pwd-reset:${ip}`, 3, 3600000); // 3 per hour
        if (!rl.success) {
            return { error: 'Too many reset requests. Please try later.' };
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal if email exists — always return success for security
            return { success: true, message: 'If that email exists, a reset link has been generated.' };
        }

        // Generate a random token
        const token = `${Date.now().toString(36)}-${crypto.randomBytes(16).toString('hex')}`;

        // Create reset record (expires in 1 hour)
        await prisma.passwordReset.create({
            data: {
                email,
                token,
                expiresAt: new Date(Date.now() + 3600000), // 1 hour
            }
        });

        // In production, send email with reset link.
        // For security, never return the token directly to the client.
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV] Password reset token for ${email}: ${token}`);
        }

        return { success: true, message: 'If that email exists, a reset link has been generated.' };
    } catch (error) {
        console.error('Password reset request error:', error);
        return { error: 'Failed to process reset request.' };
    }
}

export async function resetPassword(token, newPassword) {
    try {
        const resetRecord = await prisma.passwordReset.findUnique({ where: { token } });

        if (!resetRecord) {
            return { error: 'Invalid or expired reset token.' };
        }

        if (resetRecord.used) {
            return { error: 'This reset token has already been used.' };
        }

        if (new Date() > resetRecord.expiresAt) {
            return { error: 'This reset token has expired. Please request a new one.' };
        }

        // Validate password strength
        if (!validatePassword(newPassword)) {
            return { error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.' };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { email: resetRecord.email },
                data: { password: hashedPassword }
            }),
            prisma.passwordReset.update({
                where: { id: resetRecord.id },
                data: { used: true }
            })
        ]);

        return { success: true, message: 'Password updated successfully.' };
    } catch (error) {
        console.error('Password reset error:', error);
        return { error: 'Failed to reset password.' };
    }
}

/**
 * MFA: Generate a new secret and QR code for setup.
 */
export async function generateMFASecret() {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Unauthorized' };

        const { authenticator } = await import('otplib');
        const qrcode = await import('qrcode');

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, 'UniZy', secret);
        const qrDataURL = await qrcode.toDataURL(otpauth);

        return { success: true, secret, qrDataURL };
    } catch (error) {
        console.error('MFA Secret generation error:', error);
        return { error: 'Failed to generate MFA secret.' };
    }
}

/**
 * MFA: Verify a token and enable MFA for the user.
 */
export async function verifyAndEnableMFA(secret, token) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Unauthorized' };

        const { authenticator } = await import('otplib');
        const isValid = authenticator.verify({ token, secret });

        if (!isValid) {
            return { error: 'Invalid verification token.' };
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                mfaEnabled: true,
                mfaSecret: secret
            }
        });

        return { success: true };
    } catch (error) {
        console.error('MFA Enable error:', error);
        return { error: 'Failed to enable MFA.' };
    }
}

/**
 * MFA: Verify token during login.
 */
export async function verifyMFALogin(userId, token) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.mfaEnabled || !user.mfaSecret) {
            return { error: 'MFA not enabled or user not found.' };
        }

        const { authenticator } = await import('otplib');
        const isValid = authenticator.verify({ token, secret: user.mfaSecret });

        if (!isValid) {
            return { error: 'Invalid MFA token.' };
        }

        // Logic to create session (same as in loginUser)
        const ip = await getClientIp();
        const session = await getSession();
        const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000);

        const dbSession = await prisma.session.create({
            data: {
                userId: user.id,
                token: crypto.randomBytes(32).toString('hex'),
                userAgent: (await headers()).get('user-agent'),
                ipAddress: ip,
                expiresAt: expiresAt,
            }
        });

        let parsedScopes = Array.isArray(user.scopes) ? user.scopes : [];

        session.user = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified || false,
            scopes: parsedScopes,
            sessionId: dbSession.id,
        };
        await session.save();

        return { success: true, role: user.role };
    } catch (error) {
        console.error('MFA Login Verification error:', error);
        return { error: 'MFA verification failed.' };
    }
}

/**
 * Session Management: List all active sessions for the current user.
 */
export async function getActiveSessions() {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Unauthorized' };

        const sessions = await prisma.session.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                userAgent: true,
                ipAddress: true,
                createdAt: true,
                expiresAt: true
            }
        });

        return { success: true, sessions };
    } catch (error) {
        console.error('Get sessions error:', error);
        return { error: 'Failed to fetch active sessions.' };
    }
}

/**
 * Session Management: Revoke a specific session.
 */
export async function revokeSession(sessionId) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Unauthorized' };

        // Ensure session belongs to user
        const session = await prisma.session.findUnique({
            where: { id: sessionId }
        });

        if (!session || session.userId !== user.id) {
            return { error: 'Session not found or unauthorized.' };
        }

        await prisma.session.delete({
            where: { id: sessionId }
        });

        return { success: true };
    } catch (error) {
        console.error('Revoke session error:', error);
        return { error: 'Failed to revoke session.' };
    }
}

/**
 * Session Management: Revoke all OTHER sessions.
 */
export async function revokeOtherSessions() {
    try {
        const user = await getCurrentUser();
        if (!user || !user.sessionId) return { error: 'Unauthorized' };

        await prisma.session.deleteMany({
            where: {
                userId: user.id,
                id: { not: user.sessionId }
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Revoke other sessions error:', error);
        return { error: 'Failed to revoke other sessions.' };
    }
}
