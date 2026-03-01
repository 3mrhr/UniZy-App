'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { revalidatePath } from 'next/cache';

export async function getHousingListings() {
    try {
        const listings = await prisma.housingListing.findMany({
            where: {
                status: 'ACTIVE'
            },
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
