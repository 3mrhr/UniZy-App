import { createCommissionRule } from '@/app/actions/commissions';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { logAdminAction } from '@/app/actions/audit';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        commissionRule: {
            updateMany: jest.fn(),
            create: jest.fn(),
        },
    },
}));

jest.mock('@/app/actions/auth', () => ({
    getCurrentUser: jest.fn(),
}));

jest.mock('@/app/actions/audit', () => ({
    logAdminAction: jest.fn(),
}));

describe('createCommissionRule', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress console.error in tests to keep output clean on expected error paths
        jest.spyOn(console, 'error').mockImplementation(() => {});
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
