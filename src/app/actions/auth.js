'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { logEvent } from './analytics';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

async function getClientIp() {
    const headerList = await headers();
    return headerList.get('x-forwarded-for') || '127.0.0.1';
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

        const session = await getSession();
        session.user = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified || false,
            scopes: Array.isArray(parsedScopes) ? parsedScopes : [],
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
            referralCode
        } = data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: 'Email already in use' };
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
        const token = crypto.randomBytes(32).toString('hex');

        // Create reset record (expires in 1 hour)
        await prisma.passwordReset.create({
            data: {
                email,
                token,
                expiresAt: new Date(Date.now() + 3600000), // 1 hour
            }
        });

        // In production, send email with reset link
        // For now, return the token directly so the user can use it

        return { success: true, token, message: 'Reset token generated. Check server console in dev mode.' };
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
