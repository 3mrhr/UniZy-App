'use server';

import { prisma } from '@/lib/prisma';
import { requireRole, requireOwnership } from '@/lib/authz';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';
import { generateTxnCode, computeCommissionSnapshot, computePricingSnapshot } from './financial';
import { logEvent } from './analytics';
import { logAdminAction } from './audit';
import { success, failure } from '@/lib/actionResult';

// ---------------------------------------------
// STUDENT ACTIONS
// ---------------------------------------------

export async function requestTrip({ pickupLocation, dropoffLocation, pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleType, estimatedPrice }) {
    try {
        const user = await requireRole(['STUDENT']);

        // Idempotency / Spam check
        const pendingTrip = await prisma.transportTrip.findFirst({
            where: {
                userId: user.id,
                status: 'REQUESTED'
            }
        });

        if (pendingTrip) {
            return failure('DUPLICATE_TRIP', 'You already have a requested trip. Please wait for a driver or cancel it.');
        }

        const trip = await prisma.transportTrip.create({
            data: {
                userId: user.id,
                pickupLocation,
                pickupLat,
                pickupLng,
                dropoffLocation,
                dropoffLat,
                dropoffLng,
                vehicleType,
                estimatedPrice,
                status: 'REQUESTED',
                tripOTP: Math.floor(100000 + Math.random() * 900000).toString()
            }
        });

        revalidatePath('/transport');
        return success({ trip });
    } catch (error) {
        console.error('Failed to request trip:', error);
        return failure('CREATE_FAILED', error.message || 'Failed to request trip.');
    }
}

export async function getStudentTrips() {
    try {
        const user = await requireRole(['STUDENT']);

        const trips = await prisma.transportTrip.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        return trips;
    } catch (error) {
        console.error('Failed to fetch student trips:', error);
        return [];
    }
}

// ---------------------------------------------
// DRIVER ACTIONS
// ---------------------------------------------

export async function getAvailableTrips() {
    try {
        const user = await requireRole(['DRIVER']);

        const trips = await prisma.transportTrip.findMany({
            where: {
                OR: [
                    { status: 'REQUESTED', driverId: null },
                    { driverId: user.id, status: { in: ['ACCEPTED', 'ARRIVED', 'IN_PROGRESS'] } }
                ]
            },
            include: {
                user: { select: { name: true, phone: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return trips;
    } catch (error) {
        console.error('Failed to fetch available trips:', error);
        return [];
    }
}

export async function acceptTrip(tripId) {
    try {
        const user = await requireRole(['DRIVER']);

        // Atomic lock
        const updated = await prisma.transportTrip.updateMany({
            where: {
                id: tripId,
                status: 'REQUESTED',
                driverId: null
            },
            data: {
                status: 'ACCEPTED',
                driverId: user.id
            }
        });

        if (updated.count === 0) {
            return failure('UNAVAILABLE', 'Trip is no longer available.');
        }

        const trip = await prisma.transportTrip.findUnique({ where: { id: tripId } });

        try {
            await createNotification(trip.userId, 'Driver Accepted', 'A driver has accepted your ride request.', 'SYSTEM', `/activity/tracking/${trip.id}`);
        } catch (_) { }

        revalidatePath('/driver');
        return success({ trip });
    } catch (error) {
        console.error('Failed to accept trip:', error);
        return failure('ACCEPT_FAILED', 'Failed to accept trip.');
    }
}

const TRIP_STATE_MACHINE = {
    'ACCEPTED': ['ARRIVED', 'CANCELLED'],
    'ARRIVED': ['IN_PROGRESS', 'CANCELLED'],
    'IN_PROGRESS': ['COMPLETED']
};

export async function updateTripStatus(tripId, newStatus, otp = null) {
    try {
        const user = await requireRole(['DRIVER']);

        const trip = await prisma.transportTrip.findUnique({ where: { id: tripId } });
        if (!trip) return failure('NOT_FOUND', 'Trip not found.');

        requireOwnership(trip.driverId, user.id);

        const allowed = TRIP_STATE_MACHINE[trip.status];
        if (!allowed || !allowed.includes(newStatus)) {
            return failure('INVALID_STATE', `Cannot transition from ${trip.status} to ${newStatus}.`);
        }

        // OTP Verification for Pickup (Moving to IN_PROGRESS)
        if (newStatus === 'IN_PROGRESS') {
            if (!otp || otp !== trip.tripOTP) {
                await prisma.transportTrip.update({
                    where: { id: tripId },
                    data: { failedOtpAttempts: { increment: 1 } }
                });

                if ((trip.failedOtpAttempts + 1) >= 5) {
                    console.warn(`Brute force attempt detected on trip ${tripId}`);
                }
                return failure('INVALID_OTP', `Invalid pickup code. Attempts: ${trip.failedOtpAttempts + 1}/5`);
            }
        }

        if (newStatus === 'COMPLETED') {
            return await completeTrip(tripId, user.id);
        }

        const updated = await prisma.transportTrip.update({
            where: { id: tripId },
            data: { status: newStatus }
        });

        try {
            let title = 'Ride Update';
            let message = `Your ride is now ${newStatus}.`;

            if (newStatus === 'ARRIVED') {
                title = 'Driver Arrived! 🚗';
                message = 'Your driver is at the pickup point. Look for them now!';
            } else if (newStatus === 'IN_PROGRESS') {
                title = 'Trip Started';
                message = 'You are on your way. Stay safe!';
            }

            await createNotification(trip.userId, title, message, 'SYSTEM', `/activity/tracking/${trip.id}`);
        } catch (_) { }

        revalidatePath('/driver');
        revalidatePath('/transport');
        return success({ trip: updated });
    } catch (error) {
        console.error('Failed to update trip status:', error);
        return failure('UPDATE_FAILED', 'Failed to update status.');
    }
}

async function completeTrip(tripId, driverId) {
    const result = await prisma.$transaction(async (tx) => {
        const trip = await tx.transportTrip.findUnique({ where: { id: tripId } });

        const finalPrice = trip.estimatedPrice; // We can add distance calcs later
        const subtotal = finalPrice;
        const feesTotal = 0;
        const discountTotal = 0;
        const grandTotal = subtotal;

        // Compute financial snapshot
        const commissionSnapshot = await computeCommissionSnapshot('TRANSPORT', 'DRIVER', grandTotal, discountTotal);
        const pricingSnapshot = await computePricingSnapshot('TRANSPORT');

        // Note: No Order record created for trips, it links directly to Transaction
        const txnCode = generateTxnCode();
        const txnRecord = await tx.transaction.create({
            data: {
                txnCode,
                type: 'TRANSPORT',
                status: 'COMPLETED',
                userId: trip.userId,
                providerId: driverId,
                amount: grandTotal,
                subtotal,
                discountTotal,
                feesTotal,
                grandTotal,
                basePriceSnapshot: pricingSnapshot.basePriceSnapshot,
                feeComponentsSnapshot: pricingSnapshot.feeComponentsSnapshot,
                pricingSnapshot: JSON.stringify(pricingSnapshot),
                zoneSnapshot: pricingSnapshot.zoneSnapshot,
                pricingRuleId: pricingSnapshot.pricingRuleId,
                commissionRuleId: commissionSnapshot.commissionRuleId,
                commissionSnapshot: JSON.stringify(commissionSnapshot),
                unizyCommissionAmount: commissionSnapshot.unizyCommissionAmount,
                providerNetAmount: commissionSnapshot.providerNetAmount
            }
        });

        await tx.transactionHistory.create({
            data: {
                transactionId: txnRecord.id,
                newStatus: 'COMPLETED',
                actorId: driverId,
                reason: 'Ride completed'
            }
        });

        const updatedTrip = await tx.transportTrip.update({
            where: { id: tripId },
            data: {
                status: 'COMPLETED',
                finalPrice,
                transactionId: txnRecord.id
            }
        });

        return updatedTrip;
    });

    try {
        await logEvent('RIDE_COMPLETED', result.id, { driverId, amount: result.finalPrice });
        await createNotification(result.userId, 'Ride Completed', 'You have arrived at your destination.', 'SYSTEM');
    } catch (_) { }

    revalidatePath('/driver');
    return success({ trip: result });
}

export async function cancelTrip(tripId, reason) {
    try {
        const user = await requireRole(['STUDENT', 'DRIVER']);

        const trip = await prisma.transportTrip.findUnique({ where: { id: tripId } });
        if (!trip) return failure('NOT_FOUND', 'Trip not found.');

        if (trip.userId !== user.id && trip.driverId !== user.id) {
            return failure('UNAUTHORIZED', 'Not authorized to cancel this trip.');
        }

        if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
            return failure('INVALID_STATE', 'Trip cannot be cancelled.');
        }

        const updated = await prisma.transportTrip.update({
            where: { id: tripId },
            data: { status: 'CANCELLED', cancelReason: reason }
        });

        const notifyId = user.id === trip.userId ? trip.driverId : trip.userId;
        if (notifyId) {
            await createNotification(notifyId, 'Ride Cancelled', 'The ride has been cancelled.', 'SYSTEM');
        }

        revalidatePath('/transport');
        revalidatePath('/driver');
        return success({ trip: updated });
    } catch (error) {
        console.error('Failed to cancel trip:', error);
        return failure('CANCEL_FAILED', 'Failed to cancel trip.');
    }
}

// ---------------------------------------------
// SHUTTLE ACTIONS
// ---------------------------------------------

export async function getShuttleBuses() {
    try {
        const buses = await prisma.shuttleBus.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { busNumber: 'asc' }
        });
        return success(buses);
    } catch (error) {
        console.error('Failed to fetch shuttles:', error);
        return failure('FETCH_FAILED', 'Failed to load shuttle locations.');
    }
}

export async function getShuttleStations() {
    try {
        const stations = await prisma.shuttleStation.findMany();
        return success(stations);
    } catch (error) {
        return failure('FETCH_FAILED', 'Failed to load stations.');
    }
}

// ---------------------------------------------
// TRANSPORT ADMIN ACTIONS
// ---------------------------------------------

export async function adminCreateShuttle(data) {
    try {
        await requireRole(['ADMIN_TRANSPORT', 'ADMIN']);
        const bus = await prisma.shuttleBus.create({ data });
        revalidatePath('/admin/transport');
        return success(bus);
    } catch (error) {
        return failure('CREATE_FAILED', error.message);
    }
}

export async function adminUpdateShuttleLocation(id, lat, lng) {
    try {
        await requireRole(['ADMIN_TRANSPORT', 'ADMIN']);
        const bus = await prisma.shuttleBus.update({
            where: { id },
            data: { lat, lng, lastUpdated: new Date() }
        });
        revalidatePath('/transport');
        return success(bus);
    } catch (error) {
        return failure('UPDATE_FAILED', error.message);
    }
}

export async function adminDeleteShuttle(id) {
    try {
        await requireRole(['ADMIN_TRANSPORT', 'ADMIN']);
        await prisma.shuttleBus.delete({ where: { id } });
        revalidatePath('/admin/transport');
        return success();
    } catch (error) {
        return failure('DELETE_FAILED', error.message);
    }
}
