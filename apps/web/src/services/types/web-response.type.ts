import type { ApiError } from '@contenster/shared';

import type { Locale } from '@/i18n/routing';

export type HttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

export type WebError = ApiError & {
  errorType: string | null;
  id: string;
};

export interface ResponseCookie {
  expiresAt: string | null;
  httpOnly: boolean;
  maxAge: number | null;
  name: string;
  path: string | null;
  sameSite: 'lax' | 'none' | 'strict' | null;
  secure: boolean;
  value: string;
}

export interface WebResponse<TBody = unknown> {
  body: TBody | null;
  errors: WebError[];
  responseCookies: ResponseCookie[];
  statusCode: number;
  success: boolean;
}

export interface FetchOptions {
  authentication?: 'none' | 'session';
  body?: FormData | Record<string, unknown>;
  cache?: RequestCache;
  headers?: HeadersInit;
  locale?: Locale;
  revalidate?: false | number;
}
