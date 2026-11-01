import type { AppOption, PaginatedBody, PaginateRequest } from '@contenster/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import { serializeApplicationDateTime } from '@/infrastructure/date-time';
import type { RequestLog } from '@/modules/core/observability/request-logs/entities/request-log.entity';
import { buildPaginationMeta } from '@/shared/pagination';
import { toResponseDto } from '@/shared/responses';

import { SystemAdminRequestLogDetailResponseDto } from './dto/res/system-admin-request-log-detail.response.dto';
import { SystemAdminRequestLogListItemResponseDto } from './dto/res/system-admin-request-log-list-item.response.dto';
import { RequestLogsRepository } from './request-logs.repository';

@Injectable()
export class RequestLogsService {
  constructor(
    private readonly repository: RequestLogsRepository,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  async list(
    request: PaginateRequest,
  ): Promise<PaginatedBody<SystemAdminRequestLogListItemResponseDto>> {
    const [logs, total] = await this.repository.list(request);

    return {
      items: toResponseDto(
        SystemAdminRequestLogListItemResponseDto,
        logs.map((log) => this.toItem(log)),
      ),
      meta: buildPaginationMeta(request, total),
    };
  }

  async listClientOptions(request: PaginateRequest): Promise<AppOption[]> {
    const [clients] = await this.repository.listClientOptions(request);

    return clients.map((client) => ({
      disabled: false,
      label: `${client.tradeName} (${client.document})${client.deletedAt ? ' — excluído' : ''}`,
      metadata: { isDeleted: Boolean(client.deletedAt) },
      value: client.id,
    }));
  }

  async get(id: number): Promise<SystemAdminRequestLogDetailResponseDto> {
    const log = await this.repository.find(id);

    if (!log) {
      throw new NotFoundException(this.i18n.t('errors.system_admin.request_log_not_found'));
    }

    return toResponseDto(SystemAdminRequestLogDetailResponseDto, {
      ...this.toItem(log),
      error: log.error,
      eventType: log.eventType,
      queryParams: log.queryParams,
      requestBody: log.requestBody,
      requestHeaders: log.requestHeaders,
      requestId: log.requestId,
      responseBody: log.responseBody,
      responseHeaders: log.responseHeaders,
      responseTimeDescription: log.responseTimeDescription,
      userAgent: log.userAgent,
    });
  }

  private toItem(log: RequestLog) {
    return {
      accessType: log.accessType,
      clientId: log.client?.id ?? null,
      clientName: log.client?.tradeName ?? null,
      createdAt: serializeApplicationDateTime(log.createdAt),
      id: log.id,
      ip: log.ip,
      level: log.level,
      method: log.method,
      responseTimeMs: log.responseTimeMs,
      route: log.route,
      statusCode: log.statusCode,
      userName: log.user?.name ?? null,
    };
  }
}
