import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Database...');

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
    },
  });

  const studio = await prisma.housingListing.create({
    data: {
      title: 'Cozy Studio near Science Faculty',
      description: 'Perfect for a single student. 5 mins walk to campus.',
      price: 250,
      type: 'Studio',
      status: 'ACTIVE',
      location: 'North Campus Gate',
      images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80']),
      amenities: JSON.stringify(['WiFi', 'Furnished', 'AC']),
      contact: '+20 123 456 7890',
      providerId: landlord.id,
    },
  });

  const sharedRoom = await prisma.housingListing.create({
    data: {
      title: 'Shared Room in Luxury Dorm',
      description: 'Looking for a roommate for the upcoming semester.',
      price: 150,
      type: 'Shared',
      status: 'ACTIVE',
      location: 'Downtown Student Hub',
      images: JSON.stringify(['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&q=80']),
      amenities: JSON.stringify(['Gym', 'Pool', 'Study Area']),
      contact: '+20 098 765 4321',
      providerId: landlord.id,
    },
  });

  await prisma.verificationDocument.create({
    data: {
      type: 'STUDENT_ID',
      fileUrl: '/mock/student-id.jpg',
      userId: student.id,
      status: 'PENDING',
    },
  });

  await prisma.order.create({
    data: {
      service: 'TRANSPORT',
      total: 15.50,
      details: JSON.stringify({ pickup: 'Library', dropoff: 'Dorm' }),
      userId: student.id,
      status: 'PENDING',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
