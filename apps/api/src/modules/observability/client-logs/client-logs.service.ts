import type { PaginatedBody } from '@contenster/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import type { PaginateRequestDto } from '@/shared/dtos';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';

import { CronExecutionLogDetailResponseDto } from './dto/res/cron-execution-log-detail.response.dto';
import { CronExecutionLogListItemResponseDto } from './dto/res/cron-execution-log-list-item.response.dto';
import { RequestLogDetailResponseDto } from './dto/res/request-log-detail.response.dto';
import { RequestLogListItemResponseDto } from './dto/res/request-log-list-item.response.dto';
import { ClientLogsRepository } from './client-logs.repository';

@Injectable()
export class ClientLogsService {
  constructor(
    private readonly repository: ClientLogsRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async listRequestLogs(
    clientId: number,
    request: PaginateRequestDto,
  ): Promise<PaginatedBody<RequestLogListItemResponseDto>> {
    const [logs, total] = await this.repository.listRequestLogs(clientId, request);

    return {
      items: toResponseDto(
        RequestLogListItemResponseDto,
        logs.map((log) => ({
          clientId: log.client?.id ?? null,
          createdAt: log.createdAt.toISOString(),
          id: log.id,
          ip: log.ip,
          level: log.level,
          method: log.method,
          responseTimeMs: log.responseTimeMs,
          route: log.route,
          statusCode: log.statusCode,
          userName: log.user?.name ?? null,
        })),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async listRoutineLogs(
    request: PaginateRequestDto,
  ): Promise<PaginatedBody<CronExecutionLogListItemResponseDto>> {
    const [logs, total] = await this.repository.listRoutineLogs(request);

    return {
      items: toResponseDto(
        CronExecutionLogListItemResponseDto,
        logs.map((log) => ({
          createdAt: log.createdAt.toISOString(),
          durationMs: log.durationMs,
          id: log.id,
          message: log.message,
          status: log.status,
          taskName: log.taskName,
          totalError: log.totalError,
          totalProcessed: log.totalProcessed,
          totalSuccess: log.totalSuccess,
        })),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async getRequestLog(clientId: number, id: number): Promise<RequestLogDetailResponseDto> {
    const log = await this.repository.findRequestLog(clientId, id);

    if (!log) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return toResponseDto(RequestLogDetailResponseDto, {
      clientId: log.client?.id ?? null,
      createdAt: log.createdAt.toISOString(),
      error: log.error,
      eventType: log.eventType,
      id: log.id,
      ip: log.ip,
      level: log.level,
      method: log.method,
      queryParams: log.queryParams,
      requestBody: log.requestBody,
      requestHeaders: log.requestHeaders,
      requestId: log.requestId,
      responseBody: log.responseBody,
      responseHeaders: log.responseHeaders,
      responseTimeDescription: log.responseTimeDescription,
      responseTimeMs: log.responseTimeMs,
      route: log.route,
      statusCode: log.statusCode,
      userAgent: log.userAgent,
      userName: log.user?.name ?? null,
    });
  }

  async getRoutineLog(id: number): Promise<CronExecutionLogDetailResponseDto> {
    const log = await this.repository.findRoutineLog(id);

    if (!log) {
      throw new NotFoundException(this.i18n.t('errors.common.record_not_found'));
    }

    return toResponseDto(CronExecutionLogDetailResponseDto, {
      createdAt: log.createdAt.toISOString(),
      durationMs: log.durationMs,
      error: log.error,
      finishedAt: log.finishedAt?.toISOString() ?? null,
      id: log.id,
      message: log.message,
      startedAt: log.startedAt.toISOString(),
      status: log.status,
      taskName: log.taskName,
      totalError: log.totalError,
      totalProcessed: log.totalProcessed,
      totalSuccess: log.totalSuccess,
    });
  }
}
