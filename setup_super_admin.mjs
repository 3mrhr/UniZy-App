import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'unizy.eg@gmail.com';
    const name = 'Omar';
    const password = 'la lakers';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            name,
            password: hashedPassword,
            role: 'ADMIN_SUPER',
            status: 'ACTIVE',
            isVerified: true,
            verificationStatus: 'VERIFIED'
        },
        create: {
            email,
            name,
            password: hashedPassword,
            role: 'ADMIN_SUPER',
            status: 'ACTIVE',
            isVerified: true,
            verificationStatus: 'VERIFIED'
        },
    });

    console.log(`Super Admin ${admin.name} (${admin.email}) has been set up with God-Mode.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
