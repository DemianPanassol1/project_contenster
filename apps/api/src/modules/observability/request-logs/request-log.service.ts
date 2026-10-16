import { Injectable, Logger } from '@nestjs/common';
import type { DeepPartial } from 'typeorm';

import { RequestLogLevel } from '@contenster/shared';
import type { ApiHttpRequest, ApiHttpResponse } from '@/common/types/http-context.type';
import { millisecondsToString } from '@/shared/utils/duration.util';
import { sanitizeLogPayload } from '@/shared/utils/logger-redaction.util';

import { RequestLog } from './entities/request-log.entity';
import {
  createSessionSnapshot,
  getResponseRequestId,
  getUserAgent,
} from './helpers/request-log.helper';
import { RequestLogRepository } from './request-log.repository';

@Injectable()
export class RequestLogService {
  private readonly logger = new Logger(RequestLogService.name);

  constructor(private readonly repository: RequestLogRepository) {}

  recordSuccess(
    request: ApiHttpRequest,
    response: ApiHttpResponse,
    body: unknown,
    startedAt: number,
  ): void {
    this.record(RequestLogLevel.info, request, response, body, startedAt, response.statusCode);
  }

  recordError(
    request: ApiHttpRequest,
    response: ApiHttpResponse,
    body: unknown,
    error: unknown,
    startedAt: number,
    statusCode: number,
  ): void {
    const level = statusCode >= 500 ? RequestLogLevel.error : RequestLogLevel.warning;

    this.record(level, request, response, body, startedAt, statusCode, error);
  }

  private record(
    level: RequestLogLevel,
    request: ApiHttpRequest,
    response: ApiHttpResponse,
    body: unknown,
    startedAt: number,
    statusCode: number,
    error?: unknown,
  ): void {
    const responseTimeMs = Date.now() - startedAt;
    const session = createSessionSnapshot(request);
    const log: DeepPartial<RequestLog> = {
      client: session.clientId ? { id: session.clientId } : null,
      error: sanitizeLogPayload(error) ?? null,
      eventType: session.eventType,
      ip: request.ip ?? null,
      level,
      method: request.method,
      queryParams: sanitizeLogPayload(request.query) ?? null,
      requestBody: sanitizeLogPayload(request.body) ?? null,
      requestHeaders: sanitizeLogPayload(request.headers) ?? null,
      requestId: getResponseRequestId(body) ?? request.requestId ?? 'unknown',
      responseBody: sanitizeLogPayload(body) ?? null,
      responseHeaders: sanitizeLogPayload(response.getHeaders()) ?? null,
      responseTimeDescription: millisecondsToString(responseTimeMs),
      responseTimeMs,
      route: request.originalUrl ?? request.url,
      statusCode,
      user: session.userId ? { id: session.userId } : null,
      userAgent: getUserAgent(request),
    };

    void this.repository.save(log).catch((saveError: unknown) => {
      this.logger.error(
        'Failed to persist request log.',
        saveError instanceof Error ? saveError.stack : undefined,
      );
    });
  }
}
