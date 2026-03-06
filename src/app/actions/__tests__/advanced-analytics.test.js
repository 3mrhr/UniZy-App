// We use standard jest mocks, because `next/jest` transpiles this as CommonJS.

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    analyticsEvent: {
      create: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('../auth', () => ({
  getCurrentUser: jest.fn(),
}));

import { requireRole, requireScope, requireOwnership, requireUser } from '@/lib/authz';
import * as auth from '@/app/actions/auth';
import { getSession } from '@/lib/session';
const { prisma } = require('@/lib/prisma');

const {
  trackEvent,
  getFunnelAnalytics,
  getModuleConversions,
  getRetentionCohorts,
} = require('../advanced-analytics');

describe('Advanced Analytics Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should create an analytics event with the user ID if user is logged in', async () => {
      auth.getCurrentUser.mockResolvedValue({ id: 'user-123' });
      prisma.analyticsEvent.create.mockResolvedValue({});

      const result = await trackEvent('TEST_EVENT', { module: 'TRANSPORT', sessionId: 'session-xyz' });

      expect(auth.getCurrentUser).toHaveBeenCalledTimes(1);
      expect(prisma.analyticsEvent.create).toHaveBeenCalledTimes(1);
      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: {
          event: 'TEST_EVENT',
          userId: 'user-123',
          metadata: JSON.stringify({ module: 'TRANSPORT', sessionId: 'session-xyz' }),
          sessionId: 'session-xyz',
          module: 'TRANSPORT',
        },
      });
      expect(result).toEqual({ success: true });
    });

    it('should create an analytics event with ANONYMOUS if user is not logged in', async () => {
      auth.getCurrentUser.mockResolvedValue(null);
      prisma.analyticsEvent.create.mockResolvedValue({});

      const result = await trackEvent('TEST_EVENT', {});

      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: {
          event: 'TEST_EVENT',
          userId: 'ANONYMOUS',
          metadata: JSON.stringify({}),
          sessionId: null,
          module: null,
        },
      });
      expect(result).toEqual({ success: true });
    });

    it('should fail silently and return { success: false } if database creation fails', async () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      auth.getCurrentUser.mockResolvedValue(null);
      prisma.analyticsEvent.create.mockRejectedValue(new Error('DB Error'));

      const result = await trackEvent('TEST_EVENT', {});

      expect(result).toEqual({ success: false });
      expect(consoleSpy).toHaveBeenCalledWith('Track event error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('getFunnelAnalytics', () => {
    it('should return error if user is not logged in', async () => {
      auth.getCurrentUser.mockResolvedValue(null);
      const result = await getFunnelAnalytics();
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('should return error if user is not an admin', async () => {
      auth.getCurrentUser.mockResolvedValue({ role: 'STUDENT' });
      const result = await getFunnelAnalytics();
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('should compute funnel analytics correctly for admin user', async () => {
      auth.getCurrentUser.mockResolvedValue({ role: 'ADMIN' });

      // prisma.user.count is called 4 times via Promise.all
      prisma.user.count
        .mockResolvedValueOnce(100) // totalRegistered
        .mockResolvedValueOnce(50)  // withFirstOrder
        .mockResolvedValueOnce(25)  // withRepeatOrders
        .mockResolvedValueOnce(20); // withPayment

      const result = await getFunnelAnalytics();

      expect(prisma.user.count).toHaveBeenCalledTimes(4);
      expect(result).toEqual({
        success: true,
        funnel: {
          registered: 100,
          firstOrder: 50,
          completedOrder: 25,
          paidOrder: 20,
          registrationToOrderRate: 50, // (50/100) * 100
          orderToCompletionRate: 50,   // (25/50) * 100
        },
      });
    });

    it('should handle zero divisions correctly', async () => {
      auth.getCurrentUser.mockResolvedValue({ role: 'ADMIN' });

      // All zeroes
      prisma.user.count.mockResolvedValue(0);

      const result = await getFunnelAnalytics();

      expect(result.funnel.registrationToOrderRate).toBe(0);
      expect(result.funnel.orderToCompletionRate).toBe(0);
    });

    it('should catch errors and return a generic failure message', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      auth.getCurrentUser.mockResolvedValue({ role: 'ADMIN' });
      prisma.user.count.mockRejectedValue(new Error('DB Error'));

      const result = await getFunnelAnalytics();

      expect(result).toEqual({ error: 'Failed to compute funnel.' });
      consoleSpy.mockRestore();
    });
  });

  describe('getModuleConversions', () => {
    it('should return error if user is not an admin', async () => {
      auth.getCurrentUser.mockResolvedValue({ role: 'MERCHANT' });
      const result = await getModuleConversions();
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('should return module conversions for admin user', async () => {
      auth.getCurrentUser.mockResolvedValue({ role: 'ADMIN_SUPER' });

      // Mock a simplified implementation to return consistent numbers
      prisma.transaction.groupBy.mockResolvedValue([
        { type: 'TRANSPORT', status: 'PENDING', _count: { _all: 5 } },
        { type: 'TRANSPORT', status: 'COMPLETED', _count: { _all: 5 } },
        { type: 'DELIVERY', status: 'COMPLETED', _count: { _all: 5 } },
        { type: 'DELIVERY', status: 'PENDING', _count: { _all: 5 } },
        // ... assuming all 7 modules have the same counts for testing
        { type: 'HOUSING', status: 'PENDING', _count: { _all: 5 } },
        { type: 'HOUSING', status: 'COMPLETED', _count: { _all: 5 } },
        { type: 'DEALS', status: 'PENDING', _count: { _all: 5 } },
        { type: 'DEALS', status: 'COMPLETED', _count: { _all: 5 } },
        { type: 'MEALS', status: 'PENDING', _count: { _all: 5 } },
        { type: 'MEALS', status: 'COMPLETED', _count: { _all: 5 } },
        { type: 'SERVICES', status: 'PENDING', _count: { _all: 5 } },
        { type: 'SERVICES', status: 'COMPLETED', _count: { _all: 5 } },
        { type: 'CLEANING', status: 'PENDING', _count: { _all: 5 } },
        { type: 'CLEANING', status: 'COMPLETED', _count: { _all: 5 } },
      ]);

      const result = await getModuleConversions();

      expect(prisma.transaction.groupBy).toHaveBeenCalledTimes(1);
      expect(prisma.transaction.groupBy).toHaveBeenCalledWith({
        by: ['type', 'status'],
        _count: {
          _all: true,
        },
        where: { type: { in: ['TRANSPORT', 'DELIVERY', 'HOUSING', 'DEALS', 'MEALS', 'SERVICES', 'CLEANING'] } },
      });
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(7);

      // Check first module
      expect(result.data[0]).toEqual({
        module: 'TRANSPORT',
        started: 10, // 5 pending + 5 completed
        completed: 5,
        conversionRate: 50,
      });
    });

    it('should handle zero conversions correctly', async () => {
      auth.getCurrentUser.mockResolvedValue({ role: 'ADMIN' });
      prisma.transaction.groupBy.mockResolvedValue([]);

      const result = await getModuleConversions();

      expect(result.data[0].conversionRate).toBe(0);
      expect(result.data[0].started).toBe(0);
      expect(result.data[0].completed).toBe(0);
    });

    it('should catch errors and return a generic failure message', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      auth.getCurrentUser.mockResolvedValue({ role: 'ADMIN' });
      prisma.transaction.groupBy.mockRejectedValue(new Error('DB Error'));

      const result = await getModuleConversions();

      expect(result).toEqual({ error: 'Failed to compute conversions.' });
      consoleSpy.mockRestore();
    });
  });

  describe('getRetentionCohorts', () => {
    beforeAll(() => {
      // Mock the current date to ensure deterministic tests
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-10-31T12:00:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should return error if user is not an admin', async () => {
      auth.getCurrentUser.mockResolvedValue(null);
      const result = await getRetentionCohorts();
      expect(result).toEqual({ error: 'Unauthorized' });
    });

    it('should compute retention cohorts for past 4 weeks', async () => {
      auth.getCurrentUser.mockResolvedValue({ role: 'ADMIN' });

      // Let's create mock orders falling into different weeks
      const now = new Date('2023-10-31T12:00:00Z');

      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 4); // Week -1

      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 10); // Week -2

      prisma.$queryRaw.mockResolvedValue([
        { week_index: 0, activeUsers: 2 }, // Week -1
        { week_index: 1, activeUsers: 2 }, // Week -2
      ]);

      const result = await getRetentionCohorts(4);

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(result.success).toBe(true);
      expect(result.cohorts.length).toBe(4);

      // Cohort for Week -1 (0 to 7 days ago)
      expect(result.cohorts[0].week).toBe('Week -1');
      expect(result.cohorts[0].activeUsers).toBe(2); // u1, u2

      // Cohort for Week -2 (7 to 14 days ago)
      expect(result.cohorts[1].week).toBe('Week -2');
      expect(result.cohorts[1].activeUsers).toBe(2); // u1, u3

      // Cohort for Week -3 (14 to 21 days ago)
      expect(result.cohorts[2].week).toBe('Week -3');
      expect(result.cohorts[2].activeUsers).toBe(0);
    });

    it('should catch errors and return a generic failure message', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      auth.getCurrentUser.mockResolvedValue({ role: 'ADMIN' });
      prisma.$queryRaw.mockRejectedValue(new Error('DB Error'));

      const result = await getRetentionCohorts();

      expect(result).toEqual({ error: 'Failed to compute retention.' });
      consoleSpy.mockRestore();
    });
  });
});
