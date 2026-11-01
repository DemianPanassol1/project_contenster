import { describe, expect, it, vi } from 'vitest';

import { CronExecutionStatus, RequestLogLevel } from '@contenster/shared';

import { RequestLogCleanupService } from './request-log-cleanup.service';

describe('RequestLogCleanupService', () => {
  it('records the aggregate result of each log-level cleanup', async () => {
    const repository = {
      deleteByLevelAndCreatedAt: vi
        .fn()
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(7),
    };
    const cronExecutionLogs = { record: vi.fn() };
    const service = new RequestLogCleanupService(repository as never, cronExecutionLogs as never);

    await service.cleanRequestLogs();

    expect(repository.deleteByLevelAndCreatedAt).toHaveBeenCalledTimes(4);
    expect(repository.deleteByLevelAndCreatedAt).toHaveBeenCalledWith(
      RequestLogLevel.info,
      expect.any(Date),
    );
    expect(cronExecutionLogs.record).toHaveBeenCalledWith(
      expect.objectContaining({
        status: CronExecutionStatus.success,
        totalProcessed: 17,
        totalSuccess: 17,
      }),
    );
  });

  it('records a failed execution without propagating the cleanup error', async () => {
    const failure = new Error('database unavailable');
    const repository = { deleteByLevelAndCreatedAt: vi.fn().mockRejectedValue(failure) };
    const cronExecutionLogs = { record: vi.fn() };
    const service = new RequestLogCleanupService(repository as never, cronExecutionLogs as never);

    await expect(service.cleanRequestLogs()).resolves.toBeUndefined();
    expect(cronExecutionLogs.record).toHaveBeenCalledWith(
      expect.objectContaining({
        error: failure,
        status: CronExecutionStatus.error,
        totalError: 1,
      }),
    );
  });
});
