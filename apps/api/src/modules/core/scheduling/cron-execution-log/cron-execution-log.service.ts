import { Injectable, Logger } from '@nestjs/common';

import { CronExecutionStatus } from '@contenster/shared';
import { sanitizeLogPayload } from '@/shared/utils/logger-redaction.util';

import { CronExecutionLogRepository } from './cron-execution-log.repository';

export interface RecordCronExecutionInput {
  error?: unknown;
  message?: string | null;
  startedAt: Date;
  status: CronExecutionStatus;
  taskName: string;
  totalError?: number | null;
  totalProcessed?: number | null;
  totalSuccess?: number | null;
}

@Injectable()
export class CronExecutionLogService {
  private readonly logger = new Logger(CronExecutionLogService.name);

  constructor(private readonly repository: CronExecutionLogRepository) {}

  record(input: RecordCronExecutionInput): void {
    void this.recordAsync(input);
  }

  deleteCreatedBefore(createdBefore: Date): Promise<number> {
    return this.repository.deleteCreatedBefore(createdBefore);
  }

  private async recordAsync(input: RecordCronExecutionInput): Promise<void> {
    const finishedAt = new Date();

    try {
      await this.repository.save({
        durationMs: finishedAt.getTime() - input.startedAt.getTime(),
        error: sanitizeLogPayload(input.error) ?? null,
        finishedAt,
        message: input.message ?? null,
        startedAt: input.startedAt,
        status: input.status,
        taskName: input.taskName,
        totalError: input.totalError ?? null,
        totalProcessed: input.totalProcessed ?? null,
        totalSuccess: input.totalSuccess ?? null,
      });
    } catch (error) {
      this.logger.error(
        'Failed to persist cron execution log.',
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
