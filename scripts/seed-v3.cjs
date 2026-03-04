const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

const bcryptHash = '$2a$10$ZE7n0Z2BX9kWcKQIkMPg5.4l7bLo1CX8FZJuVsJZ7WdpWp9kWe8ri'; // password: Test1234!

// === DATA POOLS ===
const firstNames = ['Ahmed', 'Mohamed', 'Omar', 'Ali', 'Hassan', 'Youssef', 'Karim', 'Tarek', 'Amr', 'Khaled', 'Mahmoud', 'Sara', 'Nour', 'Hana', 'Fatma', 'Laila', 'Dina', 'Aya', 'Reem', 'Mona', 'Salma', 'Yasmin', 'Rana', 'Nada', 'Mariam', 'Aisha', 'Malak', 'Zeinab', 'Habiba', 'Jana', 'Farida', 'Lina', 'Talia', 'Diana', 'Lara', 'Mostafa', 'Ibrahim', 'Adel', 'Waleed', 'Fadi', 'Sami', 'Hossam', 'Sherif', 'Ehab', 'Wael', 'Ramy', 'George', 'Peter', 'John', 'David', 'Michael', 'Sarah', 'Emily', 'Lily', 'Grace', 'Noah', 'Lucas', 'Emma', 'Mia', 'Sophia'];
const lastNames = ['Abdallah', 'Hassan', 'Ibrahim', 'Mostafa', 'Ali', 'Mohamed', 'Mahmoud', 'Elsayed', 'Khalil', 'Naguib', 'Fahmy', 'Saleh', 'Rizk', 'Tawfik', 'Youssef', 'Gamal', 'Farouk', 'Shukri', 'Hamdy', 'Ramadan', 'Ezzat', 'Barakat', 'Mansour', 'Gaber', 'Soliman', 'Hamed', 'Awad', 'Osman', 'Zaki', 'Said'];
const sample = arr => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Phone patterns per country
const phonePatterns = [
    () => '+20' + randomInt(100, 115) + randomInt(1000000, 9999999), // Egypt
    () => '+971' + randomInt(50, 58) + randomInt(1000000, 9999999), // UAE
    () => '+44' + randomInt(7000, 7999) + randomInt(100000, 999999), // UK  
    () => '+966' + randomInt(50, 59) + randomInt(1000000, 9999999), // KSA
    () => '+1' + randomInt(200, 999) + randomInt(2000000, 9999999), // US
];

const universities = ['Cairo University', 'AUC', 'Ain Shams', 'Alexandria', 'Assiut', 'Helwan', 'BUE', 'GUC', 'AAST', 'MSA'];
const locations = ['Nasr City', 'Maadi', 'Zamalek', '6th October', 'New Cairo', 'Heliopolis', 'Dokki', 'Mohandessin'];

async function seed() {
    console.log('\n🏗️ PHASE A: SEEDING 158 USER ACCOUNTS...\n');

    const users = { students: [], merchants: [], drivers: [], housingProviders: [], admins: [] };

    // --- 120 STUDENTS ---
    for (let i = 0; i < 120; i++) {
        const fn = sample(firstNames);
        const ln = sample(lastNames);
        let tag = '';
        if (i < 80) tag = 'normal';
        else if (i < 100) tag = 'power';
        else if (i < 110) tag = 'cancel-heavy';
        else tag = 'edge-case';

        const user = await prisma.user.create({
            data: {
                name: fn + ' ' + ln,
                email: `student${i + 1}@unizy-test.com`,
                password: bcryptHash,
                role: 'STUDENT',
                phone: sample(phonePatterns)(),
                university: sample(universities),
                isVerified: i < 100, // edge-case students not verified
                profileImage: null,
            }
        });
        users.students.push(user);
        if ((i + 1) % 40 === 0) console.log(`  → Created ${i + 1}/120 students`);
    }
    console.log(`✅ 120 Students created (80 normal, 20 power, 10 cancel-heavy, 10 edge-case)\n`);

    // --- 10 MERCHANTS ---
    const merchantNames = ['Cairo Bites', 'Nile Grill', 'Pharaoh Shawarma', 'Sphinx Pizza', 'Delta Sushi', 'Pyramids Burger', 'Luxor Wraps', 'Aswan Falafel', 'Alexandria Seafood', 'Helwan Kitchen'];
    for (let i = 0; i < 10; i++) {
        const user = await prisma.user.create({
            data: {
                name: merchantNames[i],
                email: `merchant${i + 1}@unizy-test.com`,
                password: bcryptHash,
                role: 'MERCHANT',
                phone: sample(phonePatterns)(),
                isVerified: true,
            }
        });
        users.merchants.push(user);
    }
    console.log(`✅ 10 Merchants created\n`);

    // --- 10 DRIVERS ---
    for (let i = 0; i < 10; i++) {
        const fn = sample(firstNames);
        const ln = sample(lastNames);
        const user = await prisma.user.create({
            data: {
                name: fn + ' ' + ln,
                email: `driver${i + 1}@unizy-test.com`,
                password: bcryptHash,
                role: 'DRIVER',
                phone: sample(phonePatterns)(),
                isVerified: true,
            }
        });
        users.drivers.push(user);
    }
    console.log(`✅ 10 Drivers created\n`);

    // --- 6 HOUSING PROVIDERS ---
    const housingNames = ['UniStay Residences', 'CampusNest Housing', 'StudentVille Properties', 'NileSide Apartments', 'AcademyLiving', 'GreenCampus Homes'];
    for (let i = 0; i < 6; i++) {
        const user = await prisma.user.create({
            data: {
                name: housingNames[i],
                email: `housing${i + 1}@unizy-test.com`,
                password: bcryptHash,
                role: 'PROVIDER',
                phone: sample(phonePatterns)(),
                isVerified: true,
            }
        });
        users.housingProviders.push(user);
    }
    console.log(`✅ 6 Housing Providers created\n`);

    // --- 4 OTHER PROVIDERS (2 Meals, 2 Support) ---
    for (let i = 0; i < 4; i++) {
        await prisma.user.create({
            data: {
                name: `ServiceProvider ${i + 1}`,
                email: `service${i + 1}@unizy-test.com`,
                password: bcryptHash,
                role: 'PROVIDER',
                phone: sample(phonePatterns)(),
                isVerified: true,
            }
        });
    }
    console.log(`✅ 4 Service Providers created\n`);

    // --- 8 ADMINS ---
    const adminRoles = [
        { name: 'Super Admin', email: 'superadmin@unizy-test.com', role: 'ADMIN' },
        { name: 'Finance Admin', email: 'finance@unizy-test.com', role: 'ADMIN' },
        { name: 'Support Admin', email: 'support@unizy-test.com', role: 'ADMIN' },
        { name: 'Ops Admin 1', email: 'ops1@unizy-test.com', role: 'ADMIN' },
        { name: 'Ops Admin 2', email: 'ops2@unizy-test.com', role: 'ADMIN' },
        { name: 'Ops Admin 3', email: 'ops3@unizy-test.com', role: 'ADMIN' },
        { name: 'Ops Admin 4', email: 'ops4@unizy-test.com', role: 'ADMIN' },
        { name: 'Ops Admin 5', email: 'ops5@unizy-test.com', role: 'ADMIN' },
    ];
    for (const admin of adminRoles) {
        const user = await prisma.user.create({
            data: { ...admin, password: bcryptHash, phone: sample(phonePatterns)(), isVerified: true }
        });
        users.admins.push(user);
    }
    console.log(`✅ 8 Admins created (1 Super, 1 Finance, 1 Support, 5 Ops)\n`);

    // =====================================================
    console.log('🏗️ PHASE B: MARKETPLACE SEEDING...\n');

    // --- 150 Meals (15 per merchant) ---
    const mealCategories = ['Sandwiches', 'Pizza', 'Pasta', 'Rice Bowls', 'Salads', 'Drinks', 'Desserts', 'Breakfast'];
    const mealTemplates = [
        { name: 'Classic Chicken Shawarma', price: 55, desc: 'Grilled chicken in fresh pita bread' },
        { name: 'Cheese Burger', price: 75, desc: 'Juicy beef patty with melted cheese' },
        { name: 'Margherita Pizza', price: 120, desc: 'Classic tomato and mozzarella' },
        { name: 'Penne Arrabiata', price: 85, desc: 'Spicy tomato pasta' },
        { name: 'Grilled Chicken Rice Bowl', price: 90, desc: 'Basmati rice with grilled chicken' },
        { name: 'Caesar Salad', price: 65, desc: 'Romaine, croutons, parmesan' },
        { name: 'Fresh Mango Juice', price: 35, desc: 'Freshly squeezed mango' },
        { name: 'Chocolate Brownie', price: 45, desc: 'Rich dark chocolate brownie' },
        { name: 'Egg Benedict', price: 95, desc: 'Poached eggs, hollandaise' },
        { name: 'Falafel Wrap', price: 40, desc: 'Crispy falafel in wrap bread' },
        { name: 'BBQ Wings', price: 85, desc: '8 pieces, smoky BBQ glaze' },
        { name: 'Mushroom Risotto', price: 110, desc: 'Creamy arborio rice' },
        { name: 'Fruit Smoothie', price: 45, desc: 'Mixed berry smoothie' },
        { name: 'Tiramisu', price: 60, desc: 'Italian coffee dessert' },
        { name: 'Beef Kofta Plate', price: 100, desc: 'Grilled kofta with tahini' },
    ];

    let mealCount = 0;
    for (const merchant of users.merchants) {
        for (let i = 0; i < 15; i++) {
            const tmpl = mealTemplates[i];
            const mealName = merchant.name + ' ' + tmpl.name;

            // Determine meal type
            let stockCount = null;
            let isSoldOut = false;
            let status = 'ACTIVE';
            if (i < 5) { /* normal */ }
            else if (i < 9) { /* variant */ }
            else if (i < 12) { /* addon */ }
            else if (i < 14) { stockCount = randomInt(3, 10); } // limited stock
            else { isSoldOut = true; stockCount = 0; status = 'INACTIVE'; } // out of stock

            const meal = await prisma.meal.create({
                data: {
                    name: mealName,
                    description: tmpl.desc,
                    price: tmpl.price + randomInt(-10, 15),
                    tags: sample(mealCategories).toLowerCase(),
                    merchantId: merchant.id,
                    isSoldOut,
                    status,
                    stockCount,
                    image: null,
                }
            });

            // Add variants for meals 5-8
            if (i >= 5 && i < 9) {
                const vg = await prisma.mealVariantGroup.create({
                    data: {
                        mealId: meal.id,
                        name: 'Size',
                        required: true,
                        maxSelect: 1,
                    }
                });
                for (const [optName, delta] of [['Small', 0], ['Medium', 15], ['Large', 30]]) {
                    await prisma.mealVariantOption.create({
                        data: { groupId: vg.id, name: optName, priceDelta: delta }
                    });
                }
            }

            // Add addons for meals 9-11
            if (i >= 9 && i < 12) {
                const ag = await prisma.mealAddonGroup.create({
                    data: {
                        mealId: meal.id,
                        name: 'Extras',
                        maxSelect: 3,
                    }
                });
                for (const [optName, delta] of [['Extra Cheese', 10], ['Mushrooms', 8], ['Bacon', 15], ['Avocado', 12]]) {
                    await prisma.mealAddonOption.create({
                        data: { groupId: ag.id, name: optName, priceDelta: delta }
                    });
                }
            }
            mealCount++;
        }
        console.log(`  → ${merchant.name}: 15 meals created`);
    }
    console.log(`✅ ${mealCount} Meals created (50 normal, 40 w/variants, 30 w/addons, 20 limited, 10 OOS)\n`);

    // --- 20 Deals ---
    for (let i = 0; i < 20; i++) {
        const isPct = i < 10;
        await prisma.deal.create({
            data: {
                title: isPct ? `${randomInt(10, 30)}% Off ${sample(mealCategories)}` : `${randomInt(10, 50)} EGP Off Your Order`,
                description: isPct ? 'Percentage discount' : 'Fixed amount off',
                discount: isPct ? `${randomInt(10, 30)}%` : `${randomInt(10, 50)} EGP`,
                category: sample(mealCategories).toLowerCase(),
                originalPrice: 100,
                discountPrice: isPct ? 100 - randomInt(10, 30) : 100 - randomInt(10, 50),
                merchantId: sample(users.merchants).id,
                status: 'ACTIVE',
            }
        });
    }
    console.log(`✅ 20 Deals created (10 percentage, 10 fixed)\n`);

    // --- 40 Housing Listings ---
    const housingTypes = ['Studio', 'Single Room', 'Shared Room', 'Apartment'];
    const housingAreas = ['Near Campus', 'City Center', 'Student District', 'Suburban'];
    let listingCount = 0;
    for (const provider of users.housingProviders) {
        const numListings = provider === users.housingProviders[0] ? 8 : randomInt(5, 8);
        for (let i = 0; i < numListings && listingCount < 40; i++) {
            await prisma.housingListing.create({
                data: {
                    title: `${sample(housingTypes)} - ${sample(housingAreas)} #${listingCount + 1}`,
                    description: `Comfortable student housing near ${sample(universities)}. Fully furnished.`,
                    price: randomInt(2000, 8000),
                    type: sample(housingTypes),
                    status: listingCount < 12 ? 'APPROVED' : (listingCount < 30 ? 'PENDING' : 'REJECTED'),
                    location: sample(housingAreas),
                    images: JSON.stringify([]),
                    amenities: JSON.stringify(['WiFi', 'AC', 'Kitchen', 'Laundry'].slice(0, randomInt(2, 4))),
                    providerId: provider.id,
                }
            });
            listingCount++;
        }
    }
    console.log(`✅ ${listingCount} Housing Listings created (12 approved, 18 pending, 10 rejected)\n`);

    // --- 20 Promo Codes ---
    for (let i = 0; i < 20; i++) {
        await prisma.promoCode.create({
            data: {
                code: `UNIZY${String(i + 1).padStart(2, '0')}`,
                discountAmount: randomInt(5, 25),
                discountType: i < 10 ? 'PERCENTAGE' : 'FIXED',
                applicableType: 'ALL',
                maxUses: randomInt(10, 100),
                currentUses: 0,
                isActive: i < 15, // 5 inactive
                expiresAt: new Date(Date.now() + randomInt(7, 60) * 24 * 60 * 60 * 1000),
            }
        });
    }
    console.log(`✅ 20 Promo Codes created (15 active, 5 inactive)\n`);

    // --- Pricing Rules ---
    await prisma.pricingRule.create({
        data: {
            module: 'DELIVERY',
            serviceType: 'STANDARD',
            basePrice: 15,
            feeComponents: JSON.stringify({ deliveryFee: 15, serviceFee: 5 }),
            isActive: true,
        }
    });
    await prisma.pricingRule.create({
        data: {
            module: 'TRANSPORT',
            serviceType: 'STANDARD',
            basePrice: 25,
            feeComponents: JSON.stringify({ baseFare: 25, perKm: 3 }),
            isActive: true,
        }
    });
    console.log(`✅ Pricing Rules created (Delivery: 15 EGP base, Transport: 25 EGP base)\n`);

    // --- Commission Rules ---
    await prisma.commissionRule.create({
        data: {
            module: 'DELIVERY',
            providerType: 'MERCHANT',
            unizySharePercent: 15,
            providerSharePercent: 85,
            isActive: true,
        }
    });
    await prisma.commissionRule.create({
        data: {
            module: 'TRANSPORT',
            providerType: 'DRIVER',
            unizySharePercent: 20,
            providerSharePercent: 80,
            isActive: true,
        }
    });
    console.log(`✅ Commission Rules created (Delivery: 15% Unizy, Transport: 20% Unizy)\n`);

    // === FINAL COUNTS ===
    const finalCounts = {
        users: await prisma.user.count(),
        students: await prisma.user.count({ where: { role: 'STUDENT' } }),
        merchants: await prisma.user.count({ where: { role: 'MERCHANT' } }),
        drivers: await prisma.user.count({ where: { role: 'DRIVER' } }),
        providers: await prisma.user.count({ where: { role: 'PROVIDER' } }),
        admins: await prisma.user.count({ where: { role: 'ADMIN' } }),
        meals: await prisma.meal.count(),
        deals: await prisma.deal.count(),
        housing: await prisma.housingListing.count(),
        promos: await prisma.promoCode.count(),
        pricingRules: await prisma.pricingRule.count(),
        commissionRules: await prisma.commissionRule.count(),
    };

    console.log('\n📊 PHASE A+B SEEDING REPORT:');
    console.log(JSON.stringify(finalCounts, null, 2));
    console.log('\n🎉 PHASE A+B COMPLETE!');
    await prisma.$disconnect();
}

seed().catch(e => { console.error('❌ SEED FAILED:', e); process.exit(1); });
