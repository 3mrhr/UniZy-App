'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';

// Helper to verify if the user has permission to edit pricing for a specific module
async function enforcePricingScope(moduleName) {
    const user = await getCurrentUser();
    if (!user) throw new Error('Unauthorized');
    if (user.role === 'ADMIN_SUPER') return user;

    let hasAccess = false;
    if (user.scopes) {
        try {
            const parsed = typeof user.scopes === 'string' ? JSON.parse(user.scopes) : user.scopes;
            hasAccess = parsed.includes(moduleName);
        } catch (e) {
            console.error('Error parsing scopes', e);
        }
    }

    if (!hasAccess && user.role !== `ADMIN_${moduleName}`) {
        // Audit log privilege escalation attempt
        await logAdminAction('PRIVILEGE_ESCALATION_ATTEMPT', moduleName, null, {
            attemptedBy: user.id,
            userRole: user.role,
            targetModule: moduleName,
            action: 'PRICING_EDIT',
        });
        throw new Error(`Forbidden: You do not have pricing authority for the ${moduleName} module.`);
    }

    return user;
}

// ==== ZONES ====

export async function getZones() {
    try {
        const zones = await prisma.zone.findMany({
            orderBy: { name: 'asc' }
        });
        return { success: true, data: zones };
    } catch (error) {
        console.error('Failed to get zones:', error);
        return { success: false, error: 'Failed to fetch zones' };
    }
}

export async function createZone(data) {
    try {
        const user = await getCurrentUser();
        // Only Super Admins and Operations Admins can create global Zones
        if (!user || (user.role !== 'ADMIN_SUPER' && user.role !== 'ADMIN_OPERATIONS')) {
            return { success: false, error: 'Unauthorized to create zones.' };
        }

        const newZone = await prisma.zone.create({
            data: {
                name: data.name,
                city: data.city || null,
                isActive: true
            }
        });

        await logAdminAction('CREATE_ZONE', 'SYSTEM', newZone.id, { name: newZone.name });

        return { success: true, data: newZone };
    } catch (error) {
        if (error.code === 'P2002') return { success: false, error: 'A zone with this name already exists' };
        console.error('Failed to create zone:', error);
        return { success: false, error: 'Failed to create zone' };
    }
}

export async function toggleZone(zoneId, isActive) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN_SUPER') {
            return { success: false, error: 'Only Super Admins can disable zones.' };
        }

        const updated = await prisma.zone.update({
            where: { id: zoneId },
            data: { isActive }
        });

        await logAdminAction('TOGGLE_ZONE', 'SYSTEM', zoneId, { isActive });
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error: 'Failed to toggle zone' };
    }
}


// ==== PRICING RULES ====

export async function getPricingRules(moduleFilter = null) {
    try {
        const whereClause = {};
        if (moduleFilter) whereClause.module = moduleFilter;

        const rules = await prisma.pricingRule.findMany({
            where: whereClause,
            include: { zone: true },
            orderBy: [
                { module: 'asc' },
                { serviceType: 'asc' }
            ]
        });

        return { success: true, data: rules };
    } catch (error) {
        console.error('Failed to get pricing rules:', error);
        return { success: false, error: 'Failed to fetch pricing rules' };
    }
}

export async function createPricingRule(data) {
    try {
        const user = await enforcePricingScope(data.module);

        const newRule = await prisma.pricingRule.create({
            data: {
                module: data.module,
                serviceType: data.serviceType,
                basePrice: parseFloat(data.basePrice),
                feeComponents: data.feeComponents ? JSON.stringify(data.feeComponents) : null,
                zoneId: data.zoneId || null,
                effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
                isActive: true
            }
        });

        await logAdminAction('CREATE_PRICING_RULE', data.module, newRule.id, {
            serviceType: data.serviceType,
            basePrice: data.basePrice,
            zoneId: data.zoneId
        });

        return { success: true, data: newRule };
    } catch (error) {
        console.error('Failed to create pricing rule:', error);
        return { success: false, error: error.message || 'Failed to create rule' };
    }
}

export async function togglePricingRule(ruleId, isActive, moduleName) {
    try {
        await enforcePricingScope(moduleName);

        const updated = await prisma.pricingRule.update({
            where: { id: ruleId },
            data: { isActive }
        });

        await logAdminAction('TOGGLE_PRICING_RULE', moduleName, ruleId, { isActive });
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error: error.message || 'Failed to toggle rule' };
    }
}
