"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./auth";
import { logAdminAction } from "./audit";

/**
 * Ensures the user is a superadmin or has exact SLA permissions.
 */
async function requireSLAAdmin() {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
        throw new Error("Unauthorized to access SLA settings.");
    }
    return user;
}

/**
 * Get all SLA Rules for a specific module, or all SLA Rules globally.
 */
export async function getSLARules(moduleFilter = null) {
    try {
        await requireSLAAdmin();
        const whereClause = moduleFilter ? { module: moduleFilter } : {};
        const rules = await prisma.sLARule.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { breaches: { where: { status: "OPEN" } } }
                }
            }
        });
        return { success: true, rules };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Create a new SLA Rule
 */
export async function createSLARule({ module, metric, thresholdMinutes, breachAction }) {
    try {
        const admin = await requireSLAAdmin();
        const rule = await prisma.sLARule.create({
            data: {
                module,
                metric,
                thresholdMinutes: parseInt(thresholdMinutes),
                breachAction
            }
        });

        await logAdminAction("CREATE_SLA_RULE", module, rule.id, admin.id, { metric, thresholdMinutes });
        return { success: true, rule };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Update an SLA Rule (e.g. toggle active/inactive)
 */
export async function updateSLARule(id, data) {
    try {
        const admin = await requireSLAAdmin();
        const rule = await prisma.sLARule.update({
            where: { id },
            data
        });

        await logAdminAction("UPDATE_SLA_RULE", rule.module, rule.id, admin.id, data);
        return { success: true, rule };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Delete an SLA Rule (and implicitly cascade-delete breaches per schema rules)
 */
export async function deleteSLARule(id) {
    try {
        const admin = await requireSLAAdmin();
        const rule = await prisma.sLARule.delete({ where: { id } });
        await logAdminAction("DELETE_SLA_RULE", rule.module, id, admin.id, {});
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Get active SLA breaches
 */
export async function getSLABreaches(statusFilter = "OPEN") {
    try {
        await requireSLAAdmin();
        const breaches = await prisma.sLABreach.findMany({
            where: { status: statusFilter },
            orderBy: { createdAt: "desc" },
            include: {
                rule: true
            }
        });
        return { success: true, breaches };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Resolve an SLA Breach
 */
export async function resolveSLABreach(id) {
    try {
        const admin = await requireSLAAdmin();
        const breach = await prisma.sLABreach.update({
            where: { id },
            data: {
                status: "RESOLVED",
                resolvedAt: new Date()
            },
            include: { rule: true }
        });

        await logAdminAction("RESOLVE_SLA_BREACH", breach.rule.module, id, admin.id, { targetId: breach.targetId });
        return { success: true, breach };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Engine function: Check transactions and evaluate against active rules.
 * This function handles detecting the breaches and writing them to the DB.
 */
export async function checkSLABreaches() {
    try {
        // This is a simplified engine check. In production, this would be highly optimized per rule type.
        // It fetches all active rules and uncompleted transactions older than the threshold.
        const rules = await prisma.sLARule.findMany({ where: { active: true } });

        const newBreaches = [];

        for (const rule of rules) {
            // Calculate cutoff time limit. Transactions created before this limit breach the SLA.
            const earliestValidTime = new Date(Date.now() - (rule.thresholdMinutes * 60 * 1000));

            // Example match map based on metrics
            let targetTransactions = [];

            if (rule.metric === "ASSIGNMENT_TIME") {
                targetTransactions = await prisma.transaction.findMany({
                    where: {
                        module: rule.module,
                        status: "PENDING", // still pending assignment
                        createdAt: { lt: earliestValidTime }
                    },
                    select: { id: true }
                });
            } else if (rule.metric === "COMPLETION_TIME") {
                targetTransactions = await prisma.transaction.findMany({
                    where: {
                        module: rule.module,
                        status: { notIn: ["COMPLETED", "CANCELLED", "FAILED", "REJECTED"] },
                        createdAt: { lt: earliestValidTime }
                    },
                    select: { id: true }
                });
            }

            // Create breach records only if one doesn't already exist for this rule and transaction
            for (const txn of targetTransactions) {
                const existing = await prisma.sLABreach.findFirst({
                    where: { ruleId: rule.id, targetId: txn.id }
                });

                if (!existing) {
                    const breach = await prisma.sLABreach.create({
                        data: {
                            ruleId: rule.id,
                            targetId: txn.id,
                            status: "OPEN"
                        }
                    });
                    newBreaches.push(breach);
                }
            }
        }

        return { success: true, newBreaches, count: newBreaches.length };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
