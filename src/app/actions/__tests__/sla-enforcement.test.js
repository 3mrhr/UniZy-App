import { checkSLABreaches } from '../sla-enforcement';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        sLARule: {
            findMany: jest.fn()
        },
        order: {
            findMany: jest.fn()
        },
        supportTicket: {
            findMany: jest.fn()
        },
        sLABreach: {
            findMany: jest.fn(),
            createMany: jest.fn()
        },
        notification: {
            createMany: jest.fn()
        }
    }
}));

// Mock other dependencies if necessary
jest.mock('../auth', () => ({
    getCurrentUser: jest.fn()
}));
jest.mock('../audit', () => ({
    logAdminAction: jest.fn()
}));

describe('checkSLABreaches', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should verify N+1 query issue is resolved in optimized implementation', async () => {
        const activeRules = [
            { id: 'rule1', metric: 'ORDER_ACCEPTANCE_TIME', thresholdMinutes: 10, name: 'Rule 1' },
            { id: 'rule2', metric: 'ORDER_ACCEPTANCE_TIME', thresholdMinutes: 20, name: 'Rule 2' },
        ];

        prisma.sLARule.findMany.mockResolvedValue(activeRules);

        const now = new Date();
        const orders = [
            { id: 'order1', createdAt: new Date(now - 15 * 60 * 1000) },
            { id: 'order2', createdAt: new Date(now - 25 * 60 * 1000) },
        ];

        prisma.order.findMany.mockResolvedValue(orders);
        prisma.sLABreach.findMany.mockResolvedValue([]);
        prisma.sLABreach.createMany.mockResolvedValue({ count: 2 });
        prisma.notification.createMany.mockResolvedValue({ count: 2 });

        await checkSLABreaches();

        // After optimization, sLABreach.findMany should be called only once, regardless of the number of rules.
        expect(prisma.sLABreach.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.sLABreach.createMany).toHaveBeenCalledTimes(1);
        expect(prisma.notification.createMany).toHaveBeenCalledTimes(1);
    });
});
