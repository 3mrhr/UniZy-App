import { success, failure } from '../actionResult.js';

describe('actionResult utility', () => {
    describe('success()', () => {
        it('should return { ok: true } when called without arguments', () => {
            const result = success();
            expect(result).toEqual({ ok: true });
        });

        it('should return { ok: true, data } when called with a data payload', () => {
            const dataPayload = { id: 1, name: 'Test User' };
            const result = success(dataPayload);
            expect(result).toEqual({ ok: true, data: dataPayload });
        });

        it('should return { ok: true, data } when called with falsy primitives other than null (e.g. 0, false, "")', () => {
            expect(success(0)).toEqual({ ok: true, data: 0 });
            expect(success(false)).toEqual({ ok: true, data: false });
            expect(success('')).toEqual({ ok: true, data: '' });
        });

        it('should return { ok: true } when data is explicitly null', () => {
            expect(success(null)).toEqual({ ok: true });
        });
    });

    describe('failure()', () => {
        it('should return { ok: false, error: { code, message } } with provided code and message', () => {
            const code = 'UNAUTHORIZED';
            const message = 'You must be logged in to access this resource.';
            const result = failure(code, message);

            expect(result).toEqual({
                ok: false,
                error: {
                    code,
                    message
                }
            });
        });

        it('should use a default message when no message is provided', () => {
            const code = 'INTERNAL_ERROR';
            const result = failure(code);

            expect(result).toEqual({
                ok: false,
                error: {
                    code,
                    message: 'An unexpected error occurred.'
                }
            });
        });

        it('should use a default message when message is an empty string', () => {
            const code = 'UNKNOWN';
            const result = failure(code, '');

            expect(result).toEqual({
                ok: false,
                error: {
                    code,
                    message: 'An unexpected error occurred.'
                }
            });
        });
    });
});
