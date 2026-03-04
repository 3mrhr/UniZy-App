// Basic in-memory rate limiter for Dev/MVP
const trackers = new Map();

/**
 * @param {string} key - Unique key for the action (e.g. 'auth:login:127.0.0.1')
 * @param {number} limit - Max attempts
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Promise<{success: boolean, remaining: number}>}
 */
export async function rateLimit(key, limit, windowMs) {
    const now = Date.now();
    const record = trackers.get(key) || { count: 0, expires: now + windowMs };

    if (now > record.expires) {
        record.count = 0;
        record.expires = now + windowMs;
    }

    if (record.count >= limit) {
        return { success: false, remaining: 0 };
    }

    record.count += 1;
    trackers.set(key, record);

    return { success: true, remaining: limit - record.count };
}

// Cleanup interval to prevent memory leaks
if (typeof setInterval !== 'undefined') {
    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of trackers.entries()) {
            if (now > record.expires) {
                trackers.delete(key);
            }
        }
    }, 60000); // Every minute
    if (cleanupInterval.unref) {
        cleanupInterval.unref();
    }
}

// Export for testing
export function _resetTrackers() {
    trackers.clear();
}
