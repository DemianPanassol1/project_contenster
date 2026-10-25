'use server';

import type {
  AuthorizeRequest,
  AuthorizeResponse,
  ChangeCurrentUserPasswordRequest,
  ChangeCurrentUserPasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SessionResponse,
  SignInGlobalRequest,
  SignInRequest,
} from '@contenster/shared';

import type { Locale } from '@/i18n/routing';
import {
  apiInstance,
  clearSessionCookie,
  persistSessionCookie,
} from '@/services/api-instance.service';
import type { WebResponse } from '@/services/types';

const toSessionActionResponse = async (
  response: WebResponse<SessionResponse>,
): Promise<WebResponse<SessionResponse>> => {
  if (!response.success) return response;

  if (await persistSessionCookie(response)) return response;

  return {
    body: null,
    errors: [
      {
        code: 'session_cookie_persistence_failed',
        errorType: 'SessionCookiePersistenceFailed',
        id: crypto.randomUUID(),
        message: 'Unable to persist the authenticated session.',
      },
    ],
    responseCookies: [],
    statusCode: 500,
    success: false,
  };
};

export const authorize = async (
  request: AuthorizeRequest,
  locale: Locale,
): Promise<WebResponse<AuthorizeResponse>> =>
  apiInstance.post('auth/authorize', { authentication: 'none', body: request, locale });

export const signIn = async (
  request: SignInRequest,
  locale: Locale,
): Promise<WebResponse<SessionResponse>> =>
  toSessionActionResponse(
    await apiInstance.post('auth/sign-in', { authentication: 'none', body: request, locale }),
  );

export const signInGlobal = async (
  request: SignInGlobalRequest,
  locale: Locale,
): Promise<WebResponse<SessionResponse>> =>
  toSessionActionResponse(
    await apiInstance.post('auth/sign-in-global', {
      authentication: 'none',
      body: request,
      locale,
    }),
  );

export const forgotPassword = async (
  request: ForgotPasswordRequest,
  locale: Locale,
): Promise<WebResponse<ForgotPasswordResponse>> =>
  apiInstance.post('auth/forgot-password', { authentication: 'none', body: request, locale });

export const resetPassword = async (
  request: ResetPasswordRequest,
  locale: Locale,
): Promise<WebResponse<ResetPasswordResponse>> =>
  apiInstance.post('auth/reset-password', { authentication: 'none', body: request, locale });

export const changeCurrentUserPassword = async (
  request: ChangeCurrentUserPasswordRequest,
): Promise<WebResponse<ChangeCurrentUserPasswordResponse>> => {
  const response = await apiInstance.post<ChangeCurrentUserPasswordResponse>('users/me/password', {
    body: request,
  });

  if (response.success) {
    await clearSessionCookie();
  }

  return response;
};
