import { jest } from '@jest/globals';
import { rateLimit, _resetTrackers } from '../rate-limit.js';

describe('rateLimit', () => {
    beforeEach(() => {
        _resetTrackers();
    });

    it('should allow requests below limit', async () => {
        const key = 'test-key-1';
        const limit = 3;
        const windowMs = 1000;

        const result1 = await rateLimit(key, limit, windowMs);
        expect(result1.success).toBe(true);
        expect(result1.remaining).toBe(2);

        const result2 = await rateLimit(key, limit, windowMs);
        expect(result2.success).toBe(true);
        expect(result2.remaining).toBe(1);

        const result3 = await rateLimit(key, limit, windowMs);
        expect(result3.success).toBe(true);
        expect(result3.remaining).toBe(0);
    });

    it('should reject requests above limit', async () => {
        const key = 'test-key-2';
        const limit = 2;
        const windowMs = 1000;

        await rateLimit(key, limit, windowMs);
        await rateLimit(key, limit, windowMs);

        const result3 = await rateLimit(key, limit, windowMs);
        expect(result3.success).toBe(false);
        expect(result3.remaining).toBe(0);
    });

    it('should track different keys independently', async () => {
        const key1 = 'test-key-A';
        const key2 = 'test-key-B';
        const limit = 2;
        const windowMs = 1000;

        await rateLimit(key1, limit, windowMs);
        await rateLimit(key1, limit, windowMs);

        const resultKey1 = await rateLimit(key1, limit, windowMs);
        expect(resultKey1.success).toBe(false);

        const resultKey2 = await rateLimit(key2, limit, windowMs);
        expect(resultKey2.success).toBe(true);
        expect(resultKey2.remaining).toBe(1);
    });

    it('should reset limit after windowMs expires', async () => {
        const key = 'test-key-window';
        const limit = 1;
        const windowMs = 1000;

        jest.useFakeTimers();

        // Use initial limit
        const result1 = await rateLimit(key, limit, windowMs);
        expect(result1.success).toBe(true);

        // Exceed limit
        const result2 = await rateLimit(key, limit, windowMs);
        expect(result2.success).toBe(false);

        // Advance time past windowMs
        jest.advanceTimersByTime(1500);

        // Should succeed again
        const result3 = await rateLimit(key, limit, windowMs);
        expect(result3.success).toBe(true);
        expect(result3.remaining).toBe(0);

        jest.useRealTimers();
    });
});

describe('rateLimit cleanup interval', () => {
    let rateLimitModule;
    let deleteSpy;

    beforeEach(async () => {
        jest.useFakeTimers();
        // Spy on Map delete before module load so we catch what it does
        deleteSpy = jest.spyOn(Map.prototype, 'delete');
        jest.resetModules();
        rateLimitModule = await import('../rate-limit.js');
    });

    afterEach(() => {
        if (rateLimitModule) {
            rateLimitModule._resetTrackers();
        }
        deleteSpy.mockRestore();
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('should clean up expired trackers', async () => {
        const { rateLimit } = rateLimitModule;

        await rateLimit('expire-key', 5, 1000);
        await rateLimit('keep-key', 5, 100000);

        // Advance time to expire 'expire-key' and trigger the 60s cleanup interval
        jest.advanceTimersByTime(61000);

        expect(deleteSpy).toHaveBeenCalledWith('expire-key');
        expect(deleteSpy).not.toHaveBeenCalledWith('keep-key');
    });

    it('should call unref if present on the interval', async () => {
        jest.resetModules();
        const mockInterval = { unref: jest.fn() };
        jest.spyOn(global, 'setInterval').mockReturnValue(mockInterval);

        await import('../rate-limit.js');

        expect(mockInterval.unref).toHaveBeenCalled();
        jest.restoreAllMocks();
    });
});
