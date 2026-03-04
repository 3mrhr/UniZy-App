import { logAdminAction, getAuditLogs } from '../audit';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '../auth';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        auditLog: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

jest.mock('../auth', () => ({
    getCurrentUser: jest.fn(),
}));

describe('Audit Actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Spy on console.warn and console.error to keep test output clean and verify they are called
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('logAdminAction', () => {
        it('should successfully log an action when user is an admin', async () => {
            getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN' });
            prisma.auditLog.create.mockResolvedValue({ id: 'log123' });

            const result = await logAdminAction('UPDATE_ROLE', 'USERS', 'user456', { oldRole: 'USER', newRole: 'ADMIN' });

            expect(result).toBe(true);
            expect(getCurrentUser).toHaveBeenCalledTimes(1);
            expect(prisma.auditLog.create).toHaveBeenCalledWith({
                data: {
                    action: 'UPDATE_ROLE',
                    module: 'USERS',
                    targetId: 'user456',
                    details: JSON.stringify({ oldRole: 'USER', newRole: 'ADMIN' }),
                    adminId: 'admin123',
                },
            });
            expect(console.warn).not.toHaveBeenCalled();
            expect(console.error).not.toHaveBeenCalled();
        });

        it('should fail silently and return false when user is not found', async () => {
            getCurrentUser.mockResolvedValue(null);

            const result = await logAdminAction('UPDATE_ROLE', 'USERS', 'user456');

            expect(result).toBe(false);
            expect(getCurrentUser).toHaveBeenCalledTimes(1);
            expect(prisma.auditLog.create).not.toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Blocked unauthorized log attempt from non-admin user Unknown'));
        });

        it('should fail silently and return false when user is not an admin', async () => {
            getCurrentUser.mockResolvedValue({ id: 'user789', role: 'USER' });

            const result = await logAdminAction('UPDATE_ROLE', 'USERS', 'user456');

            expect(result).toBe(false);
            expect(getCurrentUser).toHaveBeenCalledTimes(1);
            expect(prisma.auditLog.create).not.toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Blocked unauthorized log attempt from non-admin user user789'));
        });

        it('should handle optional targetId and details being omitted', async () => {
            getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN' });
            prisma.auditLog.create.mockResolvedValue({ id: 'log123' });

            const result = await logAdminAction('EXPORT_DATA', 'HUB');

            expect(result).toBe(true);
            expect(prisma.auditLog.create).toHaveBeenCalledWith({
                data: {
                    action: 'EXPORT_DATA',
                    module: 'HUB',
                    targetId: null,
                    details: null,
                    adminId: 'admin123',
                },
            });
        });

        it('should handle database errors gracefully and return false', async () => {
            getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN' });
            const error = new Error('DB Connection Failed');
            prisma.auditLog.create.mockRejectedValue(error);

            const result = await logAdminAction('DELETE_POST', 'HUB', 'post123');

            expect(result).toBe(false);
            expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith('[AUDIT_ERROR] Failed to save audit log:', error);
        });
    });

    describe('getAuditLogs', () => {
        it('should return logs for super admin', async () => {
            getCurrentUser.mockResolvedValue({ id: 'super123', role: 'ADMIN_SUPER' });
            const mockLogs = [{ id: '1', action: 'TEST' }];
            prisma.auditLog.findMany.mockResolvedValue(mockLogs);

            const result = await getAuditLogs();

            expect(result).toEqual({ success: true, data: mockLogs });
            expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: { createdAt: 'desc' },
                take: 100,
                include: {
                    admin: { select: { name: true, role: true, email: true } },
                },
            });
        });

        it('should apply filters when provided', async () => {
            getCurrentUser.mockResolvedValue({ id: 'super123', role: 'ADMIN_SUPER' });
            const mockLogs = [{ id: '1', action: 'TEST' }];
            prisma.auditLog.findMany.mockResolvedValue(mockLogs);

            const filters = { module: 'USERS', adminId: 'admin123' };
            const result = await getAuditLogs(filters);

            expect(result).toEqual({ success: true, data: mockLogs });
            expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
                where: { module: 'USERS', adminId: 'admin123' },
                orderBy: { createdAt: 'desc' },
                take: 100,
                include: {
                    admin: { select: { name: true, role: true, email: true } },
                },
            });
        });

        it('should ignore ALL module filter', async () => {
            getCurrentUser.mockResolvedValue({ id: 'super123', role: 'ADMIN_SUPER' });
            prisma.auditLog.findMany.mockResolvedValue([]);

            await getAuditLogs({ module: 'ALL' });

            expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {},
                })
            );
        });

        it('should return unauthorized error if user is not super admin', async () => {
            getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN' });

            const result = await getAuditLogs();

            expect(result).toEqual({ error: 'Unauthorized. Super Admin access required to view global audit logs.' });
            expect(prisma.auditLog.findMany).not.toHaveBeenCalled();
        });

        it('should return unauthorized error if user is not logged in', async () => {
            getCurrentUser.mockResolvedValue(null);

            const result = await getAuditLogs();

            expect(result).toEqual({ error: 'Unauthorized. Super Admin access required to view global audit logs.' });
            expect(prisma.auditLog.findMany).not.toHaveBeenCalled();
        });

        it('should handle database errors gracefully and return error object', async () => {
            getCurrentUser.mockResolvedValue({ id: 'super123', role: 'ADMIN_SUPER' });
            const error = new Error('DB Error');
            prisma.auditLog.findMany.mockRejectedValue(error);

            const result = await getAuditLogs();

            expect(result).toEqual({ error: 'Failed to retrieve logs' });
            expect(console.error).toHaveBeenCalledWith('Failed to fetch audit logs:', error);
        });
    });
});
