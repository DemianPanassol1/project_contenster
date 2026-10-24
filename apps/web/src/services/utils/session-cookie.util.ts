import type { ResponseCookie } from '@/services/types';

export const SESSION_COOKIE_NAME = 'contenster_session';

export const OPAQUE_SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{64}$/;

export const getSessionCookie = (responseCookies: ResponseCookie[]): ResponseCookie | null => {
  const sessionCookie = responseCookies.find((cookie) => cookie.name === SESSION_COOKIE_NAME);

  if (
    !sessionCookie ||
    !sessionCookie.httpOnly ||
    !OPAQUE_SESSION_TOKEN_PATTERN.test(sessionCookie.value)
  ) {
    return null;
  }

  return sessionCookie;
};
