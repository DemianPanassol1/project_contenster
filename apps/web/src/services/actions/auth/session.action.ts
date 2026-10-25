'use server';

import type {
  AuthenticatedSession,
  AvailableClientsResponse,
  SessionResponse,
  SignOutResponse,
  SwitchClientRequest,
  SynchronizeSessionResponse,
} from '@contenster/shared';

import type { Locale } from '@/i18n/routing';
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
  const response = await apiInstance.get<AuthenticatedSession>('auth/session');

  if (response.success) return response.body;

  if (response.statusCode === 401 || response.statusCode === 403) return null;

  throw new Error(`Session API request failed with status ${response.statusCode}.`);
};

export const switchClient = async (
  request: SwitchClientRequest,
  locale: Locale,
): Promise<WebResponse<SessionResponse>> =>
  persistSession(await apiInstance.post('auth/switch-client', { body: request, locale }));

export const switchClientAsSuperuser = async (
  request: SwitchClientRequest,
  locale: Locale,
): Promise<WebResponse<SessionResponse>> =>
  persistSession(
    await apiInstance.post('auth/switch-client-as-superuser', { body: request, locale }),
  );

export const switchGlobal = async (locale: Locale): Promise<WebResponse<SessionResponse>> =>
  persistSession(await apiInstance.post('auth/switch-global', { locale }));

export const synchronizeSession = async (): Promise<WebResponse<SynchronizeSessionResponse>> =>
  apiInstance.post('auth/session/sync');

export const signOut = async (locale: Locale): Promise<WebResponse<SignOutResponse>> => {
  const response = await apiInstance.post<SignOutResponse>('auth/sign-out', { locale });

  await clearSessionCookie();

  return response;
};

export const getAvailableClients = async (
  locale: Locale,
): Promise<WebResponse<AvailableClientsResponse>> =>
  apiInstance.get<AvailableClientsResponse>('auth/available-clients', { locale });
