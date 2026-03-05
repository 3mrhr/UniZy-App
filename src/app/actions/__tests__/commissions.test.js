import { toggleCommissionRule } from '../commissions';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '../auth';
import { logAdminAction } from '../audit';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        commissionRule: {
            update: jest.fn(),
        },
    },
}));

jest.mock('../auth', () => ({
    getCurrentUser: jest.fn(),
}));

jest.mock('../audit', () => ({
    logAdminAction: jest.fn(),
}));

jest.mock('next/cache', () => ({
    unstable_cache: jest.fn(
        (cb) => async (...args) => await cb(...args)
    ),
    revalidateTag: jest.fn(),
}));

describe('toggleCommissionRule', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should toggle a commission rule successfully when user has ADMIN_SUPER role', async () => {
        getCurrentUser.mockResolvedValue({ id: 'user-1', role: 'ADMIN_SUPER' });

        const mockUpdatedRule = { id: 'rule-1', isActive: false };
        prisma.commissionRule.update.mockResolvedValue(mockUpdatedRule);

        const result = await toggleCommissionRule('rule-1', false, 'RIDE');

        expect(getCurrentUser).toHaveBeenCalled();
        expect(prisma.commissionRule.update).toHaveBeenCalledWith({
            where: { id: 'rule-1' },
            data: { isActive: false }
        });
        expect(logAdminAction).toHaveBeenCalledWith('TOGGLE_COMMISSION_RULE', 'RIDE', 'rule-1', { isActive: false });
        expect(result).toEqual({ success: true, data: mockUpdatedRule });
    });

    it('should toggle a commission rule successfully when user has specific ADMIN_<module> role', async () => {
        getCurrentUser.mockResolvedValue({ id: 'user-2', role: 'ADMIN_RIDE' });

        const mockUpdatedRule = { id: 'rule-1', isActive: true };
        prisma.commissionRule.update.mockResolvedValue(mockUpdatedRule);

        const result = await toggleCommissionRule('rule-1', true, 'RIDE');

        expect(prisma.commissionRule.update).toHaveBeenCalledWith({
            where: { id: 'rule-1' },
            data: { isActive: true }
        });
        expect(logAdminAction).toHaveBeenCalledWith('TOGGLE_COMMISSION_RULE', 'RIDE', 'rule-1', { isActive: true });
        expect(result).toEqual({ success: true, data: mockUpdatedRule });
    });

    it('should toggle a commission rule successfully when user role does not match but has access via scopes', async () => {
        // user role is generic or different, but scopes contain the module
        getCurrentUser.mockResolvedValue({ id: 'user-3', role: 'MERCHANT', scopes: JSON.stringify(['RIDE']) });

        const mockUpdatedRule = { id: 'rule-1', isActive: true };
        prisma.commissionRule.update.mockResolvedValue(mockUpdatedRule);

        const result = await toggleCommissionRule('rule-1', true, 'RIDE');

        expect(prisma.commissionRule.update).toHaveBeenCalled();
        expect(logAdminAction).toHaveBeenCalledWith('TOGGLE_COMMISSION_RULE', 'RIDE', 'rule-1', { isActive: true });
        expect(result).toEqual({ success: true, data: mockUpdatedRule });
    });

    it('should return failure when user is not authenticated', async () => {
        getCurrentUser.mockResolvedValue(null);

        const result = await toggleCommissionRule('rule-1', false, 'RIDE');

        expect(prisma.commissionRule.update).not.toHaveBeenCalled();
        expect(logAdminAction).not.toHaveBeenCalledWith('TOGGLE_COMMISSION_RULE', expect.any(String), expect.any(String), expect.any(Object));
        expect(result).toEqual({ success: false, error: 'Unauthorized' });
    });

    it('should return failure and log escalation when user lacks required scope and role', async () => {
        getCurrentUser.mockResolvedValue({ id: 'user-4', role: 'USER' }); // No scopes, wrong role

        const result = await toggleCommissionRule('rule-1', false, 'RIDE');

        expect(prisma.commissionRule.update).not.toHaveBeenCalled();
        // It logs a privilege escalation attempt
        expect(logAdminAction).toHaveBeenCalledWith('PRIVILEGE_ESCALATION_ATTEMPT', 'RIDE', null, {
            attemptedBy: 'user-4',
            userRole: 'USER',
            targetModule: 'RIDE',
            action: 'COMMISSION_EDIT',
        });
        expect(result).toEqual({ success: false, error: 'Forbidden: You do not have commission authority for the RIDE module.' });
    });

    it('should return failure if prisma update fails', async () => {
        getCurrentUser.mockResolvedValue({ id: 'user-1', role: 'ADMIN_SUPER' });

        const dbError = new Error('Database error');
        prisma.commissionRule.update.mockRejectedValue(dbError);

        const result = await toggleCommissionRule('rule-1', false, 'RIDE');

        expect(prisma.commissionRule.update).toHaveBeenCalled();
        expect(logAdminAction).not.toHaveBeenCalledWith('TOGGLE_COMMISSION_RULE', expect.any(String), expect.any(String), expect.any(Object));
        expect(result).toEqual({ success: false, error: 'Database error' });
    });
});
