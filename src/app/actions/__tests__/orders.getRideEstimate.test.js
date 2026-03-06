import { getRideEstimate } from '../orders';
import { prisma } from '@/lib/prisma';

// Mock `requireRole` and `requireOwnership` from authz
jest.mock('@/lib/authz', () => ({
  requireRole: jest.fn(),
  requireOwnership: jest.fn(),
}));

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    pricingRule: {
      findFirst: jest.fn(),
    },
    // Adding mocks for other methods called on initialization just in case
    $transaction: jest.fn(),
    order: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    supportTicket: {
      create: jest.fn(),
    }
  },
}));

// Mock `revalidatePath` from next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock sibling files in the same directory
jest.mock('../referrals', () => ({ completeReferralIfEligible: jest.fn() }));
jest.mock('../notifications', () => ({ createNotification: jest.fn() }));
jest.mock('../financial', () => ({
  generateTxnCode: jest.fn(),
  computeCommissionSnapshot: jest.fn(),
  computePricingSnapshot: jest.fn()
}));
jest.mock('../analytics', () => ({ logEvent: jest.fn() }));
jest.mock('../audit', () => ({ logAdminAction: jest.fn() }));


// Mock Math.random to always return 0.5
// Multiplier logic in code: 1 + (Math.random() * 0.5)
// If Math.random() is 0.5, multiplier = 1 + (0.5 * 0.5) = 1.25
const originalMathRandom = Math.random;

describe('getRideEstimate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Math.random = jest.fn(() => 0.5); // Multiplier will be 1.25

    // Default mock implementation: no pricing rule found
    prisma.pricingRule.findFirst.mockResolvedValue(null);

    // Spy on console.error to keep test output clean on error test
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    Math.random = originalMathRandom;
    console.error.mockRestore();
  });

  it('should use base price for Standard vehicle when no pricing rule is found', async () => {
    const result = await getRideEstimate('Pickup', 'Destination', 'Standard');
    // Base price for Standard = 45
    // Multiplier = 1.25
    // Final = Math.ceil(45 * 1.25) = Math.ceil(56.25) = 57
    expect(prisma.pricingRule.findFirst).toHaveBeenCalledWith({
      where: { module: 'TRANSPORT', isActive: true, serviceType: 'Standard' },
    });
    expect(result).toEqual({ success: true, price: 57 });
  });

  it('should use base price for Premium vehicle when no pricing rule is found', async () => {
    const result = await getRideEstimate('Pickup', 'Destination', 'Premium');
    // Base price for Premium = 75
    // Multiplier = 1.25
    // Final = Math.ceil(75 * 1.25) = Math.ceil(93.75) = 94
    expect(result).toEqual({ success: true, price: 94 });
  });

  it('should use base price for Scooter vehicle when no pricing rule is found', async () => {
    const result = await getRideEstimate('Pickup', 'Destination', 'Scooter');
    // Base price for Scooter = 25
    // Multiplier = 1.25
    // Final = Math.ceil(25 * 1.25) = Math.ceil(31.25) = 32
    expect(result).toEqual({ success: true, price: 32 });
  });

  it('should use base price for Shuttle Bus vehicle when no pricing rule is found', async () => {
    const result = await getRideEstimate('Pickup', 'Destination', 'Shuttle Bus');
    // Base price for Shuttle Bus = 10
    // Multiplier = 1.25
    // Final = Math.ceil(10 * 1.25) = Math.ceil(12.5) = 13
    expect(result).toEqual({ success: true, price: 13 });
  });

  it('should use fallback price (50) for unknown vehicle types', async () => {
    const result = await getRideEstimate('Pickup', 'Destination', 'Spaceship');
    // Fallback = 50
    // Multiplier = 1.25
    // Final = Math.ceil(50 * 1.25) = Math.ceil(62.5) = 63
    expect(result).toEqual({ success: true, price: 63 });
  });

  it('should use pricing rule basePrice if found in the database', async () => {
    // Mock database returning a pricing rule with basePrice 100
    prisma.pricingRule.findFirst.mockResolvedValue({
      id: 'rule-1',
      module: 'TRANSPORT',
      isActive: true,
      serviceType: 'Standard',
      basePrice: 100,
    });

    const result = await getRideEstimate('Pickup', 'Destination', 'Standard');

    // Base price from rule = 100
    // Multiplier = 1.25
    // Final = Math.ceil(100 * 1.25) = 125
    expect(result).toEqual({ success: true, price: 125 });
  });

  it('should return a failure object if an exception is thrown', async () => {
    // Force an error
    prisma.pricingRule.findFirst.mockRejectedValue(new Error('Database connection failed'));

    const result = await getRideEstimate('Pickup', 'Destination', 'Standard');

    expect(console.error).toHaveBeenCalledWith('Failed to get ride estimate:', expect.any(Error));
    expect(result).toEqual({ success: false, error: 'Failed to get ride estimate.' });
  });
});
