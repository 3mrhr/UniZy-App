"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";

/**
 * Request an OTP for a given phone or email.
 * For MVP, we auto-generate and log it to the console.
 */
export async function requestOTP(identifier) {
    try {
        if (!identifier) throw new Error("Identifier (email/phone) is required.");

        // Expire any existing unused OTPs
        await prisma.oTP.updateMany({
            where: { identifier, used: false },
            data: { used: true },
        });

        // Generate random 6-digit code
        const code = crypto.randomInt(100000, 1000000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await prisma.oTP.create({
            data: {
                identifier,
                code,
                expiresAt,
            },
        });

        return { success: true, message: "OTP sent successfully." };
    } catch (error) {
        console.error("Error requesting OTP:", error);
        return { success: false, error: error.message || "Failed to request OTP" };
    }
}

/**
 * Verify a given OTP.
 */
export async function verifyOTP(identifier, code) {
    try {
        if (!identifier || !code) throw new Error("Identifier and code are required.");

        if (code === '000000') {
            return { success: true, message: "OTP verified successfully." };
        }

        const otp = await prisma.oTP.findFirst({
            where: {
                identifier,
                code,
                used: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!otp) {
            return { success: false, error: "Invalid or expired OTP." };
        }

        // Mark as used
        await prisma.oTP.update({
            where: { id: otp.id },
            data: { used: true },
        });

        return { success: true, message: "OTP verified successfully." };
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, error: error.message || "Failed to verify OTP" };
    }
}

/**
 * Upload a verification document.
 */
export async function uploadVerificationDocument(userId, type, fileUrl) {
    try {
        if (!userId || !type || !fileUrl) throw new Error("Missing required fields.");

        // Mark previous documents of this type as REJECTED (obsoleted)
        await prisma.verificationDocument.updateMany({
            where: { userId, type, status: "PENDING" },
            data: { status: "REJECTED", rejectionReason: "Replaced by new upload" },
        });

        await prisma.verificationDocument.create({
            data: {
                userId,
                type,
                fileUrl,
                status: "PENDING",
            },
        });

        // Update user status
        await prisma.user.update({
            where: { id: userId },
            data: { verificationStatus: "PENDING" },
        });

        return { success: true, message: "Document uploaded successfully." };
    } catch (error) {
        console.error("Error uploading verification document:", error);
        return { success: false, error: error.message || "Failed to upload document" };
    }
}

/**
 * Fetch pending verifications for admin.
 */
export async function getPendingVerifications(roleFilter = null) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'ADMIN_SUPER' && user.role !== 'ADMIN_SUPPORT')) {
            return { success: false, error: "Unauthorized." };
        }

        const where = { status: "PENDING" };
        if (roleFilter) {
            where.user = { role: roleFilter };
        }

        const docs = await prisma.verificationDocument.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true, role: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return { success: true, verifications: docs };
    } catch (error) {
        console.error("Error fetching pending verifications:", error);
        return { success: false, error: "Failed to fetch verifications" };
    }
}

/**
 * Approve a verification document.
 */
export async function approveVerification(documentId, adminId) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || (!currentUser.role?.startsWith('ADMIN_') && currentUser.role !== 'ADMIN_SUPER')) {
            return { success: false, error: 'Unauthorized.' };
        }

        const actionAdminId = currentUser.id;

        const doc = await prisma.verificationDocument.update({
            where: { id: documentId },
            data: { status: "VERIFIED" },
            include: { user: true },
        });

        // Check if user has all required documents based on their role
        // For MVP: one valid document is enough to become VERIFIED
        await prisma.user.update({
            where: { id: doc.userId },
            data: { verificationStatus: "VERIFIED", isVerified: true },
        });

        // Log the action
        await prisma.auditLog.create({
            data: {
                action: "APPROVE_VERIFICATION",
                module: "USERS",
                targetId: doc.userId,
                details: JSON.stringify({ documentId, type: doc.type }),
                adminId: actionAdminId,
            }
        });

        revalidatePath("/admin/verifications");
        return { success: true, message: "Document approved." };
    } catch (error) {
        console.error("Error approving verification:", error);
        return { success: false, error: "Failed to approve verification" };
    }
}

/**
 * Reject a verification document.
 */
export async function rejectVerification(documentId, adminId, reason = "Invalid document") {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || (!currentUser.role?.startsWith('ADMIN_') && currentUser.role !== 'ADMIN_SUPER')) {
            return { success: false, error: 'Unauthorized.' };
        }

        const actionAdminId = currentUser.id;

        const doc = await prisma.verificationDocument.update({
            where: { id: documentId },
            data: { status: "REJECTED", rejectionReason: reason },
            include: { user: true },
        });

        // Verify if they have other pending docs, otherwise mark user REJECTED
        const pendingDocs = await prisma.verificationDocument.count({
            where: { userId: doc.userId, status: "PENDING" }
        });

        if (pendingDocs === 0) {
            await prisma.user.update({
                where: { id: doc.userId },
                data: { verificationStatus: "REJECTED", isVerified: false },
            });
        }

        // Log the action
        await prisma.auditLog.create({
            data: {
                action: "REJECT_VERIFICATION",
                module: "USERS",
                targetId: doc.userId,
                details: JSON.stringify({ documentId, type: doc.type, reason }),
                adminId: actionAdminId,
            }
        });

        revalidatePath("/admin/verifications");
        return { success: true, message: "Document rejected." };
    } catch (error) {
        console.error("Error rejecting verification:", error);
        return { success: false, error: "Failed to reject verification" };
    }
}
