'use server';

import {
  type AuthenticatedSession,
  type AvailableClientsResponse,
  type SessionResponse,
  type SignOutResponse,
  type SwitchClientRequest,
  type SynchronizeSessionResponse,
} from '@contenster/shared';
import type { Locale } from '@/i18n/routing';
import { API_ROUTES } from '@/routes';
import {
  apiInstance,
  clearSessionCookie,
  persistSessionCookie,
} from '@/services/api-instance.service';
import type { WebResponse } from '@/services/types';

const persistSession = async (
  response: WebResponse<SessionResponse>,
): Promise<WebResponse<SessionResponse>> => {
  if (!response.success || (await persistSessionCookie(response))) return response;

  return { ...response, body: null, statusCode: 500, success: false };
};

export const getSession = async (): Promise<AuthenticatedSession | null> => {
  const response = await apiInstance.get<AuthenticatedSession>(API_ROUTES.AUTH.GET_SESSION);

  if (response.success) return response.body;

  if (response.statusCode === 401 || response.statusCode === 403) return null;

  throw new Error(`Session API request failed with status ${response.statusCode}.`);
};

export const switchClient = async (
  request: SwitchClientRequest,
  locale: Locale,
): Promise<WebResponse<SessionResponse>> =>
  persistSession(
    await apiInstance.post(API_ROUTES.AUTH.POST_SWITCH_CLIENT, { body: request, locale }),
  );

export const switchClientAsSuperuser = async (
  request: SwitchClientRequest,
  locale: Locale,
): Promise<WebResponse<SessionResponse>> =>
  persistSession(
    await apiInstance.post(API_ROUTES.AUTH.POST_SWITCH_CLIENT_AS_SUPERUSER, {
      body: request,
      locale,
    }),
  );

export const switchGlobal = async (locale: Locale): Promise<WebResponse<SessionResponse>> =>
  persistSession(await apiInstance.post(API_ROUTES.AUTH.POST_SWITCH_GLOBAL, { locale }));

export const synchronizeSession = async (
  locale: Locale,
): Promise<WebResponse<SynchronizeSessionResponse>> =>
  apiInstance.post(API_ROUTES.AUTH.POST_SESSION_SYNC, { locale });

export const signOut = async (locale: Locale): Promise<WebResponse<SignOutResponse>> => {
  const response = await apiInstance.post<SignOutResponse>(API_ROUTES.AUTH.POST_SIGN_OUT, {
    locale,
  });

  await clearSessionCookie();

  return response;
};

export const getAvailableClients = async (
  locale: Locale,
): Promise<WebResponse<AvailableClientsResponse>> =>
  apiInstance.get<AvailableClientsResponse>(API_ROUTES.AUTH.GET_AVAILABLE_CLIENTS, { locale });
