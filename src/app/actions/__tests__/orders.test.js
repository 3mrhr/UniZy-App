jest.mock('iron-session', () => ({
    getIronSession: jest.fn()
}));
jest.mock('@/lib/authz', () => ({
    requireRole: jest.fn(),
    requireOwnership: jest.fn()
}));
import { getRideEstimate } from '../orders';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        pricingRule: {
            findFirst: jest.fn()
        }
    }
}));

describe('getRideEstimate', () => {
    let mathRandomSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock Math.random() to return 0.5 so multiplier is 1 + (0.5 * 0.5) = 1.25
        mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        mathRandomSpy.mockRestore();
    });

    it('should use fallback pricing for known vehicle when no active pricing rule exists', async () => {
        prisma.pricingRule.findFirst.mockResolvedValue(null);

        const result = await getRideEstimate('A', 'B', 'Standard');

        expect(prisma.pricingRule.findFirst).toHaveBeenCalledWith({
            where: { module: 'TRANSPORT', isActive: true, serviceType: 'Standard' }
        });
        // Base is 45, multiplier is 1.25 -> 45 * 1.25 = 56.25 -> ceil = 57
        expect(result).toEqual({ success: true, price: 57 });
    });

    it('should use 50 as default fallback when unknown vehicle is provided', async () => {
        prisma.pricingRule.findFirst.mockResolvedValue(null);

        const result = await getRideEstimate('A', 'B', 'Spaceship');

        expect(prisma.pricingRule.findFirst).toHaveBeenCalledWith({
            where: { module: 'TRANSPORT', isActive: true, serviceType: 'Spaceship' }
        });
        // Base is 50, multiplier is 1.25 -> 50 * 1.25 = 62.5 -> ceil = 63
        expect(result).toEqual({ success: true, price: 63 });
    });

    it('should use pricing rule basePrice when available', async () => {
        prisma.pricingRule.findFirst.mockResolvedValue({
            id: 'rule_1',
            basePrice: 100
        });

        const result = await getRideEstimate('A', 'B', 'Standard');

        // Base is 100, multiplier is 1.25 -> 100 * 1.25 = 125 -> ceil = 125
        expect(result).toEqual({ success: true, price: 125 });
    });

    it('should fallback to basePrices if pricingRule is found but basePrice is missing', async () => {
        prisma.pricingRule.findFirst.mockResolvedValue({
            id: 'rule_2'
            // basePrice missing
        });

        const result = await getRideEstimate('A', 'B', 'Scooter');

        // Base is 25, multiplier is 1.25 -> 25 * 1.25 = 31.25 -> ceil = 32
        expect(result).toEqual({ success: true, price: 32 });
    });

    it('should catch errors and return a failure object when DB query fails', async () => {
        // Suppress console.error in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
        prisma.pricingRule.findFirst.mockRejectedValue(new Error('DB connection failed'));

        const result = await getRideEstimate('A', 'B', 'Premium');

        expect(result).toEqual({ success: false, error: 'Failed to get ride estimate.' });
        expect(console.error).toHaveBeenCalledWith('Failed to get ride estimate:', expect.any(Error));
    });
});
