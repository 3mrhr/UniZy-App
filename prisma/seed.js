import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing existing users...');
    await prisma.user.deleteMany({});

    console.log('Seeding mock users...');

    // Create students
    await prisma.user.create({
        data: {
            name: 'Omar Student',
            email: 'omar@student.com', // used as username in login
            password: 'password123',
            role: 'STUDENT',
            phone: '01012345678'
        }
    });

    // Create admin
    await prisma.user.create({
        data: {
            name: 'Super Admin',
            email: 'admin@unizy.com',
            password: 'adminpassword',
            role: 'ADMIN',
            phone: '01000000000'
        }
    });

    // Create provider / landlord
    await prisma.user.create({
        data: {
            name: 'Ali Landlord',
            email: 'ali@provider.com',
            password: 'password123',
            role: 'PROVIDER',
            phone: '01111111111'
        }
    });

    // Create merchant
    await prisma.user.create({
        data: {
            name: 'Burger Cafe Owner',
            email: 'burger@merchant.com',
            password: 'password123',
            role: 'MERCHANT',
            phone: '01222222222'
        }
    });

    // Create driver
    await prisma.user.create({
        data: {
            name: 'Mohamed Driver',
            email: 'mohamed@driver.com',
            password: 'password123',
            role: 'DRIVER',
            phone: '01555555555'
        }
    });

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
