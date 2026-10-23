import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CronExecutionStatus } from '@contenster/shared';
import { settings } from '@/infrastructure/config/app.config';
import { FileRepository } from '@/modules/media/files/file.repository';
import { StorageService } from '@/modules/media/storage/storage.service';
import { isPostgreSqlForeignKeyViolation } from '@/shared/database/postgres-error.helper';

import { CronExecutionLogService } from '../cron-execution-log/cron-execution-log.service';

@Injectable()
export class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name);

  constructor(
    private readonly fileRepository: FileRepository,
    private readonly cronExecutionLogService: CronExecutionLogService,
    private readonly storageService: StorageService,
  ) {}

  @Cron(settings.FILE_CLEANUP_CRON)
  async cleanUnusedFiles(): Promise<void> {
    const startedAt = new Date();
    const createdBefore = new Date(
      Date.now() - settings.FILE_CLEANUP_SAFETY_WINDOW_MINUTES * 60_000,
    );
    const candidates = await this.fileRepository.findCleanupCandidates(createdBefore);
    let removed = 0;
    let retained = 0;
    let failed = 0;

    for (const file of candidates) {
      try {
        await this.fileRepository.remove(file);
      } catch (error) {
        if (isPostgreSqlForeignKeyViolation(error)) {
          retained += 1;
          continue;
        }

        failed += 1;
        this.logger.error(`Failed to remove file metadata ${file.id}.`, error);
        continue;
      }

      try {
        await this.storageService.delete({
          filePath: file.filePath,
          storageConfiguration: file.storageConfiguration,
          storageKey: file.storageKey,
          storageProvider: file.storageProvider,
        });
        removed += 1;
      } catch (error) {
        failed += 1;
        this.logger.error(
          `Removed metadata but failed to delete storage object ${file.id}.`,
          error,
        );
      }
    }

    this.cronExecutionLogService.record({
      message: `Unused file cleanup completed. removed=${removed}; retained=${retained}; failed=${failed}.`,
      startedAt,
      status: failed > 0 ? CronExecutionStatus.partial : CronExecutionStatus.success,
      taskName: 'file-cleanup',
      totalError: failed,
      totalProcessed: candidates.length,
      totalSuccess: removed + retained,
    });
  }
}
