import { prisma } from '@/lib/prisma';
import { getCommissionRules } from '../../../src/app/actions/commissions';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
    prisma: {
        commissionRule: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('../../../src/app/actions/auth', () => ({
    getCurrentUser: jest.fn(),
}));

jest.mock('../../../src/app/actions/audit', () => ({
    logAdminAction: jest.fn(),
}));

jest.mock('next/cache', () => ({
    unstable_cache: jest.fn(
        (cb) => async (...args) => await cb(...args)
    ),
    revalidateTag: jest.fn(),
}));

describe('getCommissionRules', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all commission rules when no moduleFilter is provided', async () => {
        const mockRules = [
            { id: 1, module: 'TRANSPORT', providerType: 'DRIVER', isActive: true },
            { id: 2, module: 'MEALS', providerType: 'RESTAURANT', isActive: true },
        ];

        prisma.commissionRule.findMany.mockResolvedValueOnce(mockRules);

        const result = await getCommissionRules();

        expect(prisma.commissionRule.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.commissionRule.findMany).toHaveBeenCalledWith({
            where: {},
            include: { zone: true },
            orderBy: [
                { module: 'asc' },
                { providerType: 'asc' },
                { isActive: 'desc' }
            ]
        });

        expect(result).toEqual({ success: true, data: mockRules });
    });

    it('should return filtered commission rules when a moduleFilter is provided', async () => {
        const mockRules = [
            { id: 1, module: 'TRANSPORT', providerType: 'DRIVER', isActive: true },
        ];

        prisma.commissionRule.findMany.mockResolvedValueOnce(mockRules);

        const result = await getCommissionRules('TRANSPORT');

        expect(prisma.commissionRule.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.commissionRule.findMany).toHaveBeenCalledWith({
            where: { module: 'TRANSPORT' },
            include: { zone: true },
            orderBy: [
                { module: 'asc' },
                { providerType: 'asc' },
                { isActive: 'desc' }
            ]
        });

        expect(result).toEqual({ success: true, data: mockRules });
    });

    it('should return an error when findMany throws an error', async () => {
        // Suppress console.error for this test to avoid noisy test output
        const originalConsoleError = console.error;
        console.error = jest.fn();

        prisma.commissionRule.findMany.mockRejectedValueOnce(new Error('Database error'));

        const result = await getCommissionRules();

        expect(prisma.commissionRule.findMany).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith('Failed to get commission rules:', expect.any(Error));
        expect(result).toEqual({ success: false, error: 'Failed to fetch commission rules' });

        // Restore console.error
        console.error = originalConsoleError;
    });
});
