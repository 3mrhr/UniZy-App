import { success, failure } from '../actionResult';

describe('actionResult', () => {
    describe('success', () => {
        it('should return { ok: true } when called with no arguments', () => {
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

        it('should return { ok: true, data } when called with a primitive other than null', () => {
            const resultString = success('hello');
            expect(resultString).toEqual({ ok: true, data: 'hello' });

            const resultNumber = success(42);
            expect(resultNumber).toEqual({ ok: true, data: 42 });

            const resultBoolean = success(false);
            expect(resultBoolean).toEqual({ ok: true, data: false });
        });
    });

    describe('failure', () => {
        it('should return { ok: false, error: { code, message } } when provided both arguments', () => {
            const result = failure('NOT_FOUND', 'Item could not be found');
            expect(result).toEqual({
                ok: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Item could not be found'
                }
            });
        });

        it('should return default message when message argument is omitted', () => {
            const result = failure('UNAUTHORIZED');
            expect(result).toEqual({
                ok: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'An unexpected error occurred.'
                }
            });
        });

        it('should return default message when message argument is empty string', () => {
            const result = failure('BAD_REQUEST', '');
            expect(result).toEqual({
                ok: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: 'An unexpected error occurred.'
                }
            });
        });

        it('should return default message when message argument is undefined', () => {
            const result = failure('SERVER_ERROR', undefined);
            expect(result).toEqual({
                ok: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'An unexpected error occurred.'
                }
            });
        });
    });
});
