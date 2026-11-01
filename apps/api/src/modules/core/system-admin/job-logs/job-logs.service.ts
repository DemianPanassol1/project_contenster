import type { CronExecutionLogListItem, PaginatedBody, PaginateRequest } from '@contenster/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import { serializeApplicationDateTime } from '@/infrastructure/date-time';
import type { CronExecutionLog } from '@/modules/core/scheduling/cron-execution-log/entities/cron-execution-log.entity';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';

import { SystemAdminJobLogDetailResponseDto } from './dto/res/system-admin-job-log-detail.response.dto';
import { SystemAdminJobLogListItemResponseDto } from './dto/res/system-admin-job-log-list-item.response.dto';
import { JobLogsRepository } from './job-logs.repository';

@Injectable()
export class JobLogsService {
  constructor(
    private readonly repository: JobLogsRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async list(
    request: PaginateRequest,
  ): Promise<PaginatedBody<SystemAdminJobLogListItemResponseDto>> {
    const [logs, total] = await this.repository.list(request);

    return {
      items: toResponseDto(
        SystemAdminJobLogListItemResponseDto,
        logs.map((log) => this.toItem(log)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async get(id: number): Promise<SystemAdminJobLogDetailResponseDto> {
    const log = await this.repository.find(id);

    if (!log) {
      throw new NotFoundException(this.i18n.t('errors.system_admin.job_log_not_found'));
    }

    return toResponseDto(SystemAdminJobLogDetailResponseDto, {
      ...this.toItem(log),
      error: log.error,
      finishedAt: log.finishedAt ? serializeApplicationDateTime(log.finishedAt) : null,
      startedAt: serializeApplicationDateTime(log.startedAt),
    });
  }

  private toItem(log: CronExecutionLog): CronExecutionLogListItem {
    return {
      createdAt: serializeApplicationDateTime(log.createdAt),
      durationMs: log.durationMs,
      id: log.id,
      message: log.message,
      status: log.status,
      taskName: log.taskName,
      totalError: log.totalError,
      totalProcessed: log.totalProcessed,
      totalSuccess: log.totalSuccess,
    };
  }
}
