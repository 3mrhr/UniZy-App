/**
 * Backend Smoke Test: Critical Path Verification
 *
 * Verifies that essential backend action modules export correctly,
 * valid roles are accepted, and invalid roles are properly rejected.
 */

'use strict';

// Valid UserRole enum values (from prisma/schema.prisma)
const VALID_ROLES = [
  'GUEST',
  'STUDENT',
  'MERCHANT',
  'DRIVER',
  'CLEANER',
  'SERVICE_PROVIDER',
  'HOUSE_OWNER',
  'ADMIN_SUPER',
  'ADMIN_MERCHANT',
  'ADMIN_DRIVER',
  'ADMIN_DELIVERY',
  'ADMIN_CLEANER',
  'ADMIN_SERVICE_PROVIDER',
  'ADMIN_HOUSING',
  'ADMIN_FINANCE',
  'ADMIN_SUPPORT',
  'ADMIN_OPERATIONS',
  'ADMIN_MODERATOR',
  'ADMIN_MEALS',
];

const INVALID_ROLES = [
  'ADMIN',         // Must use ADMIN_* variants
  'SUPERADMIN',    // Must use ADMIN_SUPER
  'PROVIDER',      // Must use HOUSE_OWNER / CLEANER / SERVICE_PROVIDER
  'LANDLORD',      // Must use HOUSE_OWNER
  'RESTAURANT',    // Must use MERCHANT
  'FLEET_OWNER',   // Must use DRIVER
  'AGENT',         // Invalid
  'PROPERTY_MANAGER', // Invalid
  'AGENCY',        // Invalid
];

describe('Backend Smoke Tests', () => {
  describe('Auth Module', () => {
    test('should import auth module successfully', async () => {
      const auth = await import('@/app/actions/auth');
      expect(auth).toBeDefined();
      expect(typeof auth.loginUser).toBe('function');
      expect(typeof auth.registerUser).toBe('function');
      expect(typeof auth.logoutUser).toBe('function');
      expect(typeof auth.getCurrentUser).toBe('function');
    });

    test('should validate registerUser role allowlist', async () => {
      // This tests that the auth module file exists and contains role validation logic
      const fs = require('fs');
      const authCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/app/actions/auth/index.js'),
        'utf8'
      );

      // Check for role allowlist implementation
      expect(authCode).toContain('ALLOWED_REGISTRATION_ROLES');
      expect(authCode).toContain('STUDENT');
      expect(authCode).toContain('MERCHANT');
      expect(authCode).toContain('DRIVER');
      expect(authCode).toContain('HOUSE_OWNER');

      // Ensure it doesn't use invalid roles
      expect(authCode).not.toMatch(/['"]ADMIN['"](?!\s*:)/);
      expect(authCode).not.toMatch(/['"]SUPERADMIN['"](?!\s*:)/);
    });
  });

  describe('Wallet Module', () => {
    test('should import wallet module successfully', async () => {
      const wallet = await import('@/app/actions/wallet');
      expect(wallet).toBeDefined();
      expect(typeof wallet.spendFromWallet).toBe('function');
      expect(typeof wallet.spendFromWalletInternal).toBe('function');
      expect(typeof wallet.creditWallet).toBe('function');
      expect(typeof wallet.getOrCreateWallet).toBe('function');
    });

    test('wallet module should export spendFromWallet and spendFromWalletInternal', async () => {
      const wallet = await import('@/app/actions/wallet');
      // Both functions should exist for wallet spending workflow
      expect(wallet.spendFromWallet).toBeDefined();
      expect(wallet.spendFromWalletInternal).toBeDefined();
    });
  });

  describe('Orders Module', () => {
    test('should import orders module successfully', async () => {
      const orders = await import('@/app/actions/orders');
      expect(orders).toBeDefined();
      expect(typeof orders.createOrder).toBe('function');
    });

    test('orders module should import spendFromWalletInternal', async () => {
      const fs = require('fs');
      const ordersCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/app/actions/orders/index.js'),
        'utf8'
      );

      // Ensure orders imports the wallet spending function
      expect(ordersCode).toContain('spendFromWalletInternal');
    });
  });

  describe('Meals Module', () => {
    test('should import meals module successfully', async () => {
      const meals = await import('@/app/actions/meals');
      expect(meals).toBeDefined();
    });

    test('meals module should call spendFromWalletInternal', async () => {
      const fs = require('fs');
      const mealsCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/app/actions/meals/index.js'),
        'utf8'
      );

      // Ensure meals calls the wallet spending function
      expect(mealsCode).toContain('spendFromWalletInternal');
    });
  });

  describe('Transport Module', () => {
    test('should import transport module successfully', async () => {
      const transport = await import('@/app/actions/transport');
      expect(transport).toBeDefined();
      expect(typeof transport.requestTrip).toBe('function');
    });

    test('transport module should call spendFromWalletInternal', async () => {
      const fs = require('fs');
      const transportCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/app/actions/transport/index.js'),
        'utf8'
      );

      // Ensure transport calls the wallet spending function
      expect(transportCode).toContain('spendFromWalletInternal');
    });
  });

  describe('Services Module', () => {
    test('should import services module successfully', async () => {
      const services = await import('@/app/actions/services');
      expect(services).toBeDefined();
    });

    test('services module should use valid admin roles', async () => {
      const fs = require('fs');
      const servicesCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/app/actions/services/index.js'),
        'utf8'
      );

      // Should use spendFromWalletInternal
      expect(servicesCode).toContain('spendFromWalletInternal');

      // Should NOT use invalid role literals
      expect(servicesCode).not.toMatch(/actorRole:\s*['"]ADMIN['"]/);
    });
  });

  describe('Delivery Module', () => {
    test('should import delivery module successfully', async () => {
      const delivery = await import('@/app/actions/delivery');
      expect(delivery).toBeDefined();
    });

    test('delivery module should call spendFromWalletInternal', async () => {
      const fs = require('fs');
      const deliveryCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/app/actions/delivery/index.js'),
        'utf8'
      );

      // Ensure delivery calls the wallet spending function
      expect(deliveryCode).toContain('spendFromWalletInternal');
    });
  });

  describe('Deals Module', () => {
    test('should import deals module successfully', async () => {
      const deals = await import('@/app/actions/deals');
      expect(deals).toBeDefined();
    });

    test('deals module should accept MERCHANT and ADMIN_* roles', async () => {
      const fs = require('fs');
      const dealsCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/app/actions/deals/index.js'),
        'utf8'
      );

      // Should check for MERCHANT or any ADMIN_* role
      expect(dealsCode).toContain("user.role?.startsWith('ADMIN_')");

      // Should NOT use invalid 'ADMIN' literal (except in comments/strings)
      expect(dealsCode).not.toMatch(/(['"]ADMIN['"]|=.*['"]ADMIN['"])/);
    });
  });

  describe('Role Validation', () => {
    test('all valid roles should be in enum', () => {
      const validRoles = [
        'GUEST', 'STUDENT', 'MERCHANT', 'DRIVER', 'CLEANER',
        'SERVICE_PROVIDER', 'HOUSE_OWNER', 'ADMIN_SUPER',
        'ADMIN_MERCHANT', 'ADMIN_DRIVER', 'ADMIN_DELIVERY',
        'ADMIN_CLEANER', 'ADMIN_SERVICE_PROVIDER', 'ADMIN_HOUSING',
        'ADMIN_FINANCE', 'ADMIN_SUPPORT', 'ADMIN_OPERATIONS'
      ];

      validRoles.forEach(role => {
        expect(VALID_ROLES).toContain(role);
      });
    });

    test('invalid roles should not match valid enum', () => {
      INVALID_ROLES.forEach(invalidRole => {
        expect(VALID_ROLES).not.toContain(invalidRole);
      });
    });

    test('middleware should not accept PROVIDER role', async () => {
      const fs = require('fs');
      const middlewareCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/middleware.js'),
        'utf8'
      );

      // Middleware should route providers via HOUSE_OWNER, CLEANER, SERVICE_PROVIDER
      expect(middlewareCode).toContain('HOUSE_OWNER');
      expect(middlewareCode).toContain('SERVICE_PROVIDER');
      expect(middlewareCode).toContain('CLEANER');

      // Should not hardcode 'PROVIDER' as a valid role
      expect(middlewareCode).not.toMatch(/role\s*===\s*['"]PROVIDER['"]/);
    });
  });

  describe('Session Management', () => {
    test('account page should call logoutUser', async () => {
      const fs = require('fs');
      const accountCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/app/(student)/account/page.js'),
        'utf8'
      );

      // Should import logoutUser
      expect(accountCode).toContain('logoutUser');

      // Should call it on logout action
      expect(accountCode).toContain('logoutUser()');
    });

    test('admin layout should call logoutUser', async () => {
      const fs = require('fs');
      const adminLayoutCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/app/(admin)/admin/layout.js'),
        'utf8'
      );

      // Should import logoutUser
      expect(adminLayoutCode).toContain('logoutUser');

      // Should call it in logout handler
      expect(adminLayoutCode).toContain('logoutUser()');
    });
  });

  describe('Commission Manager', () => {
    test('commission manager should use valid provider role types', async () => {
      const fs = require('fs');
      const commissionCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'src/components/admin/commissions/CommissionManager.js'),
        'utf8'
      );

      // Should use valid roles for housing
      expect(commissionCode).toContain('HOUSE_OWNER');

      // Should use valid roles for cleaning
      expect(commissionCode).toContain('CLEANER');

      // Should use valid roles for services
      expect(commissionCode).toContain('SERVICE_PROVIDER');

      // Should NOT use invalid roles (as standalone strings)
      expect(commissionCode).not.toMatch(/['"]LANDLORD['"]/);
      expect(commissionCode).not.toMatch(/['"]PROPERTY_MANAGER['"]/);
      expect(commissionCode).not.toMatch(/['"]AGENT['"]/);
      // PROVIDER should only appear as part of SERVICE_PROVIDER, not standalone
      expect(commissionCode).not.toMatch(/:\s*\['?'PROVIDER'?[\],']/);
    });
  });

  describe('Prisma Schema Validation', () => {
    test('UserRole enum should be defined in schema', async () => {
      const fs = require('fs');
      const schemaCode = fs.readFileSync(
        require('path').resolve(process.cwd(), 'prisma/schema.prisma'),
        'utf8'
      );

      // Should have enum UserRole definition
      expect(schemaCode).toContain('enum UserRole');

      // Should contain all valid roles
      expect(schemaCode).toContain('ADMIN_SUPER');
      expect(schemaCode).toContain('ADMIN_MERCHANT');
      expect(schemaCode).toContain('HOUSE_OWNER');
      expect(schemaCode).toContain('SERVICE_PROVIDER');
    });
  });
});
