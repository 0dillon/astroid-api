import { AuditCleanupQueue } from '../queues/audit-cleanup.queue';
import { PrismaService } from '../../../database/prisma.service';
import { EventBusService } from '../../../events/event-bus.service';
import { ConfigService } from '@nestjs/config';
import { vi } from 'vitest';
import { Job } from 'bullmq';

describe('AuditCleanupQueue', () => {
  let queue: AuditCleanupQueue;
  let mockPrisma: Partial<PrismaService>;
  let mockEventBus: Partial<EventBusService>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockPrisma = {
      organization: {
        findMany: vi.fn().mockResolvedValue([{ id: 'org-1' }]),
      } as any,
      auditLog: {
        findMany: vi.fn().mockResolvedValueOnce([{ id: 'log-1' }]).mockResolvedValue([]),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      } as any,
      cleanupJobLog: {
        create: vi.fn().mockResolvedValue({}),
      } as any,
    };

    mockEventBus = {
      emit: vi.fn(),
    };

    mockConfigService = {
      get: vi.fn().mockReturnValue(90),
    };

    queue = new AuditCleanupQueue(
      mockPrisma as PrismaService,
      mockEventBus as EventBusService,
      mockConfigService as ConfigService
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should clean up expired audit logs and record success', async () => {
    const job = { id: 'job-1' } as Job;
    await queue.process(job);

    expect(mockPrisma.organization.findMany).toHaveBeenCalled();
    expect(mockPrisma.auditLog.findMany).toHaveBeenCalled();
    expect(mockPrisma.auditLog.deleteMany).toHaveBeenCalled();
    
    expect(mockPrisma.cleanupJobLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jobName: 'audit-cleanup',
          recordsDeleted: 1, // 1 from org loop, 1 from system loop because mockResolvedValueOnce is shared among findMany calls
          status: 'SUCCESS',
        }),
      })
    );
  });
});

