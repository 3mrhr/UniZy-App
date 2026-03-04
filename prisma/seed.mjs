/**
 * UniZy Comprehensive Seed Script
 * Creates: 1 admin, 10 students, 5 merchants (+30 meals), 5 drivers, sample orders
 *
 * Usage:
 *   node prisma/seed.mjs
 *   OR
 *   npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const hash = (pw) => bcrypt.hashSync(pw, 10);
const DEFAULT_PASS = hash('Test1234!');
const uuid = () => crypto.randomUUID();

const MEALS_DATA = {
    // Merchant 0: "Campus Burgers"
    0: [
        { name: 'Classic Burger', price: 65, tags: 'fast food,burger', isPopular: true, description: 'Juicy beef patty with fresh veggies' },
        { name: 'Cheese Burger', price: 80, tags: 'fast food,burger', isPopular: true, description: 'Double cheese with caramelized onions' },
        { name: 'Chicken Burger', price: 70, tags: 'fast food,burger', description: 'Crispy fried chicken with coleslaw' },
        { name: 'Fries', price: 25, tags: 'fast food,fries', description: 'Golden crispy fries with seasoning' },
        { name: 'Onion Rings', price: 30, tags: 'fast food,fries', description: 'Crunchy battered onion rings' },
        { name: 'Milkshake', price: 40, tags: 'drink,beverage', description: 'Thick chocolate or vanilla milkshake' },
    ],
    // Merchant 1: "Green Bowl Kitchen"
    1: [
        { name: 'Caesar Salad', price: 55, tags: 'healthy,salad', isPopular: true, description: 'Romaine lettuce with caesar dressing' },
        { name: 'Quinoa Bowl', price: 75, tags: 'healthy,vegan', isPopular: true, description: 'Protein-packed quinoa with roasted vegetables' },
        { name: 'Grilled Chicken Plate', price: 90, tags: 'healthy', description: 'Herb-marinated grilled chicken breast' },
        { name: 'Fresh Juice', price: 30, tags: 'drink,juice,healthy', description: 'Freshly squeezed orange or apple' },
        { name: 'Avocado Toast', price: 50, tags: 'healthy', description: 'Sourdough toast with smashed avocado' },
        { name: 'Protein Smoothie', price: 45, tags: 'drink,healthy', description: 'Banana, peanut butter & protein' },
    ],
    // Merchant 2: "Sweet Dreams Bakery"
    2: [
        { name: 'Chocolate Cake Slice', price: 45, tags: 'dessert,sweet,chocolate', isPopular: true, description: 'Rich dark chocolate layer cake' },
        { name: 'Kunafa', price: 60, tags: 'dessert,sweet', isPopular: true, description: 'Traditional Egyptian kunafa with cream' },
        { name: 'Cheesecake', price: 55, tags: 'dessert,cake', description: 'New York style cheesecake' },
        { name: 'Brownies (3pc)', price: 35, tags: 'dessert,chocolate,sweet', description: 'Fudgy chocolate brownies' },
        { name: 'Ice Cream Cup', price: 30, tags: 'dessert', description: 'Two scoops of premium ice cream' },
        { name: 'Hot Chocolate', price: 25, tags: 'drink,coffee', description: 'Rich Belgian hot chocolate' },
    ],
    // Merchant 3: "Uni Shawarma"
    3: [
        { name: 'Chicken Shawarma Wrap', price: 40, tags: 'fast food', isPopular: true, description: 'Tender chicken shawarma in lavash' },
        { name: 'Meat Shawarma Plate', price: 65, tags: 'fast food', isPopular: true, description: 'Sliced meat shawarma with rice' },
        { name: 'Falafel Wrap', price: 30, tags: 'fast food,vegan', description: 'Crispy falafel with tahini' },
        { name: 'Hummus Plate', price: 25, tags: 'fast food,vegan', description: 'Creamy hummus with pita bread' },
        { name: 'Mixed Grill', price: 120, tags: 'fast food', description: 'Assorted grilled meats' },
        { name: 'Lemon Mint', price: 15, tags: 'drink,juice', description: 'Fresh lemon with mint' },
    ],
    // Merchant 4: "Caffeine Lab"
    4: [
        { name: 'Espresso', price: 25, tags: 'drink,coffee', isPopular: true, description: 'Double shot espresso' },
        { name: 'Cappuccino', price: 35, tags: 'drink,coffee', isPopular: true, description: 'Classic Italian cappuccino' },
        { name: 'Iced Latte', price: 40, tags: 'drink,coffee', description: 'Cold brew with fresh milk' },
        { name: 'Matcha Latte', price: 45, tags: 'drink,tea', description: 'Premium Japanese matcha' },
        { name: 'Croissant', price: 25, tags: 'dessert', description: 'Butter croissant, baked fresh' },
        { name: 'Club Sandwich', price: 55, tags: 'fast food', description: 'Triple-decker club sandwich' },
    ],
};

const MERCHANT_NAMES = [
    { name: 'Campus Burgers', storeName: 'Campus Burgers', storeDescription: 'Best burgers near campus' },
    { name: 'Green Bowl Kitchen', storeName: 'Green Bowl Kitchen', storeDescription: 'Healthy meals for students' },
    { name: 'Sweet Dreams Bakery', storeName: 'Sweet Dreams', storeDescription: 'Freshly baked desserts daily' },
    { name: 'Uni Shawarma', storeName: 'Uni Shawarma', storeDescription: 'Authentic Middle Eastern food' },
    { name: 'Caffeine Lab', storeName: 'Caffeine Lab', storeDescription: 'Specialty coffee & light bites' },
];

async function main() {
    console.log('🌱 Starting UniZy seed...');

    // ── Admin ──
    const admin = await prisma.user.upsert({
        where: { email: 'admin@unizy.app' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@unizy.app',
            password: DEFAULT_PASS,
            phone: '+201000000000',
            role: 'ADMIN',
            isVerified: true,
            verificationStatus: 'VERIFIED',
            university: 'Assiut University',
            scopes: 'ADMIN_SUPER',
        },
    });
    console.log(`✅ Admin: ${admin.email}`);

    // ── Students (10) ──
    const studentNames = [
        'Ahmed Hassan', 'Sara Mohamed', 'Omar Ali', 'Nour Ibrahim',
        'Youssef Kamal', 'Layla Mostafa', 'Khaled Adel', 'Hana Youssef',
        'Tarek Samir', 'Dina Ashraf'
    ];
    const students = [];
    for (let i = 0; i < 10; i++) {
        const s = await prisma.user.upsert({
            where: { email: `student${i + 1}@unizy.app` },
            update: {},
            create: {
                name: studentNames[i],
                email: `student${i + 1}@unizy.app`,
                password: DEFAULT_PASS,
                phone: `+20100000${String(i + 1).padStart(4, '0')}`,
                role: 'STUDENT',
                isVerified: true,
                verificationStatus: 'VERIFIED',
                university: 'Assiut University',
                faculty: ['Engineering', 'Medicine', 'Science', 'Commerce', 'Pharmacy'][i % 5],
                academicYear: String((i % 4) + 1),
                gender: i % 2 === 0 ? 'Male' : 'Female',
            },
        });
        students.push(s);
    }
    console.log(`✅ ${students.length} Students created`);

    // ── Merchants (5) with Meals ──
    const merchants = [];
    for (let i = 0; i < 5; i++) {
        const m = await prisma.user.upsert({
            where: { email: `merchant${i + 1}@unizy.app` },
            update: {},
            create: {
                name: MERCHANT_NAMES[i].name,
                email: `merchant${i + 1}@unizy.app`,
                password: DEFAULT_PASS,
                phone: `+20200000${String(i + 1).padStart(4, '0')}`,
                role: 'MERCHANT',
                isVerified: true,
                verificationStatus: 'VERIFIED',
                storeName: MERCHANT_NAMES[i].storeName,
                storeAddress: `Building ${i + 1}, Near Assiut University Gate`,
                storeDescription: MERCHANT_NAMES[i].storeDescription,
                storeOpen: true,
            },
        });
        merchants.push(m);

        // Create meals for this merchant
        const mealsForMerchant = MEALS_DATA[i];
        for (const mealData of mealsForMerchant) {
            await prisma.meal.create({
                data: {
                    ...mealData,
                    merchantId: m.id,
                    currency: 'EGP',
                    status: 'ACTIVE',
                    rating: 4.0 + Math.random() * 1.0,
                },
            });
        }
    }
    console.log(`✅ ${merchants.length} Merchants + 30 Meals created`);

    // ── Housing Providers (3) + Listings (15) ──
    const providerNames = ['Emaar Res', 'Student Living', 'Campus Suites'];
    const providers = [];
    for (let i = 0; i < 3; i++) {
        const p = await prisma.user.upsert({
            where: { email: `provider${i + 1}@unizy.app` },
            update: {},
            create: {
                name: providerNames[i],
                email: `provider${i + 1}@unizy.app`,
                password: DEFAULT_PASS,
                phone: `+20400000${String(i + 1).padStart(4, '0')}`,
                role: 'PROVIDER',
                isVerified: true,
                verificationStatus: 'VERIFIED',
            },
        });
        providers.push(p);

        // Create 5 listings per provider
        for (let j = 0; j < 5; j++) {
            await prisma.housingListing.create({
                data: {
                    title: `${p.name} - Suite ${j + 101}`,
                    description: 'Modern student accommodation very close to campus with high-speed internet included.',
                    price: 1500 + (j * 200),
                    type: ['Studio', 'Shared Room', 'Single Room', 'Apartment', 'Studio'][j],
                    location: 'Assiut Al-Gadeeda',
                    images: JSON.stringify(['/placeholder.png']),
                    amenities: JSON.stringify(['WiFi', 'AC', 'Kitchen', 'Laundry']),
                    contact: p.phone,
                    providerId: p.id,
                    status: 'ACTIVE',
                },
            });
        }
    }
    console.log(`✅ ${providers.length} Housing Providers + 15 Listings created`);

    // ── Drivers (5) ──
    const driverNames = ['Mohamed Fahmy', 'Ali Hassan', 'Mostafa Amr', 'Karim El-Said', 'Hamza Nabil'];
    const drivers = [];
    for (let i = 0; i < 5; i++) {
        const d = await prisma.user.upsert({
            where: { email: `driver${i + 1}@unizy.app` },
            update: {},
            create: {
                name: driverNames[i],
                email: `driver${i + 1}@unizy.app`,
                password: DEFAULT_PASS,
                phone: `+20300000${String(i + 1).padStart(4, '0')}`,
                role: 'DRIVER',
                isVerified: true,
                verificationStatus: 'VERIFIED',
            },
        });
        drivers.push(d);
    }
    console.log(`✅ ${drivers.length} Drivers created`);

    // ── Sample Orders in Different States ──
    // Fetch actual meal IDs for each merchant
    const merchantMeals = {};
    for (const m of merchants) {
        merchantMeals[m.id] = await prisma.meal.findMany({ where: { merchantId: m.id } });
    }

    const orderStates = [
        { status: 'PENDING', driverId: null },
        { status: 'ACCEPTED', driverId: null },
        { status: 'PREPARING', driverId: null },
        { status: 'READY', driverId: null },
        { status: 'PICKED_UP', driverIdx: 0 },
        { status: 'DELIVERED', driverIdx: 1 },
        { status: 'DELIVERED', driverIdx: 2 },
    ];

    for (let i = 0; i < orderStates.length; i++) {
        const state = orderStates[i];
        const student = students[i % students.length];
        const merchant = merchants[i % merchants.length];
        const meals = merchantMeals[merchant.id];
        const selectedMeals = meals.slice(0, 2);
        const total = selectedMeals.reduce((sum, m) => sum + m.price, 0);

        const order = await prisma.order.create({
            data: {
                service: 'DELIVERY',
                status: state.status,
                total: total + 15, // + delivery fee
                details: JSON.stringify({ vendor: merchant.name, vendorId: merchant.id }),
                userId: student.id,
                driverId: state.driverIdx !== undefined ? drivers[state.driverIdx].id : null,
                orderItems: {
                    create: selectedMeals.map(meal => ({
                        mealId: meal.id,
                        nameSnapshot: meal.name,
                        basePriceSnapshot: meal.price,
                        qty: 1,
                    })),
                },
            },
        });

        // Create linked transaction
        const txnCode = `TXN-SEED-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        await prisma.transaction.create({
            data: {
                txnCode,
                type: 'DELIVERY',
                status: state.status === 'DELIVERED' ? 'COMPLETED' : 'PENDING',
                userId: student.id,
                providerId: merchant.id,
                orderId: order.id,
                amount: order.total,
                subtotal: total,
                feesTotal: 15,
                deliveryFee: 15,
                grandTotal: order.total,
            },
        });
    }
    console.log(`✅ ${orderStates.length} Sample Orders created`);

    console.log('\n🎉 Seed complete!');
    console.log('\n📋 Login credentials (all use password: Test1234!):');
    console.log('   Admin:     admin@unizy.app');
    console.log('   Students:  student1@unizy.app ... student10@unizy.app');
    console.log('   Merchants: merchant1@unizy.app ... merchant5@unizy.app');
    console.log('   Drivers:   driver1@unizy.app ... driver5@unizy.app');
    console.log('   Providers: provider1@unizy.app ... provider3@unizy.app');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
