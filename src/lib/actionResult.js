/**
 * Standardized Server Action Result Pattern
 * Provides consistent return shapes for all server actions across the app.
 */

/**
 * Return a success response
 * @param {any} data - The payload to return
 * @returns {object} { ok: true, data }
 */
export function success(data = null) {
    if (data !== null) {
        return { ok: true, success: true, data };
    }
    return { ok: true, success: true };
}

/**
 * Return a standardized error response
 * @param {string} code - Machine-readable error code (e.g. 'UNAUTHORIZED', 'NOT_FOUND')
 * @param {string} message - Human-readable error message
 * @returns {object} { ok: false, error: { code, message } }
 */
export function failure(code, message) {
    return {
        ok: false,
        success: false,
        error: {
            code,
            message: message || 'An unexpected error occurred.'
        }
    };
}
