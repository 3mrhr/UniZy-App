import { success, failure } from '../actionResult';

describe('actionResult utility', () => {
    describe('success()', () => {
        it('should return { ok: true } when called without arguments', () => {
            const result = success();
            expect(result).toEqual({ ok: true });
        });

        it('should return { ok: true } when called with null', () => {
            const result = success(null);
            expect(result).toEqual({ ok: true });
        });

        it('should return { ok: true, data } when called with an object', () => {
            const testData = { id: 1, name: 'Test' };
            const result = success(testData);
            expect(result).toEqual({ ok: true, data: testData });
        });

        it('should return { ok: true, data } when called with primitive values', () => {
            expect(success('hello')).toEqual({ ok: true, data: 'hello' });
            expect(success(42)).toEqual({ ok: true, data: 42 });
            expect(success(0)).toEqual({ ok: true, data: 0 });
            expect(success(false)).toEqual({ ok: true, data: false });
            expect(success('')).toEqual({ ok: true, data: '' });
        });
    });

    describe('failure()', () => {
        it('should return { ok: false, error: { code, message } } with provided code and message', () => {
            const result = failure('NOT_FOUND', 'Item could not be found');
            expect(result).toEqual({
                ok: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Item could not be found'
                }
            });
        });

        it('should use a default message when no message is provided', () => {
            const result = failure('UNAUTHORIZED');
            expect(result).toEqual({
                ok: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'An unexpected error occurred.'
                }
            });
        });

        it('should use a default message when message is an empty string, null, or undefined', () => {
            expect(failure('BAD_REQUEST', '')).toEqual({
                ok: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: 'An unexpected error occurred.'
                }
            });
            expect(failure('SERVER_ERROR', undefined)).toEqual({
                ok: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'An unexpected error occurred.'
                }
            });
            expect(failure('ERROR', null)).toEqual({
                ok: false,
                error: {
                    code: 'ERROR',
                    message: 'An unexpected error occurred.'
                }
            });
        });
    });
});
