import { logAdminAction, getAuditLogs } from '../audit';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '../auth';

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
  let consoleWarnMock;
  let consoleErrorMock;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  describe('logAdminAction', () => {
    it('should successfully log an action for an ADMIN user with all details', async () => {
      getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN_SUPER' });
      prisma.auditLog.create.mockResolvedValue({ id: 'log123' });

      const result = await logAdminAction('CREATE_USER', 'USERS', 'user456', { ip: '127.0.0.1' });

      expect(result).toBe(true);
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'CREATE_USER',
          module: 'USERS',
          targetId: 'user456',
          details: JSON.stringify({ ip: '127.0.0.1' }),
          adminId: 'admin123',
        },
      });
    });

    it('should successfully log an action without targetId and details', async () => {
      getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN_SUPER' });
      prisma.auditLog.create.mockResolvedValue({ id: 'log124' });

      const result = await logAdminAction('VIEW_DASHBOARD', 'DASHBOARD');

      expect(result).toBe(true);
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          action: 'VIEW_DASHBOARD',
          module: 'DASHBOARD',
          targetId: null,
          details: null,
          adminId: 'admin123',
        },
      });
    });

    it('should fail silently for non-admin users', async () => {
      getCurrentUser.mockResolvedValue({ id: 'user123', role: 'STUDENT' });

      const result = await logAdminAction('CREATE_USER', 'USERS');

      expect(result).toBe(false);
      expect(prisma.auditLog.create).not.toHaveBeenCalled();
      expect(consoleWarnMock).toHaveBeenCalledWith(expect.stringContaining('[AUDIT] Blocked unauthorized log attempt from non-admin user user123'));
    });

    it('should fail silently when no user is logged in', async () => {
      getCurrentUser.mockResolvedValue(null);

      const result = await logAdminAction('CREATE_USER', 'USERS');

      expect(result).toBe(false);
      expect(prisma.auditLog.create).not.toHaveBeenCalled();
      expect(consoleWarnMock).toHaveBeenCalledWith(expect.stringContaining('[AUDIT] Blocked unauthorized log attempt from non-admin user Unknown'));
    });

    it('should return false if an error occurs during logging', async () => {
      getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN_SUPER' });
      const error = new Error('DB Error');
      prisma.auditLog.create.mockRejectedValue(error);

      const result = await logAdminAction('CREATE_USER', 'USERS');

      expect(result).toBe(false);
      expect(consoleErrorMock).toHaveBeenCalledWith('[AUDIT_ERROR] Failed to save audit log:', error);
    });
  });

  describe('getAuditLogs', () => {
    it('should fetch audit logs for an ADMIN_SUPER user with filters applied', async () => {
      getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN_SUPER' });
      const mockLogs = [{ id: 'log123', action: 'UPDATE_ROLE' }];
      prisma.auditLog.findMany.mockResolvedValue(mockLogs);

      const result = await getAuditLogs({ module: 'USERS', adminId: 'admin456' });

      expect(result).toEqual({ success: true, data: mockLogs });
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { module: 'USERS', adminId: 'admin456' },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          admin: {
            select: { name: true, role: true, email: true },
          },
        },
      });
    });

    it('should return an error if user is not ADMIN_SUPER', async () => {
      getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN_HUB' });

      const result = await getAuditLogs();

      expect(result).toEqual({ error: 'Unauthorized. Super Admin access required to view global audit logs.' });
      expect(prisma.auditLog.findMany).not.toHaveBeenCalled();
    });

    it('should return an error if no user is logged in', async () => {
      getCurrentUser.mockResolvedValue(null);

      const result = await getAuditLogs();

      expect(result).toEqual({ error: 'Unauthorized. Super Admin access required to view global audit logs.' });
      expect(prisma.auditLog.findMany).not.toHaveBeenCalled();
    });

    it('should ignore ALL module filter', async () => {
      getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN_SUPER' });
      prisma.auditLog.findMany.mockResolvedValue([]);

      await getAuditLogs({ module: 'ALL' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {},
      }));
    });

    it('should work without filters parameter', async () => {
      getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN_SUPER' });
      prisma.auditLog.findMany.mockResolvedValue([]);

      await getAuditLogs();

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: {},
      }));
    });

    it('should return an error if fetching logs fails', async () => {
      getCurrentUser.mockResolvedValue({ id: 'admin123', role: 'ADMIN_SUPER' });
      const error = new Error('DB Error');
      prisma.auditLog.findMany.mockRejectedValue(error);

      const result = await getAuditLogs();

      expect(result).toEqual({ error: 'Failed to retrieve logs' });
      expect(consoleErrorMock).toHaveBeenCalledWith('Failed to fetch audit logs:', error);
    });
  });
});
