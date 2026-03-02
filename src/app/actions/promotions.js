'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

/**
 * Validate a promo code and return its discount details.
 */
export async function validatePromoCode(code, moduleType = 'ALL') {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const promo = await prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!promo) {
            return { success: false, error: 'Invalid promo code' };
        }

        if (!promo.isActive) {
            return { success: false, error: 'This promo code is no longer active' };
        }

        if (promo.expiresAt && new Date() > promo.expiresAt) {
            return { success: false, error: 'This promo code has expired' };
        }

        if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
            return { success: false, error: 'This promo code has reached its usage limit' };
        }

        if (promo.applicableType !== 'ALL' && promo.applicableType !== moduleType) {
            return { success: false, error: `This code can only be used for ${promo.applicableType} services` };
        }

        return { success: true, promo };
    } catch (error) {
        console.error('Error validating promo code:', error);
        return { success: false, error: 'Failed to validate promo code' };
    }
}

/**
 * Admin: Get all promo codes
 */
export async function getPromoCodes() {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { success: false, error: 'Unauthorized' };

        const promos = await prisma.promoCode.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, promos };
    } catch (error) {
        console.error('Error fetching promo codes:', error);
        return { success: false, error: 'Failed to fetch promo codes' };
    }
}

/**
 * Admin: Create a new promo code
 */
export async function createPromoCode(data) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { success: false, error: 'Unauthorized' };

        const { code, discountType, discountAmount, maxUses, expiresAt, applicableType } = data;

        const existing = await prisma.promoCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (existing) {
            return { success: false, error: 'Promo code already exists' };
        }

        const promo = await prisma.promoCode.create({
            data: {
                code: code.toUpperCase(),
                discountType,
                discountAmount: parseFloat(discountAmount),
                maxUses: parseInt(maxUses) || 0,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                applicableType: applicableType || 'ALL',
                isActive: true
            }
        });

        return { success: true, promo };
    } catch (error) {
        console.error('Error creating promo code:', error);
        return { success: false, error: 'Failed to create promo code' };
    }
}

/**
 * Admin: Toggle promo code active status
 */
export async function togglePromoCode(id, isActive) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !admin.role.includes('ADMIN')) return { success: false, error: 'Unauthorized' };

        await prisma.promoCode.update({
            where: { id },
            data: { isActive }
        });

        return { success: true };
    } catch (error) {
        console.error('Error toggling promo code:', error);
        return { success: false, error: 'Failed to update promo code' };
    }
}
