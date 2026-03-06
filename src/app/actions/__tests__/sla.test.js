import { getSLARules, createSLARule, updateSLARule, deleteSLARule, getSLABreaches, resolveSLABreach, checkSLABreaches } from '../sla';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '../auth';
import { logAdminAction } from '../audit';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        sLARule: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        sLABreach: {
            findMany: jest.fn(),
            update: jest.fn(),
            createManyAndReturn: jest.fn(),
        },
        transaction: {
            findMany: jest.fn(),
        },
    },
}));

jest.mock('../auth', () => ({
    getCurrentUser: jest.fn(),
}));

jest.mock('../audit', () => ({
    logAdminAction: jest.fn(),
}));

describe('SLA Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockAdminUser = { id: 'admin1', role: 'ADMIN' };
    const mockSuperAdminUser = { id: 'super1', role: 'SUPERADMIN' };
    const mockUser = { id: 'user1', role: 'USER' };

    describe('getSLARules', () => {
        it('should successfully return rules for an ADMIN', async () => {
            getCurrentUser.mockResolvedValue(mockAdminUser);
            const mockRules = [{ id: 'rule1', module: 'ORDERS' }];
            prisma.sLARule.findMany.mockResolvedValue(mockRules);

            const result = await getSLARules('ORDERS');

            expect(result).toEqual({ success: true, rules: mockRules });
            expect(prisma.sLARule.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { module: 'ORDERS' }
            }));
        });

        it('should return error if not authorized', async () => {
            getCurrentUser.mockResolvedValue(mockUser);

            const result = await getSLARules();

            expect(result).toEqual({ success: false, error: 'Unauthorized to access SLA settings.' });
        });

        it('should catch database errors', async () => {
            getCurrentUser.mockResolvedValue(mockSuperAdminUser);
            prisma.sLARule.findMany.mockRejectedValue(new Error('DB Connection Failed'));

            const result = await getSLARules();

            expect(result).toEqual({ success: false, error: 'DB Connection Failed' });
        });
    });

    describe('createSLARule', () => {
        const createData = {
            module: 'ORDERS',
            metric: 'ASSIGNMENT_TIME',
            thresholdMinutes: 30,
            breachAction: 'NOTIFY'
        };

        it('should successfully create a rule for an ADMIN', async () => {
            getCurrentUser.mockResolvedValue(mockAdminUser);
            const mockRule = { id: 'rule1', ...createData };
            prisma.sLARule.create.mockResolvedValue(mockRule);

            const result = await createSLARule(createData);

            expect(result).toEqual({ success: true, rule: mockRule });
            expect(prisma.sLARule.create).toHaveBeenCalledWith({
                data: {
                    module: 'ORDERS',
                    metric: 'ASSIGNMENT_TIME',
                    thresholdMinutes: 30,
                    breachAction: 'NOTIFY'
                }
            });
            expect(logAdminAction).toHaveBeenCalledWith("CREATE_SLA_RULE", "ORDERS", "rule1", "admin1", { metric: 'ASSIGNMENT_TIME', thresholdMinutes: 30 });
        });

        it('should return error if not authorized', async () => {
            getCurrentUser.mockResolvedValue(null);

            const result = await createSLARule(createData);

            expect(result).toEqual({ success: false, error: 'Unauthorized to access SLA settings.' });
        });

        it('should catch database errors', async () => {
            getCurrentUser.mockResolvedValue(mockAdminUser);
            prisma.sLARule.create.mockRejectedValue(new Error('Constraint violation'));

            const result = await createSLARule(createData);

            expect(result).toEqual({ success: false, error: 'Constraint violation' });
        });
    });

    describe('updateSLARule', () => {
        const updateData = { active: false };

        it('should successfully update a rule for an ADMIN', async () => {
            getCurrentUser.mockResolvedValue(mockAdminUser);
            const mockRule = { id: 'rule1', module: 'ORDERS', active: false };
            prisma.sLARule.update.mockResolvedValue(mockRule);

            const result = await updateSLARule('rule1', updateData);

            expect(result).toEqual({ success: true, rule: mockRule });
            expect(prisma.sLARule.update).toHaveBeenCalledWith({
                where: { id: 'rule1' },
                data: updateData
            });
            expect(logAdminAction).toHaveBeenCalledWith("UPDATE_SLA_RULE", "ORDERS", "rule1", "admin1", updateData);
        });

        it('should return error if not authorized', async () => {
            getCurrentUser.mockResolvedValue(mockUser);

            const result = await updateSLARule('rule1', updateData);

            expect(result).toEqual({ success: false, error: 'Unauthorized to access SLA settings.' });
        });

        it('should catch database errors', async () => {
            getCurrentUser.mockResolvedValue(mockAdminUser);
            prisma.sLARule.update.mockRejectedValue(new Error('Rule not found'));

            const result = await updateSLARule('rule1', updateData);

            expect(result).toEqual({ success: false, error: 'Rule not found' });
        });
    });

    describe('deleteSLARule', () => {
        it('should successfully delete a rule for an ADMIN', async () => {
            getCurrentUser.mockResolvedValue(mockAdminUser);
            const mockRule = { id: 'rule1', module: 'ORDERS' };
            prisma.sLARule.delete.mockResolvedValue(mockRule);

            const result = await deleteSLARule('rule1');

            expect(result).toEqual({ success: true });
            expect(prisma.sLARule.delete).toHaveBeenCalledWith({ where: { id: 'rule1' } });
            expect(logAdminAction).toHaveBeenCalledWith("DELETE_SLA_RULE", "ORDERS", "rule1", "admin1", {});
        });

        it('should return error if not authorized', async () => {
            getCurrentUser.mockResolvedValue(mockUser);

            const result = await deleteSLARule('rule1');

            expect(result).toEqual({ success: false, error: 'Unauthorized to access SLA settings.' });
        });

        it('should catch database errors', async () => {
            getCurrentUser.mockResolvedValue(mockAdminUser);
            prisma.sLARule.delete.mockRejectedValue(new Error('Constraint violation'));

            const result = await deleteSLARule('rule1');

            expect(result).toEqual({ success: false, error: 'Constraint violation' });
        });
    });

    describe('getSLABreaches', () => {
        it('should successfully return breaches for an ADMIN', async () => {
            getCurrentUser.mockResolvedValue(mockAdminUser);
            const mockBreaches = [{ id: 'breach1', status: 'OPEN' }];
            prisma.sLABreach.findMany.mockResolvedValue(mockBreaches);

            const result = await getSLABreaches('OPEN');

            expect(result).toEqual({ success: true, breaches: mockBreaches });
            expect(prisma.sLABreach.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { status: 'OPEN' }
            }));
        });

        it('should return error if not authorized', async () => {
            getCurrentUser.mockResolvedValue(null);

            const result = await getSLABreaches();

            expect(result).toEqual({ success: false, error: 'Unauthorized to access SLA settings.' });
        });

        it('should catch database errors', async () => {
            getCurrentUser.mockResolvedValue(mockSuperAdminUser);
            prisma.sLABreach.findMany.mockRejectedValue(new Error('Timeout'));

            const result = await getSLABreaches();

            expect(result).toEqual({ success: false, error: 'Timeout' });
        });
    });

    describe('resolveSLABreach', () => {
        it('should successfully resolve a breach for an ADMIN', async () => {
            getCurrentUser.mockResolvedValue(mockAdminUser);
            const mockBreach = { id: 'breach1', rule: { module: 'ORDERS' }, targetId: 'txn1' };
            prisma.sLABreach.update.mockResolvedValue(mockBreach);

            const result = await resolveSLABreach('breach1');

            expect(result).toEqual({ success: true, breach: mockBreach });
            expect(prisma.sLABreach.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'breach1' },
                data: expect.objectContaining({ status: 'RESOLVED' })
            }));
            expect(logAdminAction).toHaveBeenCalledWith("RESOLVE_SLA_BREACH", "ORDERS", "breach1", "admin1", { targetId: 'txn1' });
        });

        it('should return error if not authorized', async () => {
            getCurrentUser.mockResolvedValue(mockUser);

            const result = await resolveSLABreach('breach1');

            expect(result).toEqual({ success: false, error: 'Unauthorized to access SLA settings.' });
        });

        it('should catch database errors', async () => {
            getCurrentUser.mockResolvedValue(mockAdminUser);
            prisma.sLABreach.update.mockRejectedValue(new Error('Breach not found'));

            const result = await resolveSLABreach('breach1');

            expect(result).toEqual({ success: false, error: 'Breach not found' });
        });
    });

    describe('checkSLABreaches', () => {
        it('should successfully check and create breaches', async () => {
            // No auth required for checkSLABreaches (engine function)
            const mockRules = [
                { id: 'rule1', module: 'ORDERS', metric: 'ASSIGNMENT_TIME', thresholdMinutes: 10, active: true },
                { id: 'rule2', module: 'ORDERS', metric: 'COMPLETION_TIME', thresholdMinutes: 60, active: true }
            ];
            prisma.sLARule.findMany.mockResolvedValue(mockRules);

            // First findMany is for ASSIGNMENT_TIME targetTransactions
            prisma.transaction.findMany.mockResolvedValueOnce([{ id: 'txn1' }]);
            // Second findMany is for existing breaches for rule1
            prisma.sLABreach.findMany.mockResolvedValueOnce([]);

            // Third findMany is for COMPLETION_TIME targetTransactions
            prisma.transaction.findMany.mockResolvedValueOnce([{ id: 'txn2' }]);
            // Fourth findMany is for existing breaches for rule2
            prisma.sLABreach.findMany.mockResolvedValueOnce([{ targetId: 'txn2' }]); // txn2 already breached

            const mockCreatedBreaches = [{ id: 'new_breach1', ruleId: 'rule1', targetId: 'txn1' }];
            prisma.sLABreach.createManyAndReturn.mockResolvedValue(mockCreatedBreaches);

            const result = await checkSLABreaches();

            expect(result).toEqual({ success: true, newBreaches: mockCreatedBreaches, count: 1 });
            expect(prisma.sLABreach.createManyAndReturn).toHaveBeenCalledWith({
                data: [{ ruleId: 'rule1', targetId: 'txn1', status: 'OPEN' }]
            });
        });

        it('should return successfully with no new breaches if no transactions match', async () => {
            const mockRules = [{ id: 'rule1', module: 'ORDERS', metric: 'ASSIGNMENT_TIME', thresholdMinutes: 10, active: true }];
            prisma.sLARule.findMany.mockResolvedValue(mockRules);
            prisma.transaction.findMany.mockResolvedValueOnce([]); // No matching transactions

            const result = await checkSLABreaches();

            expect(result).toEqual({ success: true, newBreaches: [], count: 0 });
            expect(prisma.sLABreach.createManyAndReturn).not.toHaveBeenCalled();
        });

        it('should catch database errors during rule lookup', async () => {
            prisma.sLARule.findMany.mockRejectedValue(new Error('Engine DB failure'));

            const result = await checkSLABreaches();

            expect(result).toEqual({ success: false, error: 'Engine DB failure' });
        });

        it('should catch database errors during breach creation', async () => {
            const mockRules = [{ id: 'rule1', module: 'ORDERS', metric: 'ASSIGNMENT_TIME', thresholdMinutes: 10, active: true }];
            prisma.sLARule.findMany.mockResolvedValue(mockRules);
            prisma.transaction.findMany.mockResolvedValueOnce([{ id: 'txn1' }]);
            prisma.sLABreach.findMany.mockResolvedValueOnce([]);

            prisma.sLABreach.createManyAndReturn.mockRejectedValue(new Error('Insert failed'));

            const result = await checkSLABreaches();

            expect(result).toEqual({ success: false, error: 'Insert failed' });
        });
    });
});
