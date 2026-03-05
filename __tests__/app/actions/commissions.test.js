import { prisma } from '@/lib/prisma';
import { getCommissionRules, createCommissionRule } from '../../../src/app/actions/commissions';
import { getCurrentUser } from '../../../src/app/actions/auth';
import { logAdminAction } from '../../../src/app/actions/audit';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
    prisma: {
        commissionRule: {
            findMany: jest.fn(),
            updateMany: jest.fn(),
            create: jest.fn(),
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

describe('createCommissionRule', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress console.error in tests to keep output clean on expected error paths
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    it('should successfully create a commission rule for ADMIN_SUPER', async () => {
        const mockUser = { id: 'admin1', role: 'ADMIN_SUPER' };
        getCurrentUser.mockResolvedValueOnce(mockUser);

        const mockData = {
            module: 'RIDE',
            providerType: 'DRIVER',
            unizySharePercent: '15',
            providerSharePercent: '85',
            zoneId: 'zone1',
            effectiveDate: '2025-01-01',
            promoSubsidyImpact: { cap: 10 },
        };

        const mockCreatedRule = { id: 'rule1', ...mockData, isActive: true };
        prisma.commissionRule.updateMany.mockResolvedValueOnce({ count: 1 });
        prisma.commissionRule.create.mockResolvedValueOnce(mockCreatedRule);
        logAdminAction.mockResolvedValueOnce();

        const result = await createCommissionRule(mockData);

        expect(result).toEqual({ success: true, data: mockCreatedRule });
        expect(prisma.commissionRule.updateMany).toHaveBeenCalledWith({
            where: {
                module: mockData.module,
                providerType: mockData.providerType,
                zoneId: mockData.zoneId,
                isActive: true,
            },
            data: { isActive: false },
        });
        expect(prisma.commissionRule.create).toHaveBeenCalledWith({
            data: {
                module: mockData.module,
                providerType: mockData.providerType,
                unizySharePercent: 15,
                providerSharePercent: 85,
                promoSubsidyImpact: JSON.stringify(mockData.promoSubsidyImpact),
                zoneId: mockData.zoneId,
                effectiveDate: new Date(mockData.effectiveDate),
                isActive: true,
            },
        });
        expect(logAdminAction).toHaveBeenCalledWith(
            'CREATE_COMMISSION_RULE',
            mockData.module,
            mockCreatedRule.id,
            {
                providerType: mockData.providerType,
                unizySharePercent: mockData.unizySharePercent,
                providerSharePercent: mockData.providerSharePercent,
                zoneId: mockData.zoneId,
            }
        );
    });

    it('should return error if user is unauthorized', async () => {
        const mockUser = { id: 'user1', role: 'STUDENT', scopes: '[]' };
        getCurrentUser.mockResolvedValueOnce(mockUser);

        const mockData = {
            module: 'RIDE',
            providerType: 'DRIVER',
            unizySharePercent: '15',
            providerSharePercent: '85',
        };

        const result = await createCommissionRule(mockData);

        expect(result).toEqual({
            success: false,
            error: 'Forbidden: You do not have commission authority for the RIDE module.',
        });
        expect(logAdminAction).toHaveBeenCalledWith(
            'PRIVILEGE_ESCALATION_ATTEMPT',
            mockData.module,
            null,
            {
                attemptedBy: mockUser.id,
                userRole: mockUser.role,
                targetModule: mockData.module,
                action: 'COMMISSION_EDIT',
            }
        );
        expect(prisma.commissionRule.create).not.toHaveBeenCalled();
    });

    it('should handle database errors when creating a rule', async () => {
        const mockUser = { id: 'admin1', role: 'ADMIN_SUPER' };
        getCurrentUser.mockResolvedValueOnce(mockUser);

        const mockData = {
            module: 'RIDE',
            providerType: 'DRIVER',
            unizySharePercent: '15',
            providerSharePercent: '85',
        };

        const dbError = new Error('Database connection failed');
        prisma.commissionRule.updateMany.mockResolvedValueOnce({ count: 1 });
        prisma.commissionRule.create.mockRejectedValueOnce(dbError);

        const result = await createCommissionRule(mockData);

        expect(result).toEqual({ success: false, error: dbError.message });
        expect(console.error).toHaveBeenCalledWith('Failed to create commission rule:', dbError);
    });

    it('should parse user scopes correctly when scopes is a string array', async () => {
        const mockUser = { id: 'admin2', role: 'ADMIN_REGULAR', scopes: '["RIDE"]' };
        getCurrentUser.mockResolvedValueOnce(mockUser);

        const mockData = {
            module: 'RIDE',
            providerType: 'DRIVER',
            unizySharePercent: '15',
            providerSharePercent: '85',
        };

        const mockCreatedRule = { id: 'rule2', ...mockData, isActive: true };
        prisma.commissionRule.updateMany.mockResolvedValueOnce({ count: 0 });
        prisma.commissionRule.create.mockResolvedValueOnce(mockCreatedRule);

        const result = await createCommissionRule(mockData);

        expect(result).toEqual({ success: true, data: mockCreatedRule });
        expect(prisma.commissionRule.create).toHaveBeenCalled();
    });

    it('should allow access if user has module specific role', async () => {
        const mockUser = { id: 'admin3', role: 'ADMIN_RIDE' };
        getCurrentUser.mockResolvedValueOnce(mockUser);

        const mockData = {
            module: 'RIDE',
            providerType: 'DRIVER',
            unizySharePercent: '15',
            providerSharePercent: '85',
        };

        const mockCreatedRule = { id: 'rule3', ...mockData, isActive: true };
        prisma.commissionRule.updateMany.mockResolvedValueOnce({ count: 0 });
        prisma.commissionRule.create.mockResolvedValueOnce(mockCreatedRule);

        const result = await createCommissionRule(mockData);

        expect(result).toEqual({ success: true, data: mockCreatedRule });
        expect(prisma.commissionRule.create).toHaveBeenCalled();
    });

    it('should return error if no user is found', async () => {
        getCurrentUser.mockResolvedValueOnce(null);

        const mockData = {
            module: 'RIDE',
            providerType: 'DRIVER',
            unizySharePercent: '15',
            providerSharePercent: '85',
        };

        const result = await createCommissionRule(mockData);

        expect(result).toEqual({ success: false, error: 'Unauthorized' });
    });
});
