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
import { API_ROUTES } from '@/routes';
import { apiInstance, persistSessionCookie } from '@/services/api-instance.service';
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
  apiInstance.post(API_ROUTES.AUTH.POST_AUTHORIZE, {
    authentication: 'none',
    body: request,
    locale,
  });

export const signIn = async (
  request: SignInRequest,
  locale: Locale,
): Promise<WebResponse<SessionResponse>> =>
  toSessionActionResponse(
    await apiInstance.post(API_ROUTES.AUTH.POST_SIGN_IN, {
      authentication: 'none',
      body: request,
      locale,
    }),
  );

export const signInGlobal = async (
  request: SignInGlobalRequest,
  locale: Locale,
): Promise<WebResponse<SessionResponse>> =>
  toSessionActionResponse(
    await apiInstance.post(API_ROUTES.AUTH.POST_SIGN_IN_GLOBAL, {
      authentication: 'none',
      body: request,
      locale,
    }),
  );

export const forgotPassword = async (
  request: ForgotPasswordRequest,
  locale: Locale,
): Promise<WebResponse<ForgotPasswordResponse>> =>
  apiInstance.post(API_ROUTES.AUTH.POST_FORGOT_PASSWORD, {
    authentication: 'none',
    body: request,
    locale,
  });

export const resetPassword = async (
  request: ResetPasswordRequest,
  locale: Locale,
): Promise<WebResponse<ResetPasswordResponse>> =>
  apiInstance.post(API_ROUTES.AUTH.POST_RESET_PASSWORD, {
    authentication: 'none',
    body: request,
    locale,
  });

export const changeCurrentUserPassword = async (
  request: ChangeCurrentUserPasswordRequest,
  locale: Locale,
): Promise<WebResponse<ChangeCurrentUserPasswordResponse>> =>
  apiInstance.post<ChangeCurrentUserPasswordResponse>(API_ROUTES.ADMIN.POST_CURRENT_USER_PASSWORD, {
    body: request,
    locale,
  });
