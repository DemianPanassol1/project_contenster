import { randomUUID } from 'node:crypto';
import { HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import type { ApiHttpRequest } from '@/common/types/http-context.type';
import { DEFAULT_API_LOCALE } from '@/i18n/i18n.config';
import { serializeApplicationDateTime } from '@/infrastructure/date-time';
import { millisecondsToString } from '@/shared/utils/duration.util';

import type { ApiError, ApiResponse } from './api-response.types';

type ApiResponseInput<TData> = {
  statusCode: number;
  request?: ApiHttpRequest;
  data?: TData | null;
  errors?: ApiError[];
};

export const createApiResponse = <TData = unknown>({
  statusCode,
  request,
  data = null,
  errors = [],
}: ApiResponseInput<TData>): ApiResponse<TData> => ({
  lang: I18nContext.current()?.lang ?? DEFAULT_API_LOCALE,
  requestId: request?.requestId ?? randomUUID(),
  statusCode,
  status: HttpStatus[statusCode] ?? 'UNKNOWN_STATUS',
  body: data,
  errors: {
    count: errors.length,
    items: errors,
  },
  datetime: serializeApplicationDateTime(new Date()),
  requestTime: millisecondsToString(Date.now() - (request?.requestStartedAt ?? Date.now())),
});
