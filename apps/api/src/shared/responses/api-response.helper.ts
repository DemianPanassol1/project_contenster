import { randomUUID } from 'node:crypto';
import { HttpStatus } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

import type { ApiHttpRequest } from '@/common/types/http-context.type';
import { DEFAULT_API_LOCALE } from '@/i18n/i18n.config';

import type { ApiError, ApiResponse } from './api-response.types';

type ApiResponseInput<TData> = {
  statusCode: number;
  request?: ApiHttpRequest;
  data?: TData | null;
  errors?: ApiError[];
};

const millisecondsToString = (durationMs: number): string => {
  if (durationMs < 1000) return `${durationMs}ms`;
  if (durationMs < 60_000) return `${(durationMs / 1000).toFixed(2)}s`;

  const minutes = Math.floor(durationMs / 60_000);
  const seconds = Math.floor((durationMs % 60_000) / 1000);

  return `${minutes}m${seconds}s`;
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
  datetime: new Date().toISOString(),
  requestTime: millisecondsToString(Date.now() - (request?.requestStartedAt ?? Date.now())),
});
