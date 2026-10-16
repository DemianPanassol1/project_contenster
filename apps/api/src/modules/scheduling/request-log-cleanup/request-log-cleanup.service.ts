import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CronExecutionStatus, RequestLogLevel } from '@contenster/shared';
import { settings } from '@/infrastructure/config/app.config';
import { RequestLogRepository } from '@/modules/observability/request-logs/request-log.repository';

import { CronExecutionLogService } from '../cron-execution-log/cron-execution-log.service';

const daysAgo = (days: number): Date => new Date(Date.now() - days * 86_400_000);

@Injectable()
export class RequestLogCleanupService {
  constructor(
    private readonly requestLogRepository: RequestLogRepository,
    private readonly cronExecutionLogService: CronExecutionLogService,
  ) {}

  @Cron(settings.CRON_LOG_CLEANUP_CRON)
  async cleanRequestLogs(): Promise<void> {
    const startedAt = new Date();

    try {
      const totals = await Promise.all([
        this.requestLogRepository.deleteByLevelAndCreatedAt(
          RequestLogLevel.info,
          daysAgo(settings.REQUEST_LOG_RETENTION_INFO_DAYS),
        ),
        this.requestLogRepository.deleteByLevelAndCreatedAt(
          RequestLogLevel.warning,
          daysAgo(settings.REQUEST_LOG_RETENTION_WARNING_DAYS),
        ),
        this.requestLogRepository.deleteByLevelAndCreatedAt(
          RequestLogLevel.error,
          daysAgo(settings.REQUEST_LOG_RETENTION_ERROR_DAYS),
        ),
        this.requestLogRepository.deleteByLevelAndCreatedAt(
          RequestLogLevel.fatal,
          daysAgo(settings.REQUEST_LOG_RETENTION_FATAL_DAYS),
        ),
      ]);
      const removed = totals.reduce((total, count) => total + count, 0);

      this.cronExecutionLogService.record({
        message: 'Request log cleanup completed.',
        startedAt,
        status: CronExecutionStatus.success,
        taskName: 'request-log-cleanup',
        totalError: 0,
        totalProcessed: removed,
        totalSuccess: removed,
      });
    } catch (error) {
      this.cronExecutionLogService.record({
        error,
        message: 'Request log cleanup failed.',
        startedAt,
        status: CronExecutionStatus.error,
        taskName: 'request-log-cleanup',
        totalError: 1,
      });
    }
  }
}
