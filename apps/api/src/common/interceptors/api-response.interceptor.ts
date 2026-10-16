import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

import type { ApiHttpRequest } from '@/common/types/http-context.type';
import { createApiResponse } from '@/shared/responses/api-response.helper';
import type { ApiResponse } from '@/shared/responses/api-response.types';

type HttpResponse = {
  statusCode: number;
};

const isApiResponse = <TData>(value: TData | ApiResponse<TData>): value is ApiResponse<TData> => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<ApiResponse>;

  return (
    typeof candidate.requestId === 'string' &&
    typeof candidate.statusCode === 'number' &&
    typeof candidate.status === 'string' &&
    'body' in candidate
  );
};

@Injectable()
export class ApiResponseInterceptor<TData> implements NestInterceptor<TData, ApiResponse<TData>> {
  intercept(context: ExecutionContext, next: CallHandler<TData>): Observable<ApiResponse<TData>> {
    const response = context.switchToHttp().getResponse<HttpResponse>();
    const request = context.switchToHttp().getRequest<ApiHttpRequest>();

    return next.handle().pipe(
      map((data) => {
        if (isApiResponse(data)) return data;

        return createApiResponse({
          statusCode: response.statusCode,
          request,
          data,
        });
      }),
    );
  }
}
