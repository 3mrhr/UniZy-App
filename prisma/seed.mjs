import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'dev.db');
console.log('DB at:', dbPath);

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding Database...');

    const superadmin = await prisma.user.upsert({
        where: { email: 'admin@unizy.com' },
        update: {},
        create: {
            email: 'admin@unizy.com',
            name: 'Super Admin',
            password: 'admin000',
            role: 'ADMIN',
        },
    });

    const landlord = await prisma.user.upsert({
        where: { email: 'landlord@unizy.com' },
        update: {},
        create: {
            email: 'landlord@unizy.com',
            name: 'Campus Properties LLC',
            password: 'password123',
            role: 'PROVIDER',
            phone: '+20 100 000 0001',
        },
    });

    const driver = await prisma.user.upsert({
        where: { email: 'driver@unizy.com' },
        update: {},
        create: {
            email: 'driver@unizy.com',
            name: 'Ahmed (Driver)',
            password: 'password123',
            role: 'DRIVER',
            phone: '+20 100 000 0002',
        },
    });

    const student = await prisma.user.upsert({
        where: { email: 'omar@student.com' },
        update: {},
        create: {
            email: 'omar@student.com',
            name: 'Omar',
            password: 'password123',
            role: 'STUDENT',
            points: 1250,
            phone: '+20 100 000 0003',
        },
    });

    await prisma.housingListing.createMany({
        data: [
            {
                title: 'Cozy Studio near Science Faculty',
                description: 'Perfect for a single student. 5 mins walk to campus.',
                price: 250, type: 'Studio', status: 'ACTIVE', location: 'North Campus Gate',
                images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80']),
                amenities: JSON.stringify(['WiFi', 'Furnished', 'AC', 'Laundry']),
                contact: '+20 123 456 7890', providerId: landlord.id,
            },
            {
                title: 'Shared Room in Luxury Dorm',
                description: 'Modern building with gym and pool access.',
                price: 150, type: 'Shared', status: 'ACTIVE', location: 'Downtown Student Hub',
                images: JSON.stringify(['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&q=80']),
                amenities: JSON.stringify(['Gym', 'Pool', 'Study Area', 'Security']),
                contact: '+20 098 765 4321', providerId: landlord.id,
            },
            {
                title: 'Modern 2BR Apartment',
                description: 'Spacious apartment near the main bus route.',
                price: 400, type: 'Apartment', status: 'PENDING', location: 'East Gate Area',
                images: JSON.stringify(['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=80']),
                amenities: JSON.stringify(['WiFi', 'Parking', 'Balcony', 'Kitchen']),
                contact: '+20 111 222 3333', providerId: landlord.id,
            },
        ],
    });

    await prisma.verificationDocument.createMany({
        data: [
            { type: 'STUDENT_ID', fileUrl: '/mock/student-id.jpg', userId: student.id, status: 'PENDING' },
            { type: 'DRIVERS_LICENSE', fileUrl: '/mock/driver-license.jpg', userId: driver.id, status: 'PENDING' },
        ],
    });

    await prisma.order.create({
        data: {
            service: 'TRANSPORT', total: 15.5,
            details: JSON.stringify({ pickup: 'Library', dropoff: 'North Dorm' }),
            userId: student.id, status: 'PENDING',
        },
    });

    console.log('✅ Database seeded successfully!');
    console.log(`   Users: ${await prisma.user.count()}`);
    console.log(`   Listings: ${await prisma.housingListing.count()}`);
    console.log(`   Verifications: ${await prisma.verificationDocument.count()}`);
    console.log(`   Orders: ${await prisma.order.count()}`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
