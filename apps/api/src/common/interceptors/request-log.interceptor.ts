import { randomUUID } from 'node:crypto';
import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Observable, tap } from 'rxjs';

import { SKIP_REQUEST_LOG_METADATA_KEY } from '@/common/decorators/skip-request-log.decorator';
import type { ApiHttpRequest, ApiHttpResponse } from '@/common/types/http-context.type';
import { RequestLogService } from '@/modules/observability/request-logs/request-log.service';

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  constructor(
    private readonly requestLogService: RequestLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<ApiHttpRequest>();
    const response = context.switchToHttp().getResponse<ApiHttpResponse>();
    const startedAt = Date.now();
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_REQUEST_LOG_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    request.requestId = randomUUID();
    request.requestStartedAt = startedAt;
    request.skipRequestLog = skip === true;

    if (request.skipRequestLog) return next.handle();

    return next
      .handle()
      .pipe(
        tap((body) => this.requestLogService.recordSuccess(request, response, body, startedAt)),
      );
  }
}
