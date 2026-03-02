const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with test accounts...\n');

    const accounts = [
        // Admin Roles
        { name: 'Super Admin', email: 'superadmin@unizy.com', password: 'admin123', role: 'ADMIN_SUPER', university: 'Assiut University' },
        { name: 'Delivery Admin', email: 'delivery@unizy.com', password: 'delivery123', role: 'ADMIN_DELIVERY', university: 'Assiut University' },
        { name: 'Transport Admin', email: 'transport@unizy.com', password: 'transport123', role: 'ADMIN_TRANSPORT', university: 'Assiut University' },
        { name: 'Housing Admin', email: 'housing@unizy.com', password: 'housing123', role: 'ADMIN_HOUSING', university: 'Assiut University' },
        { name: 'Commerce Admin', email: 'commerce@unizy.com', password: 'commerce123', role: 'ADMIN_COMMERCE', university: 'Assiut University' },

        // Service Roles
        { name: 'Test Driver', email: 'driver@unizy.com', password: 'driver123', role: 'DRIVER', university: 'Assiut University' },
        { name: 'Test Provider', email: 'provider@unizy.com', password: 'provider123', role: 'PROVIDER', university: 'Assiut University' },
        { name: 'Test Merchant', email: 'merchant@unizy.com', password: 'merchant123', role: 'MERCHANT', university: 'Assiut University' },

        // Student Role
        { name: 'Test Student', email: 'student@unizy.com', password: 'student123', role: 'STUDENT', university: 'Assiut University', faculty: 'Engineering', academicYear: '3rd Year', gender: 'Male' },
    ];

    for (const account of accounts) {
        const hashedPassword = await bcrypt.hash(account.password, 10);
        const referralCode = `UNI-${account.name.replace(/\s/g, '').substring(0, 3).toUpperCase()}${Date.now().toString(36).slice(-4).toUpperCase()}`;

        await prisma.user.upsert({
            where: { email: account.email },
            update: { password: hashedPassword, role: account.role, name: account.name },
            create: {
                name: account.name,
                email: account.email,
                password: hashedPassword,
                role: account.role,
                university: account.university,
                faculty: account.faculty || null,
                academicYear: account.academicYear || null,
                gender: account.gender || null,
                referralCode,
                isVerified: true,
            }
        });

        console.log(`  ✅ ${account.role.padEnd(16)} | ${account.email.padEnd(25)} | ${account.password}`);
    }

    console.log('\n🎉 All accounts seeded! Passwords are bcrypt-hashed in DB.\n');

    // Print routing table
    console.log('📋 Role → Dashboard Routing:');
    console.log('  ADMIN_SUPER     → /admin');
    console.log('  ADMIN_DELIVERY  → /admin/delivery');
    console.log('  ADMIN_TRANSPORT → /admin/transport');
    console.log('  ADMIN_HOUSING   → /admin/housing');
    console.log('  ADMIN_COMMERCE  → /admin/commerce');
    console.log('  DRIVER          → /driver');
    console.log('  PROVIDER        → /provider');
    console.log('  MERCHANT        → /merchant');
    console.log('  STUDENT         → /students');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
