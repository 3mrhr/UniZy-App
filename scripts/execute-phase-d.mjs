import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper to randomly select from array
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function executePhaseD() {
    console.log("🚀 STARTING PHASE D: MAIN CLICK-FLOWS SIMULATION...");

    try {
        // Fetch necessary base data
        const students = await prisma.user.findMany({ where: { role: 'STUDENT' } });
        const drivers = await prisma.user.findMany({ where: { role: 'DRIVER' } });
        const merchants = await prisma.user.findMany({ where: { role: 'MERCHANT' } });
        const housingProviders = await prisma.user.findMany({ where: { role: 'HOUSING_PROVIDER' } });

        if (!students.length || !merchants.length) throw new Error("Missing seed data for users/merchants.");

        const meals = await prisma.meal.findMany({ include: { variantGroups: { include: { options: true } }, addonGroups: { include: { options: true } } } });
        const housingListings = await prisma.housingListing.findMany();
        const deals = await prisma.deal.findMany();

        console.log(`🔍 Found: ${students.length} Students, ${drivers.length} Drivers, ${merchants.length} Merchants, ${meals.length} Meals.`);

        // --- D1) Delivery Orders (240 Total) ---
        console.log("\n📦 Generating 240 Delivery Orders...");
        const deliveryTargets = {
            COMPLETED: 180, CANCELLED: 40, FAILED: 10, REFUNDED: 10
        };

        let currentDeliveryCount = 0;
        const createDeliveryOrder = async (statusOverride = 'PENDING') => {
            const student = sample(students);
            const meal = sample(meals);
            const quantity = randomInt(1, 3);
            const total = meal.price * quantity;

            return await prisma.$transaction(async (tx) => {
                const order = await tx.order.create({
                    data: {
                        service: 'DELIVERY',
                        status: statusOverride,
                        total,
                        details: JSON.stringify({ vendorId: meal.merchantId, instructions: Math.random() > 0.5 ? 'Leave at door' : '' }),
                        userId: student.id,
                        orderItems: { create: [{ mealId: meal.id, nameSnapshot: meal.name, basePriceSnapshot: meal.price, qty: quantity }] }
                    }
                });

                const txnCode = 'DLY-' + crypto.randomBytes(4).toString('hex').toUpperCase();
                const transaction = await tx.transaction.create({
                    data: {
                        txnCode, type: 'DELIVERY', status: 'COMPLETED',
                        userId: student.id, providerId: meal.merchantId, amount: total, subtotal: total, grandTotal: total,
                        unizyCommissionAmount: total * 0.1, providerNetAmount: total * 0.9,
                    }
                });

                // If it's delivery and completed, maybe assign a driver
                if (statusOverride === 'DELIVERED' && drivers.length > 0) {
                    await tx.order.update({ where: { id: order.id }, data: { driverId: sample(drivers).id } });
                }

                currentDeliveryCount++;
                if (currentDeliveryCount % 50 === 0) console.log(`  -> Created ${currentDeliveryCount} Delivery Orders...`);
            });
        };

        for (let i = 0; i < deliveryTargets.COMPLETED; i++) await createDeliveryOrder('DELIVERED');
        for (let i = 0; i < deliveryTargets.CANCELLED; i++) await createDeliveryOrder('CANCELLED');
        for (let i = 0; i < deliveryTargets.FAILED; i++) await createDeliveryOrder('FAILED');
        for (let i = 0; i < deliveryTargets.REFUNDED; i++) await createDeliveryOrder('REFUNDED');

        console.log("✅ D1 Delivery Complete.");


        // --- D2) Transport Rides (120 Total) ---
        console.log("\n🚗 Generating 120 Transport Rides...");
        const transportTargets = { COMPLETED: 85, CANCELLED: 20, NO_DRIVER: 10, DISPUTED: 5 };
        let currentTransportCount = 0;

        const createTransportOrder = async (statusOverride = 'PENDING') => {
            const student = sample(students);
            const total = randomInt(20, 150);

            await prisma.$transaction(async (tx) => {
                const order = await tx.order.create({
                    data: {
                        service: 'TRANSPORT',
                        status: statusOverride,
                        total,
                        details: JSON.stringify({ pickup: "Engineering Gate", dropoff: "Student City", vehicle: "Standard" }),
                        userId: student.id,
                    }
                });

                if (statusOverride !== 'CANCELLED' && statusOverride !== 'NO_DRIVER') {
                    const driver = sample(drivers);
                    await tx.order.update({ where: { id: order.id }, data: { driverId: driver?.id } });

                    const txnCode = 'TRN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
                    await tx.transaction.create({
                        data: {
                            txnCode, type: 'TRANSPORT', status: 'COMPLETED',
                            userId: student.id, amount: total, subtotal: total, grandTotal: total,
                            unizyCommissionAmount: total * 0.15, providerNetAmount: total * 0.85, providerId: driver?.id
                        }
                    });
                }
                currentTransportCount++;
                if (currentTransportCount % 30 === 0) console.log(`  -> Created ${currentTransportCount} Transport Orders...`);
            });
        };

        for (let i = 0; i < transportTargets.COMPLETED; i++) await createTransportOrder('COMPLETED');
        for (let i = 0; i < transportTargets.CANCELLED; i++) await createTransportOrder('CANCELLED');
        for (let i = 0; i < transportTargets.NO_DRIVER; i++) await createTransportOrder('NO_DRIVER'); // Map to pending or cancelled later if needed
        for (let i = 0; i < transportTargets.DISPUTED; i++) await createTransportOrder('DISPUTED');

        console.log("✅ D2 Transport Complete.");


        // --- D3) Housing Requests (80 Total) ---
        console.log("\n🏠 Generating 80 Housing Requests...");
        if (housingListings.length > 0) {
            let housingCount = 0;
            for (let i = 0; i < 55; i++) {
                await prisma.housingRequest.create({
                    data: { userId: sample(students).id, housingListingId: sample(housingListings).id, type: 'VIEWING', status: 'ACCEPTED', date: new Date() }
                });
                housingCount++;
            }
            for (let i = 0; i < 25; i++) {
                await prisma.housingRequest.create({
                    data: { userId: sample(students).id, housingListingId: sample(housingListings).id, type: 'BOOKING', status: 'REJECTED' }
                });
                housingCount++;
            }
            console.log(`✅ D3 Housing Complete (${housingCount} requests).`);
        } else {
            console.warn("⚠️ Skipping Housing: No listings found.");
        }


        // --- D4) Support Tickets (60 Total) ---
        console.log("\n🎫 Generating 60 Support Tickets...");
        const ticketCats = ['Delivery', 'Transport', 'Housing'];
        let ticketCount = 0;

        for (let i = 0; i < 40; i++) {
            await prisma.supportTicket.create({
                data: { subject: "Where is my order?", category: sample(ticketCats), priority: 'MEDIUM', status: 'RESOLVED', userId: sample(students).id }
            });
            ticketCount++;
        }
        for (let i = 0; i < 20; i++) {
            await prisma.supportTicket.create({
                data: { subject: "Driver was rude!", category: sample(ticketCats), priority: 'HIGH', status: 'OPEN', userId: sample(students).id }
            });
            ticketCount++;
        }
        console.log(`✅ D4 Support Tickets Complete (${ticketCount} tickets).`);

        console.log("\n🎉 PHASE D EXECUTION FINISHED SUCCESSFULLY!");

    } catch (e) {
        console.error("❌ Phase D Simulation Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

executePhaseD();
