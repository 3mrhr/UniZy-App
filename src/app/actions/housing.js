'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';
import { completeReferralIfEligible } from './referrals';

export async function getHousingListings(filters = {}) {
    try {
        let whereClause = { status: 'ACTIVE' };

        if (filters.type && filters.type !== 'All') {
            whereClause.type = filters.type;
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

export async function createHousingListing(formData) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'PROVIDER' && user.role !== 'ADMIN')) {
            return { error: 'Unauthorized to create listing' };
        }

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
        const listing = await prisma.housingListing.update({
            where: { id },
            data: { status: 'ACTIVE' }
        });

        if (adminId) {
            await prisma.auditLog.create({
                data: {
                    action: "APPROVE_LISTING",
                    module: "HOUSING",
                    targetId: listing.id,
                    details: JSON.stringify({ action: "APPROVED" }),
                    adminId,
                }
            });
        }

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
        const listing = await prisma.housingListing.update({
            where: { id },
            data: { status: 'REJECTED' }
        });

        if (adminId) {
            await prisma.auditLog.create({
                data: {
                    action: "REJECT_LISTING",
                    module: "HOUSING",
                    targetId: listing.id,
                    details: JSON.stringify({ reason }),
                    adminId,
                }
            });
        }

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
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

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
        const user = await getCurrentUser();
        if (!user) return { error: 'Not authenticated' };

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
