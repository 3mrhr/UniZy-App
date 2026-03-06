'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { requireRole } from '@/lib/authz';
import { uploadImage } from './upload';
import { createNotification } from './notifications';
import { revalidatePath } from 'next/cache';

/**
 * Request a wallet top-up by submitting transaction proof.
 */
export async function createTopUpRequest(formData) {
    try {
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

        const amount = parseFloat(formData.get('amount'));
        const method = formData.get('method');
        const senderName = formData.get('senderName');
        const senderPhone = formData.get('senderPhone');
        const imageFile = formData.get('proofImage'); // This will be a base64 or a file depending on how we handle it in the client

        if (!amount || amount <= 0) return { error: 'Invalid amount' };
        if (!method || !senderName || !senderPhone) return { error: 'Missing required fields' };

        let proofImageUrl = null;
        if (imageFile) {
            const uploadRes = await uploadImage(imageFile, { folder: 'unizy/wallet-proofs' });
            if (uploadRes.success) {
                proofImageUrl = uploadRes.url;
            } else {
                return { error: 'Failed to upload proof image.' };
            }
        }

        // Get or create wallet
        let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: { userId: user.id, balance: 0, currency: 'EGP' },
            });
        }

        const walletTxn = await prisma.walletTransaction.create({
            data: {
                type: 'TOPUP',
                status: 'PENDING',
                amount: amount,
                description: `Top-up via ${method}`,
                proofImage: proofImageUrl,
                senderName: senderName,
                senderPhone: senderPhone,
                walletId: wallet.id,
                metadata: {
                    method,
                    clientTimestamp: new Date().toISOString()
                }
            }
        });

        // Notify admins (generic notification for now)
        // In a real app, we'd target users with role FINANCIAL_ADMIN or SUPERADMIN
        try {
            const admins = await prisma.user.findMany({
                where: { role: { in: ['SUPERADMIN'] } },
                select: { id: true }
            });
            for (const admin of admins) {
                await createNotification(admin.id, 'New Wallet Top-up Request', `${user.name} requested a top-up of ${amount} EGP.`, 'FINANCE', '/admin/wallet');
            }
        } catch (err) {
            console.error('Failed to notify admins:', err);
        }

        revalidatePath('/wallet');
        return { success: true, transaction: walletTxn };
    } catch (error) {
        console.error('Top-up request error:', error);
        return { error: 'Failed to submit top-up request.' };
    }
}

/**
 * Approve a top-up request.
 */
export async function approveTopUpRequest(txnId) {
    try {
        await requireRole(['SUPERADMIN']); // Ensure only admins can approve

        const txn = await prisma.walletTransaction.findUnique({
            where: { id: txnId },
            include: { wallet: true }
        });

        if (!txn || txn.status !== 'PENDING') {
            return { error: 'Invalid or already processed transaction.' };
        }

        const result = await prisma.$transaction(async (tx) => {
            // Update transaction status
            const updatedTxn = await tx.walletTransaction.update({
                where: { id: txnId },
                data: { status: 'COMPLETED' }
            });

            // Update wallet balance
            const updatedWallet = await tx.wallet.update({
                where: { id: txn.walletId },
                data: { balance: { increment: txn.amount } }
            });

            return { updatedTxn, updatedWallet };
        });

        // Notify user
        await createNotification(txn.wallet.userId, 'Top-up Approved', `Your top-up of ${txn.amount} EGP has been approved.`, 'FINANCE', '/wallet');

        revalidatePath('/wallet');
        revalidatePath('/admin/wallet');
        return { success: true };
    } catch (error) {
        console.error('Approval error:', error);
        return { error: 'Failed to approve top-up.' };
    }
}

/**
 * Reject a top-up request.
 */
export async function rejectTopUpRequest(txnId, reason) {
    try {
        await requireRole(['SUPERADMIN']);

        const txn = await prisma.walletTransaction.update({
            where: { id: txnId },
            data: {
                status: 'REJECTED',
                description: `Rejected: ${reason}`
            },
            include: { wallet: true }
        });

        await createNotification(txn.wallet.userId, 'Top-up Rejected', `Your top-up request was rejected: ${reason}`, 'FINANCE', '/wallet');

        revalidatePath('/wallet');
        revalidatePath('/admin/wallet');
        return { success: true };
    } catch (error) {
        console.error('Rejection error:', error);
        return { error: 'Failed to reject top-up.' };
    }
}
