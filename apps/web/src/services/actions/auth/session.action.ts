'use server';

import type {
  AuthenticatedSession,
  SessionResponse,
  SignOutResponse,
  SwitchClientRequest,
  SynchronizeSessionResponse,
} from '@contenster/shared';

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
): Promise<WebResponse<SessionResponse>> =>
  persistSession(await apiInstance.post('auth/switch-client', { body: request }));

export const switchClientAsSuperuser = async (
  request: SwitchClientRequest,
): Promise<WebResponse<SessionResponse>> =>
  persistSession(await apiInstance.post('auth/switch-client-as-superuser', { body: request }));

export const switchGlobal = async (): Promise<WebResponse<SessionResponse>> =>
  persistSession(await apiInstance.post('auth/switch-global'));

export const synchronizeSession = async (): Promise<WebResponse<SynchronizeSessionResponse>> =>
  apiInstance.post('auth/session/sync');

export const signOut = async (): Promise<WebResponse<SignOutResponse>> => {
  const response = await apiInstance.post<SignOutResponse>('auth/sign-out');

  await clearSessionCookie();

  return response;
};
