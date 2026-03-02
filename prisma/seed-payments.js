import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedPayments() {
    console.log("Seeding Payments for existing Transactions...");

    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                payments: {
                    none: {}
                }
            }
        });

        console.log(`Found ${transactions.length} transactions without a payment record.`);

        let createdCount = 0;
        for (const txn of transactions) {
            // Basic mock payment mapping
            const method = ["COD", "CASH", "CARD"][Math.floor(Math.random() * 3)];
            let status = "PENDING";
            let paidAt = null;

            if (txn.status === "COMPLETED") {
                status = "PAID";
                paidAt = new Date();
            } else if (txn.status === "FAILED" || txn.status === "CANCELLED") {
                status = "FAILED";
            }

            await prisma.payment.create({
                data: {
                    transactionId: txn.id,
                    amount: txn.amount || 100, // fallback to 100 if 0
                    currency: txn.currency || "EGP",
                    method,
                    status,
                    paidAt
                }
            });
            createdCount++;
        }

        console.log(`Successfully created ${createdCount} payment records.`);
    } catch (error) {
        console.error("Error seeding payments:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedPayments();
