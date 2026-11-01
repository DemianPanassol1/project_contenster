import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CronExecutionStatus } from '@contenster/shared';
import { settings } from '@/infrastructure/config/app.config';

import { CronExecutionLogService } from '../cron-execution-log/cron-execution-log.service';

@Injectable()
export class CronLogCleanupService {
  constructor(private readonly cronExecutionLogService: CronExecutionLogService) {}

  @Cron(settings.CRON_LOG_CLEANUP_CRON)
  async cleanCronLogs(): Promise<void> {
    const startedAt = new Date();
    const retentionDate = new Date(Date.now() - settings.CRON_LOG_RETENTION_DAYS * 86_400_000);

    try {
      const removed = await this.cronExecutionLogService.deleteCreatedBefore(retentionDate);
      this.cronExecutionLogService.record({
        message: 'Cron execution log cleanup completed.',
        startedAt,
        status: CronExecutionStatus.success,
        taskName: 'cron-log-cleanup',
        totalError: 0,
        totalProcessed: removed,
        totalSuccess: removed,
      });
    } catch (error) {
      this.cronExecutionLogService.record({
        error,
        message: 'Cron execution log cleanup failed.',
        startedAt,
        status: CronExecutionStatus.error,
        taskName: 'cron-log-cleanup',
        totalError: 1,
      });
    }
  }
}
