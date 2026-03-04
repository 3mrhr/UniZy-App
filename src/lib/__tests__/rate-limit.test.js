import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
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
        assert.strictEqual(result1.success, true);
        assert.strictEqual(result1.remaining, 2);

        const result2 = await rateLimit(key, limit, windowMs);
        assert.strictEqual(result2.success, true);
        assert.strictEqual(result2.remaining, 1);

        const result3 = await rateLimit(key, limit, windowMs);
        assert.strictEqual(result3.success, true);
        assert.strictEqual(result3.remaining, 0);
    });

    it('should reject requests above limit', async () => {
        const key = 'test-key-2';
        const limit = 2;
        const windowMs = 1000;

        await rateLimit(key, limit, windowMs);
        await rateLimit(key, limit, windowMs);

        const result3 = await rateLimit(key, limit, windowMs);
        assert.strictEqual(result3.success, false);
        assert.strictEqual(result3.remaining, 0);
    });

    it('should track different keys independently', async () => {
        const key1 = 'test-key-A';
        const key2 = 'test-key-B';
        const limit = 2;
        const windowMs = 1000;

        await rateLimit(key1, limit, windowMs);
        await rateLimit(key1, limit, windowMs);

        const resultKey1 = await rateLimit(key1, limit, windowMs);
        assert.strictEqual(resultKey1.success, false);

        const resultKey2 = await rateLimit(key2, limit, windowMs);
        assert.strictEqual(resultKey2.success, true);
        assert.strictEqual(resultKey2.remaining, 1);
    });

    it('should reset limit after windowMs expires', async () => {
        const key = 'test-key-window';
        const limit = 1;
        const windowMs = 1000;

        mock.timers.enable({ apis: ['Date'] });

        // Use initial limit
        const result1 = await rateLimit(key, limit, windowMs);
        assert.strictEqual(result1.success, true);

        // Exceed limit
        const result2 = await rateLimit(key, limit, windowMs);
        assert.strictEqual(result2.success, false);

        // Advance time past windowMs
        mock.timers.tick(1500);

        // Should succeed again
        const result3 = await rateLimit(key, limit, windowMs);
        assert.strictEqual(result3.success, true);
        assert.strictEqual(result3.remaining, 0);

        mock.timers.reset();
    });
});
