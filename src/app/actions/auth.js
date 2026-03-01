'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function loginUser(username, password) {
    try {
        // --- 🚀 Dev-mode bypass for role testing ---
        const roleString = username.toUpperCase();

        if (roleString.includes('ADMIN') || roleString === 'DRIVER' || roleString === 'LANDLORD' || roleString === 'MERCHANT') {
            const role = roleString === 'LANDLORD' ? 'PROVIDER' : (roleString.includes('ADMIN') ? roleString : roleString);
            const mockUser = {
                id: `${roleString.toLowerCase()}-mock-id`,
                name: username,
                email: `${username}@unizy.com`,
                role,
            };
            const session = await getSession();
            session.user = mockUser;
            await session.save();
            return { success: true, role: mockUser.role };
        }
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
            if (referrer) {
                // Award points to both parties
                await prisma.$transaction([
                    prisma.referral.create({
                        data: {
                            code: referralCode,
                            referrerId: referrer.id,
                            referredId: newUser.id,
                            pointsAwarded: 50,
                        }
                    }),
                    prisma.user.update({ where: { id: referrer.id }, data: { points: { increment: 50 } } }),
                    prisma.user.update({ where: { id: newUser.id }, data: { points: { increment: 25 } } }),
                ]);
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
