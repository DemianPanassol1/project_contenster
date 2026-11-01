import { QueryFailedError } from 'typeorm';
import { describe, expect, it, vi } from 'vitest';

import { CronExecutionStatus } from '@contenster/shared';

import { FileCleanupService } from './file-cleanup.service';

describe('FileCleanupService', () => {
  it('retains referenced files and removes unreferenced storage objects', async () => {
    const retainedError = new QueryFailedError(
      'DELETE',
      [],
      Object.assign(new Error('still referenced'), { code: '23503' }),
    );
    const firstFile = {
      filePath: 'first',
      id: 1,
      storageConfiguration: {},
      storageKey: 'first',
      storageProvider: 'local',
    };
    const secondFile = {
      filePath: 'second',
      id: 2,
      storageConfiguration: {},
      storageKey: 'second',
      storageProvider: 'local',
    };
    const filesRepository = {
      findCleanupCandidates: vi.fn().mockResolvedValue([firstFile, secondFile]),
      remove: vi.fn().mockRejectedValueOnce(retainedError).mockResolvedValueOnce(undefined),
    };
    const cronExecutionLogs = { record: vi.fn() };
    const storageService = { delete: vi.fn().mockResolvedValue(undefined) };
    const service = new FileCleanupService(
      filesRepository as never,
      cronExecutionLogs as never,
      storageService as never,
    );

    await service.cleanUnusedFiles();

    expect(storageService.delete).toHaveBeenCalledTimes(1);
    expect(storageService.delete).toHaveBeenCalledWith(
      expect.objectContaining({ filePath: 'second', storageKey: 'second' }),
    );
    expect(cronExecutionLogs.record).toHaveBeenCalledWith(
      expect.objectContaining({
        status: CronExecutionStatus.success,
        totalError: 0,
        totalProcessed: 2,
        totalSuccess: 2,
      }),
    );
  });
});
