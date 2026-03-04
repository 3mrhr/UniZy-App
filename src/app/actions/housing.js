'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';
import { completeReferralIfEligible } from './referrals';
import { requireUser, requireRole, requireOwnership } from '@/lib/authz';
import { logAdminAction } from './audit';

export async function getHousingListings(filters = {}) {
    try {
        let whereClause = { status: 'ACTIVE' };

        if (filters.type && filters.type !== 'All') {
            // Handle gender-based filters separately
            if (filters.type === 'Female Only' || filters.type === 'Male Only') {
                whereClause.gender = filters.type === 'Female Only' ? 'FEMALE' : 'MALE';
            } else {
                // Case-insensitive type matching
                whereClause.type = {
                    equals: filters.type,
                    mode: 'insensitive'
                };
            }
        }

        const listings = await prisma.housingListing.findMany({
            where: whereClause,
            include: {
                provider: {
                    select: {
                        name: true,
                        phone: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return listings;
    } catch (error) {
        console.error('Failed to fetch housing listings:', error);
        return [];
    }
}

export async function getHousingListingById(id) {
    try {
        const listing = await prisma.housingListing.findUnique({
            where: { id },
            include: {
                provider: {
                    select: {
                        name: true,
                        phone: true,
                        email: true
                    }
                }
            }
        });
        return listing;
    } catch (error) {
        console.error('Failed to fetch listing details:', error);
        return null;
    }
}

// ========== Provider Specific Actions ==========

export async function getProviderListings() {
    try {
        const user = await requireRole(['PROVIDER']);

        const listings = await prisma.housingListing.findMany({
            where: { providerId: user.id },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, listings };
    } catch (error) {
        console.error('Failed to fetch provider listings:', error);
        return { success: false, error: 'Failed to access database.' };
    }
}

export async function getProviderLeads() {
    try {
        const user = await requireRole(['PROVIDER']);

        // Fetch requests for listings owned by this provider
        const requests = await prisma.housingRequest.findMany({
            where: {
                listing: {
                    providerId: user.id
                }
            },
            include: {
                user: { select: { name: true, phone: true } },
                listing: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, requests };
    } catch (error) {
        console.error('Failed to fetch provider leads:', error);
        return { success: false, error: 'Failed to access database.' };
    }
}

export async function updateHousingRequestStatus(requestId, newStatus) {
    try {
        const user = await requireRole(['PROVIDER']);

        // Check ownership
        const request = await prisma.housingRequest.findUnique({
            where: { id: requestId },
            include: { listing: { select: { providerId: true } } }
        });
        if (!request) return { success: false, error: 'Request not found.' };

        requireOwnership(request.listing.providerId, user.id);

        await prisma.housingRequest.update({
            where: { id: requestId },
            data: { status: newStatus }
        });

        revalidatePath('/provider');
        return { success: true };
    } catch (error) {
        console.error('Failed to update request status:', error);
        return { success: false, error: error.message || 'Server error' };
    }
}

export async function createHousingListing(formData) {
    try {
        const user = await requireRole(['PROVIDER', 'ADMIN_SUPER', 'ADMIN_HOUSING']);

        const newListing = await prisma.housingListing.create({
            data: {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                type: formData.type,
                location: formData.location,
                images: JSON.stringify(formData.images || []),
                amenities: JSON.stringify(formData.amenities || []),
                contact: formData.contact || user.phone || '',
                providerId: user.id,
                status: 'PENDING'
            }
        });

        revalidatePath('/housing');
        return { success: true, listing: newListing };
    } catch (error) {
        console.error('Failed to create listing:', error);
        return { error: 'Failed to create housing listing' };
    }
}

export async function getPendingListings() {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'ADMIN_SUPER' && user.role !== 'ADMIN_HOUSING')) {
            return [];
        }

        const listings = await prisma.housingListing.findMany({
            where: { status: 'PENDING' },
            include: {
                provider: {
                    select: { name: true, phone: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return listings;
    } catch (error) {
        console.error('Failed to fetch pending listings:', error);
        return [];
    }
}

export async function approveListing(id, adminId) {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
            return { success: false, error: 'Unauthorized.' };
        }

        const actionAdminId = user.id;

        const listing = await prisma.housingListing.update({
            where: { id },
            data: { status: 'ACTIVE' }
        });

        await logAdminAction('APPROVE_LISTING', 'HOUSING', listing.id, { action: 'APPROVED' });

        revalidatePath('/admin/listings-moderation');
        revalidatePath('/housing');
        return { success: true };
    } catch (error) {
        console.error('Error approving listing', error);
        return { success: false, error: 'Failed to approve listing' };
    }
}

export async function rejectListing(id, adminId, reason = "Violates guidelines") {
    try {
        const user = await getCurrentUser();
        if (!user || (!user.role?.startsWith('ADMIN_') && user.role !== 'ADMIN_SUPER')) {
            return { success: false, error: 'Unauthorized.' };
        }

        const actionAdminId = user.id;

        const listing = await prisma.housingListing.update({
            where: { id },
            data: { status: 'REJECTED' }
        });

        await logAdminAction('REJECT_LISTING', 'HOUSING', listing.id, { reason });

        revalidatePath('/admin/listings-moderation');
        return { success: true };
    } catch (error) {
        console.error('Error rejecting listing', error);
        return { success: false, error: 'Failed to reject listing' };
    }
}

// ========== Phase 44: End-to-End Actions ==========

export async function toggleSavedHousing(listingId) {
    try {
        const user = await requireUser();

        const existing = await prisma.savedHousing.findUnique({
            where: {
                userId_housingListingId: {
                    userId: user.id,
                    housingListingId: listingId
                }
            }
        });

        if (existing) {
            await prisma.savedHousing.delete({ where: { id: existing.id } });
            revalidatePath(`/housing/${listingId}`);
            revalidatePath(`/housing/saved`);
            return { saved: false };
        } else {
            await prisma.savedHousing.create({
                data: {
                    userId: user.id,
                    housingListingId: listingId
                }
            });
            revalidatePath(`/housing/${listingId}`);
            revalidatePath(`/housing/saved`);
            return { saved: true };
        }
    } catch (error) {
        console.error('Failed to toggle saved housing:', error);
        return { error: 'Failed to update saved status' };
    }
}

export async function checkIsSaved(listingId) {
    try {
        const user = await getCurrentUser();
        if (!user) return false;

        const existing = await prisma.savedHousing.findUnique({
            where: {
                userId_housingListingId: {
                    userId: user.id,
                    housingListingId: listingId
                }
            }
        });
        return !!existing;
    } catch {
        return false;
    }
}

export async function getSavedHousing() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const saved = await prisma.savedHousing.findMany({
            where: { userId: user.id },
            include: {
                listing: {
                    include: {
                        provider: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return saved.map(s => s.listing);
    } catch (error) {
        console.error('Failed to fetched saved housing:', error);
        return [];
    }
}

export async function createHousingRequest(listingId, type, message = '') {
    try {
        const user = await requireRole(['STUDENT']);

        // Anti-Spam: Only verified users can send housing requests
        const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!fullUser || !fullUser.isVerified) {
            return { error: 'You must verify your account before contacting housing providers.' };
        }

        // Prevent duplicate pending requests for the same listing by the same user
        const existing = await prisma.housingRequest.findFirst({
            where: {
                userId: user.id,
                housingListingId: listingId,
                status: 'PENDING'
            }
        });

        if (existing) {
            return { error: 'You already have a pending request for this listing' };
        }

        const req = await prisma.housingRequest.create({
            data: {
                userId: user.id,
                housingListingId: listingId,
                type,
                message
            }
        });

        // Trigger referral completion if this is the student's first high-intent action
        await completeReferralIfEligible(user.id);

        revalidatePath(`/housing/${listingId}`);
        revalidatePath(`/housing/requests`);
        return { success: true, request: req };
    } catch (error) {
        console.error('Failed to create housing request:', error);
        return { error: 'Failed to submit request' };
    }
}

export async function getMyHousingRequests() {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const requests = await prisma.housingRequest.findMany({
            where: { userId: user.id },
            include: {
                listing: {
                    include: { provider: { select: { name: true, phone: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return requests;
    } catch (error) {
        console.error('Failed to fetch requests:', error);
        return [];
    }
}
