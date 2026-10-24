import 'server-only';

import type { ApiResponse } from '@contenster/shared';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';

import { webEnv } from '@/core/config';
import { isLocale } from '@/i18n/routing';
import type {
  FetchOptions,
  HttpMethod,
  ResponseCookie,
  WebError,
  WebResponse,
} from '@/services/types';
import {
  getSessionCookie,
  OPAQUE_SESSION_TOKEN_PATTERN,
  SESSION_COOKIE_NAME,
} from '@/services/utils';

type ApiRequestInit = RequestInit & {
  next?: {
    revalidate: number;
  };
};

type HeadersWithSetCookie = Headers & {
  getSetCookie?: () => string[];
};

const defaultOptions: Required<Pick<FetchOptions, 'authentication' | 'cache' | 'revalidate'>> = {
  authentication: 'session',
  cache: 'no-store',
  revalidate: false,
};

const isApiResponse = <TBody>(value: unknown): value is ApiResponse<TBody> => {
  if (typeof value !== 'object' || value === null || !('body' in value) || !('errors' in value)) {
    return false;
  }

  const errors = value.errors;

  return (
    typeof errors === 'object' &&
    errors !== null &&
    'items' in errors &&
    Array.isArray(errors.items)
  );
};

const toError = (errorType: string, message: string): WebError => ({
  code: errorType,
  errorType,
  id: crypto.randomUUID(),
  message,
});

const getResponseCookies = (headers: Headers): ResponseCookie[] => {
  const setCookieHeaders = (headers as HeadersWithSetCookie).getSetCookie?.() ?? [];
  const rawCookies = setCookieHeaders.length > 0 ? setCookieHeaders : [headers.get('set-cookie')];

  return rawCookies.flatMap((rawCookie) => {
    if (!rawCookie) {
      return [];
    }

    const [pair, ...attributes] = rawCookie.split(';');
    const separatorIndex = pair.indexOf('=');

    if (separatorIndex <= 0) {
      return [];
    }

    const normalizedAttributes = new Map(
      attributes.map((attribute) => {
        const [name, ...value] = attribute.trim().split('=');

        return [name.toLowerCase(), value.join('=').trim()];
      }),
    );

    const maxAge = Number(normalizedAttributes.get('max-age'));
    const expires = normalizedAttributes.get('expires');
    const expiresAt = expires && Number.isFinite(new Date(expires).getTime()) ? expires : null;
    const sameSiteValue = normalizedAttributes.get('samesite')?.toLowerCase();
    const sameSite =
      sameSiteValue === 'lax' || sameSiteValue === 'none' || sameSiteValue === 'strict'
        ? sameSiteValue
        : null;

    return [
      {
        expiresAt,
        httpOnly: normalizedAttributes.has('httponly'),
        maxAge: Number.isFinite(maxAge) ? maxAge : null,
        name: pair.slice(0, separatorIndex).trim(),
        path: normalizedAttributes.get('path') || null,
        sameSite,
        secure: normalizedAttributes.has('secure'),
        value: pair.slice(separatorIndex + 1).trim(),
      },
    ];
  });
};

const getSessionToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  return token && OPAQUE_SESSION_TOKEN_PATTERN.test(token) ? token : null;
};

const getRequestLocale = async (requestedLocale?: FetchOptions['locale']): Promise<string> => {
  if (requestedLocale) {
    return requestedLocale;
  }

  const locale = await getLocale();

  return isLocale(locale) ? locale : 'pt';
};

const normalizeEndpoint = (endpoint: string): string =>
  endpoint.split('/').filter(Boolean).join('/');

const createRequestHeaders = async (options: FetchOptions): Promise<Headers> => {
  const headers = new Headers(options.headers);

  headers.delete('Authorization');
  headers.delete('Cookie');
  headers.delete('x-lang');
  headers.set('Accept', 'application/json');
  headers.set('x-lang', await getRequestLocale(options.locale));

  if (options.authentication !== 'none') {
    const token = await getSessionToken();

    if (token) {
      headers.set('Cookie', `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`);
    }
  }

  if (options.body instanceof FormData) {
    headers.delete('Content-Type');
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
};

async function request<TBody = Record<string, unknown>>(
  method: HttpMethod,
  endpoint: string,
  options: FetchOptions = {},
): Promise<WebResponse<TBody>> {
  const resolvedOptions = { ...defaultOptions, ...options };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), webEnv.apiTimeoutMs);
  const body = resolvedOptions.body;
  const headers = await createRequestHeaders(resolvedOptions);
  const url = `${webEnv.apiUrl}/${normalizeEndpoint(endpoint)}`;

  try {
    const response = await fetch(url, {
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
      cache: resolvedOptions.cache,
      headers,
      method,
      next:
        resolvedOptions.revalidate === false
          ? undefined
          : { revalidate: resolvedOptions.revalidate },
      signal: controller.signal,
    } satisfies ApiRequestInit);

    const responseCookies = getResponseCookies(response.headers);
    const payload: unknown = await response.json().catch(() => null);

    if (!isApiResponse<TBody>(payload)) {
      return {
        body: null,
        errors: [toError('InvalidApiResponse', 'The API returned an invalid JSON response.')],
        responseCookies,
        statusCode: response.status,
        success: false,
      };
    }

    return {
      body: payload.body,
      errors: payload.errors.items.map((error) => ({
        ...error,
        errorType: null,
        id: crypto.randomUUID(),
      })),
      responseCookies,
      statusCode: response.status,
      success: response.ok,
    };
  } catch (error: unknown) {
    const isAbortError = error instanceof Error && error.name === 'AbortError';
    const isNetworkError = error instanceof TypeError;

    return {
      body: null,
      errors: [
        toError(
          isAbortError ? 'TimeoutError' : isNetworkError ? 'NetworkError' : 'UnknownError',
          error instanceof Error ? error.message : 'Unknown error.',
        ),
      ],
      responseCookies: [],
      statusCode: 0,
      success: false,
    };
  } finally {
    clearTimeout(timeout);
  }
}

const withMethod = <TBody>(
  method: HttpMethod,
  endpoint: string,
  options?: FetchOptions,
): Promise<WebResponse<TBody>> => request<TBody>(method, endpoint, options);

export async function persistSessionCookie(
  response: Pick<WebResponse<unknown>, 'responseCookies'>,
): Promise<boolean> {
  const sessionCookie = getSessionCookie(response.responseCookies);

  if (!sessionCookie) {
    return false;
  }

  const cookieStore = await cookies();

  cookieStore.set({
    ...(sessionCookie.expiresAt && { expires: new Date(sessionCookie.expiresAt) }),
    ...(sessionCookie.maxAge !== null && { maxAge: sessionCookie.maxAge }),
    httpOnly: true,
    name: sessionCookie.name,
    path: sessionCookie.path ?? '/',
    sameSite: sessionCookie.sameSite ?? 'lax',
    secure: sessionCookie.secure,
    value: sessionCookie.value,
  });

  return true;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    maxAge: 0,
    name: SESSION_COOKIE_NAME,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    value: '',
  });
}

export const apiInstance = {
  delete: <TBody = Record<string, unknown>>(endpoint: string, options?: FetchOptions) =>
    withMethod<TBody>('DELETE', endpoint, options),
  get: <TBody = Record<string, unknown>>(endpoint: string, options?: FetchOptions) =>
    withMethod<TBody>('GET', endpoint, options),
  patch: <TBody = Record<string, unknown>>(endpoint: string, options?: FetchOptions) =>
    withMethod<TBody>('PATCH', endpoint, options),
  post: <TBody = Record<string, unknown>>(endpoint: string, options?: FetchOptions) =>
    withMethod<TBody>('POST', endpoint, options),
  put: <TBody = Record<string, unknown>>(endpoint: string, options?: FetchOptions) =>
    withMethod<TBody>('PUT', endpoint, options),
};
