import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Commission Rules...');

    const rules = [
        {
            module: 'MEALS',
            providerType: 'MERCHANT',
            unizySharePercent: 20,
            providerSharePercent: 80,
            isActive: true
        },
        {
            module: 'TRANSPORT',
            providerType: 'DRIVER',
            unizySharePercent: 10,
            providerSharePercent: 90,
            isActive: true
        },
        {
            module: 'DELIVERY',
            providerType: 'COURIER',
            unizySharePercent: 15,
            providerSharePercent: 85,
            isActive: true
        }
    ];

    for (const rule of rules) {
        await prisma.commissionRule.upsert({
            where: { id: `rule-${rule.module.toLowerCase()}` },
            update: rule,
            create: {
                id: `rule-${rule.module.toLowerCase()}`,
                ...rule
            }
        });
    }

    console.log('Seeded 3 core commission rules.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
