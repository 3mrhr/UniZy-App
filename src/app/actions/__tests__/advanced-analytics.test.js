import { trackEvent } from '../advanced-analytics';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '../auth';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        analyticsEvent: {
            create: jest.fn(),
        },
    },
}));

jest.mock('../auth', () => ({
    getCurrentUser: jest.fn(),
}));

describe('trackEvent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should track event for a logged-in user', async () => {
        const mockUser = { id: 'user-123' };
        getCurrentUser.mockResolvedValue(mockUser);
        prisma.analyticsEvent.create.mockResolvedValue({ id: 1 });

        const metadata = { sessionId: 'sess-1', module: 'TEST', other: 'data' };
        const result = await trackEvent('TEST_EVENT', metadata);

        expect(result).toEqual({ success: true });
        expect(getCurrentUser).toHaveBeenCalled();
        expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
            data: {
                event: 'TEST_EVENT',
                userId: 'user-123',
                metadata: JSON.stringify(metadata),
                sessionId: 'sess-1',
                module: 'TEST',
            },
        });
    });

    it('should track event for an anonymous user', async () => {
        getCurrentUser.mockResolvedValue(null);
        prisma.analyticsEvent.create.mockResolvedValue({ id: 2 });

        const result = await trackEvent('ANON_EVENT');

        expect(result).toEqual({ success: true });
        expect(getCurrentUser).toHaveBeenCalled();
        expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
            data: {
                event: 'ANON_EVENT',
                userId: 'ANONYMOUS',
                metadata: JSON.stringify({}),
                sessionId: null,
                module: null,
            },
        });
    });

    it('should include sessionId and module from metadata if provided', async () => {
        getCurrentUser.mockResolvedValue({ id: 'user-456' });
        prisma.analyticsEvent.create.mockResolvedValue({ id: 3 });

        await trackEvent('MODULE_EVENT', { module: 'HOUSING', sessionId: 's-99' });

        expect(prisma.analyticsEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    sessionId: 's-99',
                    module: 'HOUSING',
                }),
            })
        );
    });

    it('should handle cases where metadata is missing sessionId or module', async () => {
        getCurrentUser.mockResolvedValue({ id: 'user-456' });
        prisma.analyticsEvent.create.mockResolvedValue({ id: 4 });

        await trackEvent('SIMPLE_EVENT', { someOtherData: 'value' });

        expect(prisma.analyticsEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    sessionId: null,
                    module: null,
                }),
            })
        );
    });

    it('should fail silently and return success: false on database error', async () => {
        getCurrentUser.mockResolvedValue({ id: 'user-123' });
        prisma.analyticsEvent.create.mockRejectedValue(new Error('Database connection failed'));

        // Suppress console.error for this test to keep test output clean
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const result = await trackEvent('ERROR_EVENT');

        expect(result).toEqual({ success: false });
        expect(consoleSpy).toHaveBeenCalledWith('Track event error:', expect.any(Error));

        consoleSpy.mockRestore();
    });

    it('should fail silently and return success: false if getCurrentUser throws', async () => {
        getCurrentUser.mockRejectedValue(new Error('Session error'));

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const result = await trackEvent('AUTH_ERROR_EVENT');

        expect(result).toEqual({ success: false });
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
