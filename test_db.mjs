import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log("Connecting...");
    const count = await prisma.user.count();
    console.log("Users:", count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
