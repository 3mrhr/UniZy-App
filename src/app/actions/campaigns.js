'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';

export async function createCampaign({ title, message, targetRole, targetUni, scheduledAt }) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.role?.startsWith('ADMIN_')) return { error: 'Not authorized' };

        const campaign = await prisma.campaign.create({
            data: {
                title,
                message,
                targetRole: targetRole || null,
                targetUni: targetUni || null,
                status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            }
        });

        return { success: true, campaign };
    } catch (error) {
        console.error('Create campaign error:', error);
        return { error: 'Failed to create campaign.' };
    }
}

export async function getCampaigns() {
    try {
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { campaigns };
    } catch (error) {
        console.error('Get campaigns error:', error);
        return { campaigns: [] };
    }
}

export async function sendCampaign(campaignId) {
    try {
        const user = await getCurrentUser();
        if (!user || !user.role?.startsWith('ADMIN_')) return { error: 'Not authorized' };

        const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
        if (!campaign) return { error: 'Campaign not found' };

        // Build audience filter
        const where = {};
        if (campaign.targetRole) where.role = campaign.targetRole;
        if (campaign.targetUni) where.university = campaign.targetUni;

        const targetUsers = await prisma.user.findMany({
            where,
            select: { id: true }
        });

        // Create notification for each target user
        if (targetUsers.length > 0) {
            await prisma.notification.createMany({
                data: targetUsers.map(u => ({
                    title: campaign.title,
                    message: campaign.message,
                    type: 'CAMPAIGN',
                    userId: u.id,
                }))
            });
        }

        // Mark campaign as sent
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { status: 'SENT', sentAt: new Date() }
        });

        await logAdminAction(
            'SEND_CAMPAIGN',
            'MARKETING',
            campaignId,
            { recipients: targetUsers.length, title: campaign.title }
        );

        return { success: true, recipientCount: targetUsers.length };
    } catch (error) {
        console.error('Send campaign error:', error);
        return { error: 'Failed to send campaign.' };
    }
}
