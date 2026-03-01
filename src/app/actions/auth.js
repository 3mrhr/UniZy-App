'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

// Mock session creation for MVP
// In a real app, use next-auth or iron-session
async function setSession(user) {
    const cookieStore = cookies();
    cookieStore.set('mock_session', JSON.stringify({
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email
    }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
    });
}

export async function loginUser(username, password) {
    try {
        // --- 🚀 Bypass for MVP Testing (Roles based on username input) ---
        const roleString = username.toUpperCase();

        if (roleString.includes('ADMIN')) {
            const mockAdmin = {
                id: 'admin-mock-id',
                name: username,
                email: `${username}@unizy.com`,
                role: roleString
            };
            await setSession(mockAdmin);
            return { success: true, role: mockAdmin.role };
        }

        if (roleString === 'DRIVER' || roleString === 'LANDLORD' || roleString === 'MERCHANT') {
            const mockProvider = {
                id: `${roleString.toLowerCase()}-mock-id`,
                name: username,
                email: `${username}@unizy.com`,
                role: roleString === 'LANDLORD' ? 'PROVIDER' : roleString
            };
            await setSession(mockProvider);
            return { success: true, role: mockProvider.role };
        }
        // -----------------------------------------------------------------

        // Standard DB check
        const user = await prisma.user.findUnique({
            where: { email: username }
        });

        if (!user || user.password !== password) {
            return { error: 'Invalid credentials' };
        }

        await setSession(user);

        return { success: true, role: user.role };
    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Something went wrong during login.' };
    }
}

export async function registerUser(data) {
    try {
        // Expected data: { name, email, password, phone, role }
        const { name, email, password, phone, role } = data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return { error: 'Email already in use' };
        }

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // Plain text for MVP as per schema comment
                phone: phone || null,
                role: role || 'STUDENT'
            }
        });

        await setSession(newUser);

        return { success: true, role: newUser.role };
    } catch (error) {
        console.error('Registration error:', error);
        return { error: 'Failed to register user.' };
    }
}

export async function logoutUser() {
    const cookieStore = cookies();
    cookieStore.delete('mock_session');
    return { success: true };
}

export async function getCurrentUser() {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('mock_session');

    if (!sessionCookie) {
        return null;
    }

    try {
        return JSON.parse(sessionCookie.value);
    } catch (e) {
        return null;
    }
}
