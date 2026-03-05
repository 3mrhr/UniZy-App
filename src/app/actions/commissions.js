'use server';

import { prisma } from '@/lib/prisma';
import { unstable_cache, revalidateTag } from 'next/cache';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';

// Helper to verify if the user has permission to edit commissions for a specific module
async function enforceCommissionScope(moduleName) {
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
            action: 'COMMISSION_EDIT',
        });
        throw new Error(`Forbidden: You do not have commission authority for the ${moduleName} module.`);
    }

    return user;
}


const getCachedCommissionRules = unstable_cache(
    async (moduleFilter = null) => {
        const whereClause = {};
        if (moduleFilter) whereClause.module = moduleFilter;

        return prisma.commissionRule.findMany({
            where: whereClause,
            include: { zone: true },
            orderBy: [
                { module: 'asc' },
                { providerType: 'asc' },
                { isActive: 'desc' }
            ]
        });
    },
    ['commissions'],
    { tags: ['commissions'] }
);

export async function getCommissionRules(moduleFilter = null) {
    try {
        const rules = await getCachedCommissionRules(moduleFilter);

        return { success: true, data: rules };
    } catch (error) {
        console.error('Failed to get commission rules:', error);
        return { success: false, error: 'Failed to fetch commission rules' };
    }
}

export async function createCommissionRule(data) {
    try {
        const user = await enforceCommissionScope(data.module);

        // Disable existing active rules for the exact same module/providerType/zone combo
        // to ensure we only have 1 active rule at a time for that specific tier
        await prisma.commissionRule.updateMany({
            where: {
                module: data.module,
                providerType: data.providerType,
                zoneId: data.zoneId || null,
                isActive: true
            },
            data: { isActive: false }
        });

        const newRule = await prisma.commissionRule.create({
            data: {
                module: data.module,
                providerType: data.providerType,
                unizySharePercent: parseFloat(data.unizySharePercent),
                providerSharePercent: parseFloat(data.providerSharePercent),
                promoSubsidyImpact: data.promoSubsidyImpact ? JSON.stringify(data.promoSubsidyImpact) : null,
                zoneId: data.zoneId || null,
                effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : new Date(),
                isActive: true
            }
        });

        await logAdminAction('CREATE_COMMISSION_RULE', data.module, newRule.id, {
            providerType: data.providerType,
            unizySharePercent: data.unizySharePercent,
            providerSharePercent: data.providerSharePercent,
            zoneId: data.zoneId
        });

        revalidateTag('commissions');
        return { success: true, data: newRule };
    } catch (error) {
        console.error('Failed to create commission rule:', error);
        return { success: false, error: error.message || 'Failed to create rule' };
    }
}

export async function toggleCommissionRule(ruleId, isActive, moduleName) {
    try {
        await enforceCommissionScope(moduleName);

        const updated = await prisma.commissionRule.update({
            where: { id: ruleId },
            data: { isActive }
        });

        await logAdminAction('TOGGLE_COMMISSION_RULE', moduleName, ruleId, { isActive });
        revalidateTag('commissions');
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error: error.message || 'Failed to toggle rule' };
    }
}
