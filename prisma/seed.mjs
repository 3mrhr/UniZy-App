import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hash(pw) {
    return bcrypt.hash(pw, 10);
}

async function main() {
    console.log('🌱 Seeding UniZy Database (Full Mockup)...\n');

    // ───────────────────── 1. USERS (9 roles) ─────────────────────
    const users = {};
    const userDefs = [
        { key: 'superadmin', email: 'superadmin@unizy.com', name: 'Super Admin', password: 'admin123', role: 'SUPERADMIN', isVerified: true, verificationStatus: 'VERIFIED', phone: '+20 100 000 0000' },
        { key: 'deliveryAdmin', email: 'delivery@unizy.com', name: 'Delivery Admin', password: 'delivery123', role: 'ADMIN_DELIVERY', isVerified: true, verificationStatus: 'VERIFIED', phone: '+20 100 000 0010' },
        { key: 'transportAdmin', email: 'transport@unizy.com', name: 'Transport Admin', password: 'transport123', role: 'ADMIN_TRANSPORT', isVerified: true, verificationStatus: 'VERIFIED', phone: '+20 100 000 0020' },
        { key: 'housingAdmin', email: 'housing@unizy.com', name: 'Housing Admin', password: 'housing123', role: 'ADMIN_HOUSING', isVerified: true, verificationStatus: 'VERIFIED', phone: '+20 100 000 0030' },
        { key: 'commerceAdmin', email: 'commerce@unizy.com', name: 'Commerce Admin', password: 'commerce123', role: 'ADMIN_COMMERCE', isVerified: true, verificationStatus: 'VERIFIED', phone: '+20 100 000 0040' },
        { key: 'driver', email: 'driver@unizy.com', name: 'Ahmed (Driver)', password: 'driver123', role: 'DRIVER', isVerified: true, verificationStatus: 'VERIFIED', phone: '+20 100 000 0002' },
        { key: 'provider', email: 'provider@unizy.com', name: 'Campus Properties LLC', password: 'provider123', role: 'PROVIDER', isVerified: true, verificationStatus: 'VERIFIED', phone: '+20 100 000 0001' },
        { key: 'merchant', email: 'merchant@unizy.com', name: 'Campus Burgers', password: 'merchant123', role: 'MERCHANT', isVerified: true, verificationStatus: 'VERIFIED', phone: '+20 100 000 0003', profileImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' },
        { key: 'student', email: 'student@unizy.com', name: 'Omar (Student)', password: 'student123', role: 'STUDENT', isVerified: true, verificationStatus: 'VERIFIED', phone: '+20 100 000 0004', points: 1250, university: 'Assiut University', faculty: 'Engineering', referralCode: 'OMAR2026' },
    ];

    for (const u of userDefs) {
        const hashed = await hash(u.password);
        users[u.key] = await prisma.user.upsert({
            where: { email: u.email },
            update: { password: hashed, role: u.role, isVerified: u.isVerified, verificationStatus: u.verificationStatus },
            create: {
                email: u.email,
                name: u.name,
                password: hashed,
                role: u.role,
                phone: u.phone || null,
                isVerified: u.isVerified || false,
                verificationStatus: u.verificationStatus || 'UNVERIFIED',
                points: u.points || 0,
                university: u.university || 'Assiut University',
                faculty: u.faculty || null,
                referralCode: u.referralCode || null,
                profileImage: u.profileImage || null,
            },
        });
    }
    console.log(`✅ Users: ${Object.keys(users).length} accounts upserted`);

    // ───────────────────── 2. HOUSING LISTINGS (10) ─────────────────────
    await prisma.housingListing.deleteMany();
    const housingData = [
        { title: 'Cozy Studio near Science Faculty', description: 'Perfect for a single student. 5 mins walk to campus. Fully furnished with AC and high-speed WiFi.', price: 2500, type: 'Studio', status: 'ACTIVE', location: 'North Campus Gate', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&q=80'], amenities: ['WiFi', 'Furnished', 'AC', 'Laundry'], contact: '+20 123 456 7890' },
        { title: 'Shared Room in Luxury Dorm', description: 'Modern building with gym and pool access. 24/7 security and cleaning service included.', price: 1500, type: 'Shared', status: 'ACTIVE', location: 'Downtown Student Hub', images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&q=80'], amenities: ['Gym', 'Pool', 'Study Area', 'Security'], contact: '+20 098 765 4321' },
        { title: 'Modern 2BR Apartment', description: 'Spacious apartment near the main bus route. Great for 2 students sharing.', price: 4000, type: 'Apartment', status: 'ACTIVE', location: 'East Gate Area', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=80'], amenities: ['WiFi', 'Parking', 'Balcony', 'Kitchen'], contact: '+20 111 222 3333' },
        { title: 'Budget Single Room', description: 'Clean and quiet. Close to the library and cafeteria.', price: 800, type: 'Shared', status: 'ACTIVE', location: 'Library Lane', images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80'], amenities: ['WiFi', 'Desk', 'Closet'], contact: '+20 100 333 4444' },
        { title: 'Penthouse with City View', description: 'Premium top-floor apartment with panoramic views. All bills included.', price: 6000, type: 'Apartment', status: 'ACTIVE', location: 'University Heights', images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80'], amenities: ['WiFi', 'AC', 'Gym', 'Rooftop', 'Parking'], contact: '+20 100 555 6666' },
        { title: 'Female-Only Shared Suite', description: 'Safe and secure female-only accommodation. Ground floor with garden access.', price: 1800, type: 'Shared', status: 'ACTIVE', location: 'South Campus', images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500&q=80'], amenities: ['Security', 'Garden', 'Furnished', 'Kitchen'], contact: '+20 100 777 8888' },
        { title: 'Studio with Kitchenette', description: 'Self-contained studio with a small kitchen. Perfect for independent living.', price: 3000, type: 'Studio', status: 'ACTIVE', location: 'West Gate', images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500&q=80'], amenities: ['Kitchen', 'WiFi', 'AC', 'Washing Machine'], contact: '+20 100 999 0000' },
        { title: 'Furnished Room in Family House', description: 'Quiet residential area. Meals can be arranged with the family.', price: 1200, type: 'Shared', status: 'ACTIVE', location: 'Residential Quarter', images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&q=80'], amenities: ['Meals Available', 'WiFi', 'Furnished'], contact: '+20 100 111 2222' },
        { title: 'New Build 3BR Flat', description: 'Brand new construction. Modern finishes, elevator, underground parking.', price: 5500, type: 'Apartment', status: 'PENDING', location: 'New Campus Extension', images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=500&q=80'], amenities: ['Elevator', 'Parking', 'AC', 'Balcony', 'Security'], contact: '+20 100 444 5555' },
        { title: 'Economy Bed in 4-Person Dorm', description: 'Most affordable option. Shared bathroom and common area. Great community vibe.', price: 600, type: 'Shared', status: 'PENDING', location: 'Budget Block', images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500&q=80'], amenities: ['WiFi', 'Common Area', 'Laundry'], contact: '+20 100 666 7777' },
    ];
    await prisma.housingListing.createMany({
        data: housingData.map(h => ({
            ...h,
            images: JSON.stringify(h.images),
            amenities: JSON.stringify(h.amenities),
            providerId: users.provider.id,
        })),
    });
    console.log(`✅ Housing: ${housingData.length} listings`);

    // ───────────────────── 3. DEALS (10) ─────────────────────
    await prisma.savedDeal.deleteMany();
    await prisma.deal.deleteMany();
    const dealData = [
        { title: '50% Off Second Burger', description: 'Buy any burger, get the second one half price!', discount: '50%', category: 'food', originalPrice: 85, discountPrice: 42.5, rating: 4.8, reviews: 124, expiresIn: '2 days', promoCode: 'BURGER50' },
        { title: 'Free Coffee with Any Meal', description: 'Order any meal over EGP 60 and get a free cappuccino.', discount: 'Free Item', category: 'food', originalPrice: 25, discountPrice: 0, rating: 4.5, reviews: 89, expiresIn: '5 days', promoCode: 'FREECOFFEE' },
        { title: '30% Off Electronics', description: 'All phone accessories and chargers at 30% off.', discount: '30%', category: 'electronics', originalPrice: 200, discountPrice: 140, rating: 4.2, reviews: 56, expiresIn: '1 week' },
        { title: 'Student Gym Pass — 40% Off', description: 'Monthly gym membership at student-exclusive pricing.', discount: '40%', category: 'fitness', originalPrice: 500, discountPrice: 300, rating: 4.9, reviews: 203, expiresIn: '3 days' },
        { title: 'Buy 1 Get 1 Free Pizza', description: 'Any large pizza, get another one absolutely free.', discount: 'BOGO', category: 'food', originalPrice: 120, discountPrice: 60, rating: 4.7, reviews: 312, expiresIn: '1 day', promoCode: 'PIZZABOGO' },
        { title: '20% Off Haircut', description: 'Student discount at Campus Barber Shop.', discount: '20%', category: 'services', originalPrice: 80, discountPrice: 64, rating: 4.3, reviews: 45, expiresIn: '2 weeks' },
        { title: 'Free Delivery All Weekend', description: 'No delivery fee on orders above EGP 50 this weekend.', discount: 'Free Delivery', category: 'food', originalPrice: 15, discountPrice: 0, rating: 4.6, reviews: 178, expiresIn: '3 days', promoCode: 'FREEWEEKEND' },
        { title: '25% Off Stationery Bundle', description: 'Notebooks, pens, and highlighters at student prices.', discount: '25%', category: 'education', originalPrice: 150, discountPrice: 112.5, rating: 4.1, reviews: 33, expiresIn: '1 week' },
        { title: 'Laundry Service — First Order Free', description: 'Try our campus laundry pickup. First 5kg bag on us.', discount: '100%', category: 'services', originalPrice: 45, discountPrice: 0, rating: 4.4, reviews: 67, expiresIn: '4 days', promoCode: 'CLEANFIRST' },
        { title: '15% Off Shawarma Plate', description: 'Campus favourite shawarma plate at a discount.', discount: '15%', category: 'food', originalPrice: 55, discountPrice: 46.75, rating: 4.6, reviews: 234, expiresIn: '6 days' },
    ];
    await prisma.deal.createMany({
        data: dealData.map(d => ({
            title: d.title, description: d.description, discount: d.discount,
            category: d.category, originalPrice: d.originalPrice, discountPrice: d.discountPrice,
            rating: d.rating, reviews: d.reviews, expiresIn: d.expiresIn, promoCode: d.promoCode || null,
            merchantId: users.merchant.id, status: 'ACTIVE',
        })),
    });
    console.log(`✅ Deals: ${dealData.length} deals`);

    // ───────────────────── 4. MEALS (10) ─────────────────────
    await prisma.meal.deleteMany();
    const mealData = [
        { name: 'Double Beef Burger', arName: 'برجر لحم مزدوج', description: 'Two juicy beef patties with special sauce', price: 85, rating: 4.8, calories: '650 kcal', prepTime: '12 min', tags: 'daily,fastfood,burger,popular', isPopular: true },
        { name: 'Crispy Chicken Meal', arName: 'وجبة دجاج مقرمش', description: 'Fried chicken with coleslaw and fries', price: 120, rating: 4.6, calories: '800 kcal', prepTime: '15 min', tags: 'daily,fastfood,chicken', isPopular: true },
        { name: 'Caesar Salad', arName: 'سلطة سيزر', description: 'Fresh romaine, parmesan, croutons with caesar dressing', price: 65, rating: 4.4, calories: '350 kcal', prepTime: '8 min', tags: 'daily,healthy,salad', isPopular: false },
        { name: 'Cheese Fries', arName: 'بطاطس بالجبنة', description: 'Crispy fries loaded with melted cheddar and jalapeños', price: 45, rating: 4.5, calories: '450 kcal', prepTime: '10 min', tags: 'daily,fastfood,snack,budget', isPopular: true },
        { name: 'Chocolate Lava Cake', arName: 'كيك الشوكولاتة', description: 'Warm molten chocolate cake with vanilla ice cream', price: 55, rating: 4.9, calories: '500 kcal', prepTime: '10 min', tags: 'dessert,sweet,popular', isPopular: true },
        { name: 'Iced Caramel Latte', arName: 'لاتيه كراميل مثلج', description: 'Espresso with caramel syrup and cold milk', price: 35, rating: 4.7, calories: '180 kcal', prepTime: '5 min', tags: 'daily,drink,coffee,budget', isPopular: false },
        { name: 'Grilled Chicken Bowl', arName: 'طبق دجاج مشوي', description: 'Grilled chicken with quinoa, avocado and tahini', price: 95, rating: 4.6, calories: '550 kcal', prepTime: '18 min', tags: 'healthy,bowl,protein', isPopular: false },
        { name: 'Shawarma Plate', arName: 'طبق شاورما', description: 'Beef shawarma with rice, salad and garlic sauce', price: 75, rating: 4.8, calories: '700 kcal', prepTime: '12 min', tags: 'daily,fastfood,popular', isPopular: true },
        { name: 'Fruit Smoothie Bowl', arName: 'سموذي فواكه', description: 'Açaí, banana, and mixed berries topped with granola', price: 60, rating: 4.5, calories: '300 kcal', prepTime: '7 min', tags: 'healthy,drink,breakfast,protein', isPopular: false },
        { name: 'Kunafa', arName: 'كنافة', description: 'Traditional Egyptian kunafa with cream cheese and syrup', price: 40, rating: 4.9, calories: '400 kcal', prepTime: '5 min', tags: 'daily,dessert,sweet,popular,budget', isPopular: true },
    ];
    await prisma.meal.createMany({
        data: mealData.map(m => ({
            name: m.name, arName: m.arName, description: m.description, price: m.price,
            rating: m.rating, calories: m.calories, prepTime: m.prepTime,
            tags: m.tags, isPopular: m.isPopular, status: 'ACTIVE',
            merchantId: users.merchant.id,
        })),
    });
    console.log(`✅ Meals: ${mealData.length} meals`);

    // ───────────────────── 5. SERVICE PROVIDERS (10) ─────────────────────
    await prisma.serviceProvider.deleteMany();
    const providerData = [
        { name: 'Mohamed Plumbing', phone: '+20 111 111 1111', category: 'PLUMBER', description: 'Expert plumber with 10+ years experience. Emergency calls available.', priceRange: '100-300 EGP', rating: 4.8, reviewCount: 45, verified: true, location: 'Campus Area' },
        { name: 'Ahmed Electric', phone: '+20 111 111 2222', category: 'ELECTRICIAN', description: 'Licensed electrician. Wiring, fixtures, and repairs.', priceRange: '150-400 EGP', rating: 4.6, reviewCount: 32, verified: true, location: 'North Assiut' },
        { name: 'Hassan Carpentry', phone: '+20 111 111 3333', category: 'CARPENTER', description: 'Custom furniture, door repairs, and shelving.', priceRange: '200-500 EGP', rating: 4.5, reviewCount: 28, verified: true, location: 'Downtown' },
        { name: 'Cool Air AC Services', phone: '+20 111 111 4444', category: 'AC_TECH', description: 'AC installation, maintenance, and repair. All brands.', priceRange: '150-350 EGP', rating: 4.7, reviewCount: 56, verified: true, location: 'University District' },
        { name: 'Fresh Paint Co.', phone: '+20 111 111 5555', category: 'PAINTER', description: 'Interior and exterior painting. Free color consultation.', priceRange: '200-600 EGP', rating: 4.4, reviewCount: 19, verified: true, location: 'East Side' },
        { name: 'Quick Fix General', phone: '+20 111 111 6666', category: 'GENERAL', description: 'Handyman services — assembly, mounting, small repairs.', priceRange: '80-200 EGP', rating: 4.3, reviewCount: 67, verified: true, location: 'Campus Gate' },
        { name: 'Pro Pipe Solutions', phone: '+20 111 111 7777', category: 'PLUMBER', description: 'Leak detection, pipe replacement, bathroom fitting.', priceRange: '120-350 EGP', rating: 4.9, reviewCount: 78, verified: true, location: 'South Campus' },
        { name: 'Bright Spark Electric', phone: '+20 111 111 8888', category: 'ELECTRICIAN', description: 'Smart home installation, rewiring, circuit breakers.', priceRange: '200-500 EGP', rating: 4.5, reviewCount: 41, verified: true, location: 'New Extension' },
        { name: 'Cool Breeze HVAC', phone: '+20 111 111 9999', category: 'AC_TECH', description: 'Central AC, split unit services, duct cleaning.', priceRange: '250-600 EGP', rating: 4.8, reviewCount: 34, verified: true, location: 'West Gate' },
        { name: 'Master Wood Works', phone: '+20 111 112 0000', category: 'CARPENTER', description: 'Kitchen cabinets, wardrobes, and wooden flooring.', priceRange: '300-800 EGP', rating: 4.7, reviewCount: 23, verified: true, location: 'Industrial Zone' },
    ];
    await prisma.serviceProvider.createMany({ data: providerData });
    console.log(`✅ Service Providers: ${providerData.length} providers`);

    // ───────────────────── 6. HUB POSTS (5) ─────────────────────
    await prisma.hubPost.deleteMany();
    const hubPosts = [
        { content: 'Anyone know a good place to study near campus? Looking for somewhere quiet with wifi 📚', category: 'general', likes: 12, comments: 5 },
        { content: 'LOST: Blue backpack near the Science building. Has my laptop inside. Please DM if found! 🎒', category: 'lost_found', likes: 34, comments: 8 },
        { content: 'Looking for a roommate for a 2BR apartment near East Gate. Rent is 2000 EGP/month split. DM me!', category: 'housing', likes: 8, comments: 15 },
        { content: 'Selling my barely used textbooks for Mechanical Engineering Year 3. Half price! 📖', category: 'marketplace', likes: 21, comments: 6 },
        { content: 'Can someone help me with Calculus II? I have an exam next week and I am struggling with integrals 😩', category: 'study_help', likes: 45, comments: 12 },
    ];
    await prisma.hubPost.createMany({
        data: hubPosts.map(p => ({ ...p, authorId: users.student.id })),
    });
    console.log(`✅ Hub Posts: ${hubPosts.length} posts`);

    // ───────────────────── 7. ORDERS (3) ─────────────────────
    await prisma.order.deleteMany();
    const orders = await Promise.all([
        prisma.order.create({
            data: { service: 'TRANSPORT', total: 45.0, status: 'COMPLETED', details: JSON.stringify({ pickup: 'Library', dropoff: 'North Dorm', vehicle: 'Standard' }), userId: users.student.id, driverId: users.driver.id },
        }),
        prisma.order.create({
            data: { service: 'DELIVERY', total: 120.0, status: 'COMPLETED', details: JSON.stringify({ vendor: 'Campus Burgers', items: ['Double Beef Burger', 'Cheese Fries'] }), userId: users.student.id },
        }),
        prisma.order.create({
            data: { service: 'TRANSPORT', total: 25.0, status: 'PENDING', details: JSON.stringify({ pickup: 'Engineering Building', dropoff: 'South Gate', vehicle: 'Scooter' }), userId: users.student.id },
        }),
    ]);
    console.log(`✅ Orders: ${orders.length} orders`);

    // ───────────────────── 8. TRANSACTIONS (5) ─────────────────────
    await prisma.transactionHistory.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.refund.deleteMany();
    await prisma.transaction.deleteMany();

    const meals = await prisma.meal.findMany({ take: 2 });
    const deals = await prisma.deal.findMany({ take: 2 });
    const listings = await prisma.housingListing.findMany({ take: 1 });

    const txnCode = (i) => `TXN-2026-${String(i).padStart(6, '0')}`;

    const txns = [];
    txns.push(await prisma.transaction.create({
        data: { txnCode: txnCode(1), type: 'MEALS', status: 'COMPLETED', userId: users.student.id, mealId: meals[0]?.id || null, amount: 85, currency: 'EGP' },
    }));
    txns.push(await prisma.transaction.create({
        data: { txnCode: txnCode(2), type: 'MEALS', status: 'PENDING', userId: users.student.id, mealId: meals[1]?.id || null, amount: 120, currency: 'EGP' },
    }));
    txns.push(await prisma.transaction.create({
        data: { txnCode: txnCode(3), type: 'DEALS', status: 'COMPLETED', userId: users.student.id, dealId: deals[0]?.id || null, amount: 42.5, currency: 'EGP' },
    }));
    txns.push(await prisma.transaction.create({
        data: { txnCode: txnCode(4), type: 'HOUSING', status: 'CONFIRMED', userId: users.student.id, housingId: listings[0]?.id || null, amount: 2500, currency: 'EGP' },
    }));
    txns.push(await prisma.transaction.create({
        data: { txnCode: txnCode(5), type: 'DEALS', status: 'COMPLETED', userId: users.student.id, dealId: deals[1]?.id || null, amount: 0, currency: 'EGP', notes: 'Free coffee with meal' },
    }));
    console.log(`✅ Transactions: ${txns.length} transactions`);

    // ───────────────────── 9. VERIFICATION DOCS ─────────────────────
    await prisma.verificationDocument.deleteMany();
    await prisma.verificationDocument.createMany({
        data: [
            { type: 'STUDENT_ID', fileUrl: '/mock/student-id.jpg', userId: users.student.id, status: 'VERIFIED' },
            { type: 'DRIVERS_LICENSE', fileUrl: '/mock/driver-license.jpg', userId: users.driver.id, status: 'VERIFIED' },
            { type: 'BUSINESS_LICENSE', fileUrl: '/mock/business-license.jpg', userId: users.merchant.id, status: 'PENDING' },
        ],
    });
    console.log(`✅ Verifications: 3 documents`);

    // ───────────────────── 10. NOTIFICATIONS ─────────────────────
    await prisma.notification.deleteMany();
    await prisma.notification.createMany({
        data: [
            { title: 'Welcome to UniZy!', message: 'Your account has been verified. Start exploring campus services.', type: 'SYSTEM', userId: users.student.id },
            { title: 'Ride Completed', message: 'Your ride from Library to North Dorm is complete. Rate your driver!', type: 'ORDER', userId: users.student.id },
            { title: '50% Off Burgers Today!', message: 'Campus Burgers has a special deal. Use code BURGER50.', type: 'CAMPAIGN', userId: users.student.id },
            { title: 'New Listing Available', message: 'A new studio near campus has been listed. Check it out!', type: 'GENERAL', userId: users.student.id },
            { title: 'Points Earned!', message: 'You earned 50 points for your referral. Total: 1,250 points.', type: 'REFERRAL', userId: users.student.id },
        ],
    });
    console.log(`✅ Notifications: 5 notifications`);

    // ───────────────────── 11. CLEANING PACKAGES ─────────────────────
    const existingPkgs = await prisma.cleaningPackage.count();
    if (existingPkgs === 0) {
        await prisma.cleaningPackage.createMany({
            data: [
                { name: 'Quick Tidy', description: 'Basic room cleanup — dusting, mopping, trash removal.', price: 50, duration: '1 hour', frequency: 'ONE_TIME', includes: JSON.stringify(['Dusting', 'Mopping', 'Trash Removal']) },
                { name: 'Deep Clean', description: 'Thorough cleaning including kitchen and bathroom scrub.', price: 150, duration: '3 hours', frequency: 'ONE_TIME', includes: JSON.stringify(['Kitchen Scrub', 'Bathroom Deep Clean', 'Window Cleaning', 'Mopping']) },
                { name: 'Weekly Standard', description: 'Regular weekly cleaning for students. Keep your place fresh!', price: 80, duration: '1.5 hours', frequency: 'WEEKLY', includes: JSON.stringify(['Dusting', 'Vacuuming', 'Bathroom Clean', 'Kitchen Wipe']) },
                { name: 'Move-in/Move-out', description: 'Complete cleaning for when you move in or out. Spotless guarantee.', price: 250, duration: '4-5 hours', frequency: 'ONE_TIME', includes: JSON.stringify(['Full Apartment Deep Clean', 'Appliance Cleaning', 'Wall Wiping', 'Window Cleaning']) },
            ],
        });
        console.log(`✅ Cleaning: 4 packages`);
    }

    // ───────────────────── SUMMARY ─────────────────────
    console.log('\n🎉 Seed complete! Summary:');
    console.log(`   Users: ${await prisma.user.count()}`);
    console.log(`   Housing Listings: ${await prisma.housingListing.count()}`);
    console.log(`   Deals: ${await prisma.deal.count()}`);
    console.log(`   Meals: ${await prisma.meal.count()}`);
    console.log(`   Service Providers: ${await prisma.serviceProvider.count()}`);
    console.log(`   Hub Posts: ${await prisma.hubPost.count()}`);
    console.log(`   Orders: ${await prisma.order.count()}`);
    console.log(`   Transactions: ${await prisma.transaction.count()}`);
    console.log(`   Notifications: ${await prisma.notification.count()}`);
    console.log(`   Cleaning Packages: ${await prisma.cleaningPackage.count()}`);
}

main()
    .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
