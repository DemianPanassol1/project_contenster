import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { I18nContext, I18nValidationException } from 'nestjs-i18n';

import type { ApiHttpRequest, ApiHttpResponse } from '@/common/types/http-context.type';
import type { HttpExceptionResponse } from '@/common/types/http-exception-response.type';
import type { I18nTranslations } from '@/i18n/translations';
import { settings } from '@/infrastructure/config/app.config';
import { RequestLogService } from '@/modules/observability/request-logs/request-log.service';
import { createApiResponse } from '@/shared/responses/api-response.helper';
import type { ApiError } from '@/shared/responses/api-response.types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly requestLogService: RequestLogService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<ApiHttpRequest>();
    const response = context.getResponse<ApiHttpResponse>();
    const statusCode = this.getStatusCode(exception);
    const errors = this.getErrors(exception);

    this.logException(exception, request, statusCode);
    const payload = createApiResponse({
      statusCode,
      request,
      data: null,
      errors,
    });

    if (!request.skipRequestLog) {
      this.requestLogService.recordError(
        request,
        response,
        payload,
        exception,
        request.requestStartedAt ?? Date.now(),
        statusCode,
      );
    }

    response.status(statusCode).json(payload);
  }

  private getStatusCode(exception: unknown): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrors(exception: unknown): ApiError[] {
    if (!(exception instanceof HttpException)) return [this.createUnexpectedError(exception)];

    if (exception instanceof I18nValidationException) {
      const validationErrors = this.getValidationErrors(exception.errors);

      return validationErrors.length > 0
        ? validationErrors
        : [{ message: exception.message, code: exception.name }];
    }

    const response = exception.getResponse();

    if (typeof response === 'string') return [{ message: response, code: exception.name }];

    const exceptionResponse = response as HttpExceptionResponse;
    const messages = Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message
      : [exceptionResponse.message ?? exception.message];

    return messages.map((message) => ({
      message,
      code: exceptionResponse.error ?? exception.name,
    }));
  }

  private getValidationErrors(errors: ValidationError[], parentField?: string): ApiError[] {
    return errors.flatMap((error) => {
      const field = parentField ? `${parentField}.${error.property}` : error.property;
      const constraints = Object.entries(error.constraints ?? {}).map(([code, message]) => ({
        field,
        message,
        code,
      }));

      return [...constraints, ...this.getValidationErrors(error.children ?? [], field)];
    });
  }

  private createUnexpectedError(exception: unknown): ApiError {
    const i18n = I18nContext.current<I18nTranslations>();

    if (settings.NODE_ENV !== 'production' && exception instanceof Error) {
      return { message: exception.message, code: exception.name };
    }

    return {
      message: i18n?.t('errors.common.internal_server_error') ?? 'Internal server error.',
      code: 'InternalServerError',
    };
  }

  private logException(exception: unknown, request: ApiHttpRequest, statusCode: number): void {
    const payload = {
      method: request.method,
      path: request.url,
      requestId: request.requestId,
      statusCode,
    };

    if (exception instanceof Error) {
      this.logger.error({ ...payload, message: exception.message }, exception.stack);
      return;
    }

    this.logger.error(payload);
  }
}
