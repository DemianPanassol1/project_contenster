import { describe, expect, it, vi } from 'vitest';

import { CronExecutionStatus } from '@contenster/shared';

import { CronLogCleanupService } from './cron-log-cleanup.service';

describe('CronLogCleanupService', () => {
  it('records the number of expired routine logs removed', async () => {
    const cronExecutionLogs = {
      deleteCreatedBefore: vi.fn().mockResolvedValue(4),
      record: vi.fn(),
    };
    const service = new CronLogCleanupService(cronExecutionLogs as never);

    await service.cleanCronLogs();

    expect(cronExecutionLogs.deleteCreatedBefore).toHaveBeenCalledWith(expect.any(Date));
    expect(cronExecutionLogs.record).toHaveBeenCalledWith(
      expect.objectContaining({
        status: CronExecutionStatus.success,
        totalProcessed: 4,
        totalSuccess: 4,
      }),
    );
  });

  it('records a failed cleanup without crashing the scheduler', async () => {
    const error = new Error('database unavailable');
    const cronExecutionLogs = {
      deleteCreatedBefore: vi.fn().mockRejectedValue(error),
      record: vi.fn(),
    };
    const service = new CronLogCleanupService(cronExecutionLogs as never);

    await expect(service.cleanCronLogs()).resolves.toBeUndefined();
    expect(cronExecutionLogs.record).toHaveBeenCalledWith(
      expect.objectContaining({ error, status: CronExecutionStatus.error, totalError: 1 }),
    );
  });
});
