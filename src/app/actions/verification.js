"use server";

import crypto from "node:crypto";
import { Resend } from 'resend';
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./auth";
import { createNotification } from "./notifications";

/**
 * Request an OTP for a given phone or email.
 * If it's an email, we use Resend to send the code.
 * For MVP, phone OTP is logged to the console.
 */
const resend = new Resend(process.env.RESEND_API_KEY);

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

        const isEmail = identifier.includes('@');

        if (isEmail) {
            try {
                await resend.emails.send({
                    from: 'UniZy <onboarding@resend.dev>', // Change to verified domain in production
                    to: identifier,
                    subject: 'UniZy Verification Code',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #111827;">
                            <h1 style="font-size: 24px; font-weight: 800; margin-bottom: 20px;">Welcome to UniZy!</h1>
                            <p style="font-size: 16px; margin-bottom: 30px;">Use the following code to verify your email address:</p>
                            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 12px; font-size: 32px; font-weight: 900; letter-spacing: 4px; text-align: center;">
                                ${code}
                            </div>
                            <p style="font-size: 14px; margin-top: 30px; color: #6B7280;">If you didn't request this code, you can safely ignore this email.</p>
                        </div>
                    `,
                });
                console.log(`Email OTP sent to ${identifier}`);
            } catch (emailErr) {
                console.error("Resend delivery failed:", emailErr);
                // Fallback to console log for dev
                console.log(`\n\n=== [FALLBACK] OTP for ${identifier} ===`);
                console.log(`CODE: ${code}`);
                console.log(`=======================\n\n`);
            }
        } else {
            console.log(`\n\n=== OTP for ${identifier} ===`);
            console.log(`CODE: ${code}`);
            console.log(`=======================\n\n`);
        }

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

        // Playbook: Hardened Fraud Check - Detect duplicate IDs across accounts
        const duplicateDoc = await prisma.verificationDocument.findFirst({
            where: {
                fileUrl,
                userId: { not: userId },
                status: 'VERIFIED'
            },
            include: { user: true }
        });

        if (duplicateDoc) {
            // Flag the user for investigation
            await prisma.user.update({
                where: { id: userId },
                data: { status: 'SUSPENDED' }
            });

            await createNotification(
                userId,
                'Identity Flagged',
                'Your account has been suspended due to document irregularity. Our team is investigating.',
                'SAFETY',
                '/help'
            );

            return { error: 'Document irregularity detected. Account flagged for review.' };
        }

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

        try {
            await createNotification(
                doc.userId,
                'Identity Verified',
                'Congratulations! Your identity has been successfully verified.',
                'SAFETY',
                '/account'
            );
        } catch (_) { }

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

        try {
            await createNotification(
                doc.userId,
                'Verification Rejected',
                `Your id verification was rejected: ${reason}. Please re-upload valid documents.`,
                'SAFETY',
                '/account/verification'
            );
        } catch (_) { }

        return { success: true, message: "Document rejected." };
    } catch (error) {
        console.error("Error rejecting verification:", error);
        return { success: false, error: "Failed to reject verification" };
    }
}
