'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';
import { logEvent } from './analytics';

export async function loginUser(username, password) {
    try {
        // -----------------------------------------------------------------

        // Standard DB check
        const user = await prisma.user.findUnique({
            where: { email: username }
        });

        if (!user) {
            return { error: 'Invalid credentials' };
        }

        // Compare hashed password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return { error: 'Invalid credentials' };
        }

        const session = await getSession();
        session.user = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            scopes: user.scopes ? JSON.parse(user.scopes) : [],
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
    return session.user || null;
}

export async function requestPasswordReset(email) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Don't reveal if email exists — always return success for security
            return { success: true, message: 'If that email exists, a reset link has been generated.' };
        }

        // Generate a random token
        const token = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 15)}`;

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
        console.log(`[DEV] Password reset token for ${email}: ${token}`);

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
