'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { logAdminAction } from './audit';
import { revalidatePath } from 'next/cache';

/**
 * STUDENT ACTIONS
 */

/**
 * Create a new support ticket
 */
export async function createTicket({ subject, category, description, priority = 'MEDIUM' }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized.' };

        // Rate limit: 2 tickets per hour per user
        const { rateLimit } = await import('@/lib/rate-limit');
        const rl = await rateLimit(`ticket:${user.id}`, 2, 3600000);
        if (!rl.success) {
            return { success: false, error: 'Ticket creation limit reached. Please wait an hour.' };
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                subject,
                category,
                description,
                priority,
                userId: user.id,
                status: 'OPEN'
            }
        });

        // Add initial system message or description as first message if needed
        // For now, description is on the ticket itself.

        revalidatePath('/support');
        return { success: true, ticket };
    } catch (error) {
        console.error('Error creating ticket:', error);
        return { success: false, error: 'Failed to create ticket.' };
    }
}

/**
 * Fetch tickets for the logged-in student
 */
export async function getStudentTickets() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized.' };

        const tickets = await prisma.supportTicket.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, tickets };
    } catch (error) {
        console.error('Error fetching student tickets:', error);
        return { success: false, error: 'Failed to fetch tickets.' };
    }
}

/**
 * ADMIN / SUPPORT ACTIONS
 */

/**
 * Fetch all tickets (with optional filtering)
 */
export async function getAdminTickets(filters = {}) {
    try {
        const user = await getCurrentUser();
        const allowedRoles = ['ADMIN', 'SUPPORT', 'SUPERADMIN'];
        if (!user || (!allowedRoles.includes(user.role) && !user.scopes?.includes('SUPPORT'))) {
            return { success: false, error: 'Unauthorized.' };
        }

        const where = {};
        if (filters.status) where.status = filters.status;
        if (filters.priority) where.priority = filters.priority;
        if (filters.category) where.category = filters.category;

        const tickets = await prisma.supportTicket.findMany({
            where,
            include: {
                user: {
                    select: { name: true, email: true, profileImage: true }
                },
                assignedAgent: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, tickets };
    } catch (error) {
        console.error('Error fetching admin tickets:', error);
        return { success: false, error: 'Failed to fetch tickets.' };
    }
}

/**
 * SHARED ACTIONS
 */

/**
 * Fetch ticket details with message history
 */
export async function getTicketDetails(id) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized.' };

        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, name: true, email: true, profileImage: true }
                },
                assignedAgent: {
                    select: { id: true, name: true }
                },
                messages: {
                    include: {
                        sender: {
                            select: { id: true, name: true, profileImage: true, role: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!ticket) return { success: false, error: 'Ticket not found.' };

        // Authorization check: Only owner or staff can view
        const isStaff = ['ADMIN', 'SUPPORT', 'SUPERADMIN'].includes(user.role) || user.scopes?.includes('SUPPORT');
        if (ticket.userId !== user.id && !isStaff) {
            return { success: false, error: 'Unauthorized.' };
        }

        return { success: true, ticket };
    } catch (error) {
        console.error('Error fetching ticket details:', error);
        return { success: false, error: 'Failed to fetch ticket.' };
    }
}

/**
 * Add a message/reply to a ticket
 */
export async function sendTicketMessage({ ticketId, content, isAdmin = false }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized.' };

        // Verify ticket access
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: ticketId }
        });

        if (!ticket) return { success: false, error: 'Ticket not found.' };

        const isStaff = ['ADMIN', 'SUPPORT', 'SUPERADMIN'].includes(user.role) || user.scopes?.includes('SUPPORT');
        if (ticket.userId !== user.id && !isStaff) {
            return { success: false, error: 'Unauthorized.' };
        }

        const message = await prisma.ticketMessage.create({
            data: {
                ticketId,
                content,
                senderId: user.id,
                isAdmin: isStaff && isAdmin // Only allow isAdmin true if actor really is staff
            }
        });

        // Update ticket's updatedAt
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
        });

        revalidatePath(`/support/${ticketId}`);
        revalidatePath(`/admin/support/${ticketId}`);

        return { success: true, message };
    } catch (error) {
        console.error('Error sending ticket message:', error);
        return { success: false, error: 'Failed to send message.' };
    }
}

/**
 * Update ticket status (Admin only)
 */
export async function updateTicketStatus(ticketId, status) {
    try {
        const user = await getCurrentUser();
        const isAdmin = ['ADMIN', 'SUPPORT', 'SUPERADMIN'].includes(user.role) || user.scopes?.includes('SUPPORT');
        if (!user || !isAdmin) return { success: false, error: 'Unauthorized.' };

        const ticket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { status }
        });

        // Log admin action
        await logAdminAction('UPDATE_TICKET_STATUS', 'SUPPORT', { ticketId, status });

        revalidatePath(`/support/${ticketId}`);
        revalidatePath(`/admin/support/${ticketId}`);

        return { success: true, ticket };
    } catch (error) {
        console.error('Error updating ticket status:', error);
        return { success: false, error: 'Failed to update status.' };
    }
}

/**
 * Claim/Assign a ticket to an agent
 */
export async function claimTicket(ticketId) {
    try {
        const user = await getCurrentUser();
        const isStaff = ['ADMIN', 'SUPPORT', 'SUPERADMIN'].includes(user.role) || user.scopes?.includes('SUPPORT');
        if (!user || !isStaff) return { success: false, error: 'Unauthorized.' };

        const ticket = await prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                assignedAgentId: user.id,
                status: 'IN_PROGRESS'
            }
        });

        await logAdminAction('CLAIM_TICKET', 'SUPPORT', { ticketId });

        revalidatePath(`/admin/support/${ticketId}`);
        revalidatePath(`/support/${ticketId}`);

        return { success: true, ticket };
    } catch (error) {
        console.error('Error claiming ticket:', error);
        return { success: false, error: 'Failed to claim ticket.' };
    }
}
