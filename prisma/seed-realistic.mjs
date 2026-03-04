import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Data Pools
const firstNamesEN = ['Omar', 'Ahmed', 'Youssef', 'Ali', 'Mostafa', 'Mohamed', 'Kareem', 'Hassan', 'Mahmoud', 'Ibrahim', 'Nour', 'Salma', 'Mariam', 'Fatima', 'Aya', 'Hana', 'Laila', 'Habiba', 'Malak'];
const lastNamesEN = ['El-Sayed', 'Tarek', 'Abdullah', 'Mansour', 'Hassan', 'Salem', 'Fawzy', 'Radwan', 'El-Masry', 'Gad', 'Abdel-Rahman', 'Soliman', 'Kassem'];
const firstNamesAR = ['عمر', 'أحمد', 'يوسف', 'علي', 'مصطفى', 'محمد', 'كريم', 'حسن', 'محمود', 'إبراهيم', 'نور', 'سلمى', 'مريم', 'فاطمة', 'آية', 'هنا', 'ليلى', 'حبيبة', 'ملك'];
const lastNamesAR = ['السيد', 'طارق', 'عبدالله', 'منصور', 'حسن', 'سالم', 'فوزي', 'رضوان', 'المصري', 'جاد', 'عبدالرحمن', 'سليمان', 'قاسم'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBool = () => Math.random() > 0.5;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Phone Number Generators
const generateEgyptianPhone = () => {
    const prefixes = ['10', '11', '12', '15'];
    const p = randomItem(prefixes);
    const num = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    // Vary the format slightly: sometimes internal spaces, sometimes no spaces, sometimes +20 vs 0
    const format = randomInt(1, 3);
    if (format === 1) return `+20 ${p}${num.slice(0, 4)} ${num.slice(4)}`;
    if (format === 2) return `+20${p}${num}`;
    return `0${p}${num}`;
};

const generateUAEPhone = () => {
    const prefixes = ['50', '52', '55', '56'];
    const p = randomItem(prefixes);
    const num = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    const format = randomInt(1, 2);
    if (format === 1) return `+971 ${p} ${num.slice(0, 3)} ${num.slice(3)}`;
    return `+971${p}${num}`;
};

const generateIntlPhone = () => {
    const format = randomInt(1, 2);
    if (format === 1) return `+44 7${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`; // UK
    return `+1 ${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`; // US
};

const generatePhone = () => {
    const rand = Math.random();
    if (rand < 0.7) return generateEgyptianPhone();
    if (rand < 0.9) return generateUAEPhone();
    return generateIntlPhone();
};

const generateName = () => {
    const isArabic = randomBool();
    const fNames = isArabic ? firstNamesAR : firstNamesEN;
    const lNames = isArabic ? lastNamesAR : lastNamesEN;

    // Sometimes double first name or hyphenated last name
    const hasDoubleFirst = Math.random() < 0.1;
    const hasHyphenatedLast = Math.random() < 0.1;

    let first = randomItem(fNames);
    if (hasDoubleFirst) first += ' ' + randomItem(fNames);

    let last = randomItem(lNames);
    if (hasHyphenatedLast) last += '-' + randomItem(lastNamesEN); // Keep hyphenated mostly EN for simplicity

    return `${first} ${last}`;
};

const cleanEmail = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '') + randomInt(10, 99) + '@' + randomItem(['gmail.com', 'outlook.com', 'yahoo.com', 'icloud.com']);
};

// Generate Addresses
const areas = ['New Cairo', 'Maadi', 'Zamalek', 'Nasr City', 'Heliopolis', '6th of October', 'Sheikh Zayed', 'Rehab City', 'Madinaty'];
const generateAddress = () => {
    const street = `St ${randomInt(1, 100)}`;
    const bldg = `Bldg ${randomInt(1, 200)}`;
    const area = randomItem(areas);
    const hasNotes = Math.random() < 0.3;
    let base = `${bldg}, ${street}, ${area}, Cairo`;
    if (hasNotes) base += ` (Near ${randomItem(['Supermarket', 'Pharmacy', 'Mosque', 'School'])})`;
    return base;
};

async function main() {
    console.log('--- STARTING REALISTIC SEED SCRIPT ---');

    console.log('1. Wiping existing dev data... (Cleaning Slate)');
    await prisma.transaction.deleteMany({});
    await prisma.orderItemAddonSelection.deleteMany({});
    await prisma.orderItemVariantSelection.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.mealAddonOption.deleteMany({});
    await prisma.mealAddonGroup.deleteMany({});
    await prisma.mealVariantOption.deleteMany({});
    await prisma.mealVariantGroup.deleteMany({});
    await prisma.meal.deleteMany({});
    await prisma.deal.deleteMany({});
    await prisma.housingListing.deleteMany({});
    await prisma.promoCode.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Data wiped.');

    const passwordHash = await bcrypt.hash('password123', 10);
    const allUsers = [];

    // ==========================================
    // A) TEST POPULATION
    // ==========================================
    console.log('2. Generating Realistic Users...');

    // 120 Students
    for (let i = 0; i < 120; i++) {
        const name = generateName();
        const role = 'STUDENT';
        let specialFlag = '';
        if (i < 80) specialFlag = 'NORMAL';
        else if (i < 100) specialFlag = 'POWER_USER';
        else if (i < 110) specialFlag = 'REFUND_HEAVY';
        else specialFlag = 'EDGE_CASE';

        let pName = name;
        if (specialFlag === 'EDGE_CASE') {
            pName = `X__${name}__*%$`; // weird name
        }

        allUsers.push({
            name: pName,
            email: cleanEmail(name),
            password: passwordHash,
            phone: generatePhone(),
            role: role,
            referralCode: crypto.randomBytes(4).toString('hex').toUpperCase()
        });
    }

    // 30 Providers (10 Riders, 10 Merchants, 6 Housing, 2 Meals, 2 Support)
    const providerConfig = [
        { count: 10, role: 'DRIVER', label: 'Rider' },
        { count: 10, role: 'MERCHANT', label: 'Store' },
        { count: 6, role: 'PROVIDER', label: 'Housing' }, // Original housing provider role
        { count: 2, role: 'PROVIDER', label: 'Meal Partner' },
        { count: 2, role: 'SUPPORT', label: 'Support Agent' }
    ];

    providerConfig.forEach(conf => {
        for (let i = 0; i < conf.count; i++) {
            const name = generateName();
            allUsers.push({
                name: `${name} (${conf.label})`,
                email: cleanEmail(`provider_${conf.label}_${i}_${name}`),
                password: passwordHash,
                phone: generatePhone(),
                role: conf.role,
                referralCode: crypto.randomBytes(4).toString('hex').toUpperCase()
            });
        }
    });

    // 8 Admins (5 Ops, 1 Finance, 1 Support, 1 Super)
    const adminConfig = [
        { count: 5, role: 'ADMIN', moduleScope: ['DELIVERY', 'TRANSPORT'] }, // Ops
        { count: 1, role: 'ADMIN', moduleScope: ['FINANCE'] },
        { count: 1, role: 'SUPPORT', moduleScope: ['GENERAL'] }, // Support mapped to support
        { count: 1, role: 'SUPERADMIN', moduleScope: ['ALL'] }
    ];

    adminConfig.forEach(conf => {
        for (let i = 0; i < conf.count; i++) {
            const name = generateName();
            allUsers.push({
                name: `${name} (${conf.role} - ${conf.moduleScope[0]})`,
                email: cleanEmail(`admin_${conf.moduleScope[0]}_${i}_${name}`),
                password: passwordHash,
                phone: generatePhone(),
                role: conf.role,
                referralCode: crypto.randomBytes(4).toString('hex').toUpperCase()
            });
        }
    });

    // Bulk Create Users
    console.log(`Inserting ${allUsers.length} total users...`);
    const createdUsers = [];
    for (const u of allUsers) {
        // Enforce uniqueness
        const exists = await prisma.user.findUnique({ where: { email: u.email } });
        if (!exists) {
            const inserted = await prisma.user.create({ data: u });
            createdUsers.push(inserted);
        }
    }

    const merchants = createdUsers.filter(u => u.name.includes('(Store)'));
    const housingProviders = createdUsers.filter(u => u.name.includes('(Housing)'));

    // ==========================================
    // B) MARKETPLACE SEED
    // ==========================================
    console.log('3. Generating Marketplace Items (150 Items across 10 Merchants)...');

    // 10 merchants, 15 items per merchant
    // 5 normal, 4 variants, 3 add-ons, 2 limited, 1 out of stock

    const categories = ['Fast Food', 'Healthy', 'Desserts', 'Beverages', 'Grocery'];

    for (const merchant of merchants) {
        // 5 Normal Items
        for (let i = 0; i < 5; i++) {
            await prisma.meal.create({
                data: {
                    merchantId: merchant.id,
                    name: `Standard Meal ${i + 1}`,
                    description: 'A delicious standard item.',
                    price: randomInt(50, 150),
                    tags: randomItem(categories),
                    trackInventory: false
                }
            });
        }

        // 4 Items with Variants
        for (let i = 0; i < 4; i++) {
            const meal = await prisma.meal.create({
                data: {
                    merchantId: merchant.id,
                    name: `Variant Master Meal ${i + 1}`,
                    description: 'Choose your size and flavor.',
                    price: randomInt(100, 200),
                    tags: randomItem(categories),
                    trackInventory: false
                }
            });
            // Variants
            const group = await prisma.mealVariantGroup.create({
                data: { mealId: meal.id, name: 'Size', required: true }
            });
            await prisma.mealVariantOption.createMany({
                data: [
                    { groupId: group.id, name: 'Medium', priceDelta: 0 },
                    { groupId: group.id, name: 'Large', priceDelta: 30 }
                ]
            });
        }

        // 3 Items with Add-ons
        for (let i = 0; i < 3; i++) {
            const meal = await prisma.meal.create({
                data: {
                    merchantId: merchant.id,
                    name: `Add-on Heavy Meal ${i + 1}`,
                    description: 'Customize with extras.',
                    price: randomInt(80, 120),
                    tags: randomItem(categories),
                    trackInventory: false
                }
            });
            // Addons
            const group = await prisma.mealAddonGroup.create({
                data: { mealId: meal.id, name: 'Extras', maxSelect: 3 }
            });
            await prisma.mealAddonOption.createMany({
                data: [
                    { groupId: group.id, name: 'Extra Cheese', priceDelta: 15 },
                    { groupId: group.id, name: 'Bacon', priceDelta: 25 },
                    { groupId: group.id, name: 'Spicy Sauce', priceDelta: 5 }
                ]
            });
        }

        // 2 Limited Stock Items
        for (let i = 0; i < 2; i++) {
            await prisma.meal.create({
                data: {
                    merchantId: merchant.id,
                    name: `Limited Edition Meal ${i + 1}`,
                    description: 'Hurry, almost gone!',
                    price: randomInt(150, 300),
                    tags: randomItem(categories),
                    trackInventory: true,
                    stockCount: randomInt(2, 5) // Low stock
                }
            });
        }

        // 1 Out of Stock Item
        await prisma.meal.create({
            data: {
                merchantId: merchant.id,
                name: `Sold Out Signature Item`,
                description: 'We are out of this popular item.',
                price: 250,
                tags: randomItem(categories),
                trackInventory: true,
                stockCount: 0,
                isSoldOut: true
            }
        });
    }

    console.log('4. Generating Deals/Promos (20)...');
    for (let i = 0; i < 10; i++) {
        await prisma.promoCode.create({
            data: {
                code: `PCT${i + 1}0`,
                discountType: 'PERCENTAGE',
                discountAmount: randomItem([10, 15, 20, 25]),
                applicableType: 'DELIVERY',
                isActive: true,
                maxUses: randomInt(50, 100)
            }
        });
        await prisma.promoCode.create({
            data: {
                code: `FIXED${i + 1}0`,
                discountType: 'FIXED',
                discountAmount: randomItem([10, 20, 30, 50, 80]),
                applicableType: 'DELIVERY',
                isActive: true,
                maxUses: randomInt(50, 100)
            }
        });
    }

    console.log('5. Generating Housing Listings (40)...');
    let housingListCount = 0;
    for (const hProv of housingProviders) {
        for (let i = 0; i < 7; i++) { // Roughly 40 total
            if (housingListCount >= 40) break;
            await prisma.housingListing.create({
                data: {
                    providerId: hProv.id,
                    title: `Premium Housing ${housingListCount + 1}`,
                    description: 'A great place to live.',
                    type: randomItem(['Studio', 'Apartment', 'Shared Room']),
                    price: randomItem([1200, 1500, 1800, 2200, 2700, 3200]),
                    location: generateAddress(),
                    contact: hProv.phone,
                    amenities: JSON.stringify(['Wifi', 'AC', 'Furnished']),
                    images: JSON.stringify(['/placeholder/housing.jpg']),
                    status: 'ACTIVE'
                }
            });
            housingListCount++;
        }
    }

    console.log('--- SEED SCRIPT COMPLETE ---');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
