const FALLBACK_DEV_SESSION_SECRET = 'unizy-dev-session-secret-32-chars++';

export function getSessionPassword() {
    const secret = process.env.SESSION_SECRET;

    if (typeof secret === 'string' && secret.length >= 32) {
        return secret;
    }

    const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build';
    if (process.env.NODE_ENV !== 'production' || isProductionBuild) {
        return FALLBACK_DEV_SESSION_SECRET;
    }

    throw new Error('SESSION_SECRET must be set to a string with at least 32 characters in production.');
}

export function getSessionOptions() {
    return {
        password: getSessionPassword(),
        cookieName: 'unizy_session',
        cookieOptions: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 1 week
        },
    };
}
