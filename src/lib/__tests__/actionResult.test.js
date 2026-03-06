import { success, failure } from '../actionResult';

describe('actionResult utility', () => {
    describe('success()', () => {
        it('should return { ok: true, success: true } when called without arguments', () => {
            const result = success();
            expect(result).toEqual({ ok: true, success: true });
        });

        it('should return { ok: true, success: true } when called with null', () => {
            const result = success(null);
            expect(result).toEqual({ ok: true, success: true });
        });

        it('should return { ok: true, success: true } when called with undefined', () => {
            const result = success(undefined);
            expect(result).toEqual({ ok: true, success: true });
        });

        it('should return { ok: true, success: true, data } when called with an object', () => {
            const testData = { id: 1, name: 'Test' };
            const result = success(testData);
            expect(result).toEqual({ ok: true, success: true, data: testData });
        });

        it('should return { ok: true, success: true, data } when called with primitive values', () => {
            expect(success('hello')).toEqual({ ok: true, success: true, data: 'hello' });
            expect(success(42)).toEqual({ ok: true, success: true, data: 42 });
            expect(success(0)).toEqual({ ok: true, success: true, data: 0 });
            expect(success(false)).toEqual({ ok: true, success: true, data: false });
            expect(success('')).toEqual({ ok: true, success: true, data: '' });
        });
    });

    describe('failure()', () => {
        it('should return { ok: false, success: false, error: { code, message } } with provided code and message', () => {
            const result = failure('NOT_FOUND', 'Item could not be found');
            expect(result).toEqual({
                ok: false,
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Item could not be found'
                }
            });
        });

        it('should return an object indicating failure with both success: false and ok: false', () => {
            const code = 'CUSTOM_ERROR';
            const message = 'A custom error occurred';
            const result = failure(code, message);

            expect(result.success).toBe(false);
            expect(result.ok).toBe(false);
            expect(result.error).toEqual({
                code,
                message
            });
        });

        it('should use a default message when no message is provided', () => {
            const result = failure('UNAUTHORIZED');
            expect(result).toEqual({
                ok: false,
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'An unexpected error occurred.'
                }
            });
        });

        it('should use a default message when message is an empty string, null, or undefined', () => {
            expect(failure('BAD_REQUEST', '')).toEqual({
                ok: false,
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: 'An unexpected error occurred.'
                }
            });
            expect(failure('SERVER_ERROR', undefined)).toEqual({
                ok: false,
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'An unexpected error occurred.'
                }
            });
            expect(failure('ERROR', null)).toEqual({
                ok: false,
                success: false,
                error: {
                    code: 'ERROR',
                    message: 'An unexpected error occurred.'
                }
            });
        });
    });
});
