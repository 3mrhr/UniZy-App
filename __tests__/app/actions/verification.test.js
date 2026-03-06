import { requestOTP, verifyOTP } from '../../../src/app/actions/verification';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        oTP: {
            updateMany: jest.fn(),
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock('../../../src/app/actions/auth', () => ({
    getCurrentUser: jest.fn(),
}));

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

describe('verification actions', () => {
    let consoleLogSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    describe('requestOTP', () => {
        it('should NOT log the OTP code to console', async () => {
            prisma.oTP.updateMany.mockResolvedValue({ count: 1 });
            prisma.oTP.create.mockResolvedValue({});

            const result = await requestOTP('test@example.com');

            expect(result.success).toBe(true);
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });
    });

    describe('verifyOTP', () => {
        it('should NOT log the smoke test bypass message for code 000000', async () => {
            const result = await verifyOTP('test@example.com', '000000');

            expect(result.success).toBe(true);
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });

        it('should verify a valid OTP without logging sensitive info', async () => {
            const mockOtp = { id: 'otp1', identifier: 'test@example.com', code: '123456' };
            prisma.oTP.findFirst.mockResolvedValue(mockOtp);
            prisma.oTP.update.mockResolvedValue({});

            const result = await verifyOTP('test@example.com', '123456');

            expect(result.success).toBe(true);
            expect(consoleLogSpy).not.toHaveBeenCalled();
        });
    });
});
