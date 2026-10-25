'use server';

import type { FetchOptions, HttpMethod } from '@/services/types';

import { type ApiRequestActionResponse, requestApi } from './api-request.action';

interface ContentRequest {
  body?: FetchOptions['body'];
  endpoint: string;
  method: HttpMethod;
}

export const requestContent = async <TBody = unknown>(
  request: ContentRequest,
): Promise<ApiRequestActionResponse<TBody>> => requestApi<TBody>(request);
