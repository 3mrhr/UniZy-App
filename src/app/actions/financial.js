'use server';

import { prisma } from '@/lib/prisma';

/**
 * Compute commission for a transaction at creation time.
 * Looks up the active CommissionRule for the given module and providerType,
 * then computes unizyCommissionAmount, providerNetAmount, and promoSubsidyAmount.
 * Returns an immutable snapshot object to be stored on the Transaction record.
 *
 * @param {string} module - e.g. "TRANSPORT", "DELIVERY", "DEALS", "MEALS", "SERVICE", "CLEANING", "HOUSING"
 * @param {string} providerType - e.g. "DRIVER", "MERCHANT", "LANDLORD", "CLEANER", "PROVIDER"
 * @param {number} amount - The transaction amount (after promo discount applied to customer)
 * @param {number} [promoDiscount=0] - How much was discounted by promo
 * @param {string|null} [zoneId=null] - Optional zone for zone-specific rules
 * @returns {Object} snapshot fields to merge into Transaction.create data
 */
export async function computeCommissionSnapshot(module, providerType, amount, promoDiscount = 0, zoneId = null) {
    try {
        // 1. Find the best matching commission rule (zone-specific first, then global)
        const rules = await prisma.commissionRule.findMany({
            where: {
                module,
                providerType,
                isActive: true,
            },
            orderBy: { effectiveDate: 'desc' },
        });

        // Prefer zone-specific rule, fall back to global (zoneId === null)
        let rule = rules.find(r => r.zoneId === zoneId) || rules.find(r => r.zoneId === null) || rules[0];

        if (!rule) {
            // No commission rule found — 0% commission (provider gets everything)
            return {
                commissionRuleId: null,
                unizyCommissionAmount: 0,
                providerNetAmount: amount,
                promoSubsidyAmount: 0,
            };
        }

        // 2. Compute commission
        const unizyShare = rule.unizySharePercent / 100;
        const unizyCommissionAmount = Math.round(amount * unizyShare * 100) / 100;
        const providerNetAmount = Math.round((amount - unizyCommissionAmount) * 100) / 100;

        // 3. Compute promo subsidy (if UniZy bears the promo cost)
        let promoSubsidyAmount = 0;
        if (promoDiscount > 0 && rule.promoSubsidyImpact) {
            try {
                const subsidy = JSON.parse(rule.promoSubsidyImpact);
                if (subsidy.whoPaysDiscount === 'UNIZY') {
                    promoSubsidyAmount = promoDiscount;
                } else if (subsidy.whoPaysDiscount === 'SPLIT') {
                    promoSubsidyAmount = Math.round((promoDiscount / 2) * 100) / 100;
                }
                // If 'PROVIDER', promoSubsidyAmount stays 0
            } catch {
                // Invalid JSON — ignore subsidy
            }
        }

        return {
            commissionRuleId: rule.id,
            unizyCommissionAmount,
            providerNetAmount,
            promoSubsidyAmount,
        };
    } catch (error) {
        console.error('Commission computation error:', error);
        // Fail safe: 0% commission
        return {
            commissionRuleId: null,
            unizyCommissionAmount: 0,
            providerNetAmount: amount,
            promoSubsidyAmount: 0,
        };
    }
}

/**
 * Look up the active pricing rule for a module and return a snapshot.
 * @param {string} module - e.g. "TRANSPORT", "DELIVERY", etc.
 * @param {string|null} [zoneId=null] - Optional zone
 * @returns {Object} pricing snapshot fields
 */
export async function computePricingSnapshot(module, zoneId = null) {
    try {
        const rules = await prisma.pricingRule.findMany({
            where: {
                module,
                isActive: true,
            },
            orderBy: { effectiveDate: 'desc' },
        });

        // Prefer zone-specific, fallback to global
        let rule = rules.find(r => r.zoneId === zoneId) || rules.find(r => r.zoneId === null) || rules[0];

        if (!rule) {
            return {
                pricingRuleId: null,
                basePriceSnapshot: null,
                feeComponentsSnapshot: null,
                zoneSnapshot: null,
            };
        }

        // Get zone name if applicable
        let zoneName = null;
        if (rule.zoneId) {
            const zone = await prisma.zone.findUnique({ where: { id: rule.zoneId } });
            zoneName = zone?.name || null;
        }

        return {
            pricingRuleId: rule.id,
            basePriceSnapshot: rule.basePrice,
            feeComponentsSnapshot: rule.feeComponents || null,
            zoneSnapshot: zoneName,
        };
    } catch (error) {
        console.error('Pricing snapshot error:', error);
        return {
            pricingRuleId: null,
            basePriceSnapshot: null,
            feeComponentsSnapshot: null,
            zoneSnapshot: null,
        };
    }
}

/**
 * Generate a unique transaction code.
 */
export async function generateTxnCode() {
    return `TXN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
}
