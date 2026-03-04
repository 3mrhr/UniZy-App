import { triggerSOS } from '../orders';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        supportTicket: {
            create: jest.fn(),
        },
    },
}));

jest.mock('@/lib/authz', () => ({
    requireRole: jest.fn(),
}));

describe('triggerSOS', () => {
    const mockOrderId = 'order-123';
    const mockUser = { id: 'user-456' };
    const mockTicket = { id: 'ticket-789', subject: `EMERGENCY ALERT: Order ${mockOrderId}` };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default successful mock responses
        requireRole.mockResolvedValue(mockUser);
        prisma.supportTicket.create.mockResolvedValue(mockTicket);

        // Mock console.error to keep test output clean during expected error tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it('should successfully create an SOS ticket and return { success: true, ticket }', async () => {
        const result = await triggerSOS(mockOrderId);

        // Verify requireRole was called with correct roles
        expect(requireRole).toHaveBeenCalledWith(['STUDENT', 'DRIVER']);

        // Verify prisma.supportTicket.create was called with correct data
        expect(prisma.supportTicket.create).toHaveBeenCalledWith({
            data: {
                subject: `EMERGENCY ALERT: Order ${mockOrderId}`,
                category: 'SAFETY',
                priority: 'HIGH',
                status: 'OPEN',
                userId: mockUser.id,
            },
        });

        // Verify successful return value
        expect(result).toEqual({ success: true, ticket: mockTicket });
    });

    it('should return error object when requireRole throws (e.g., unauthorized)', async () => {
        const authError = new Error('Unauthorized');
        requireRole.mockRejectedValue(authError);

        const result = await triggerSOS(mockOrderId);

        // Verify authz was checked
        expect(requireRole).toHaveBeenCalledWith(['STUDENT', 'DRIVER']);

        // Verify prisma was NOT called
        expect(prisma.supportTicket.create).not.toHaveBeenCalled();

        // Verify console.error was called with the caught error
        expect(console.error).toHaveBeenCalledWith('Failed to trigger SOS:', authError);

        // Verify error return value
        expect(result).toEqual({ error: 'Failed to trigger SOS.' });
    });

    it('should return error object when prisma.supportTicket.create throws a database error', async () => {
        const dbError = new Error('Database connection failed');
        prisma.supportTicket.create.mockRejectedValue(dbError);

        const result = await triggerSOS(mockOrderId);

        // Verify requireRole was called
        expect(requireRole).toHaveBeenCalledWith(['STUDENT', 'DRIVER']);

        // Verify prisma was called
        expect(prisma.supportTicket.create).toHaveBeenCalled();

        // Verify console.error was called with the caught error
        expect(console.error).toHaveBeenCalledWith('Failed to trigger SOS:', dbError);

        // Verify error return value
        expect(result).toEqual({ error: 'Failed to trigger SOS.' });
    });
});
