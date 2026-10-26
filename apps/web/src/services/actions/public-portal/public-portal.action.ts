'use server';

import type { ResolvedPublicPortal } from '@contenster/shared';
import { headers } from 'next/headers';

import { API_ROUTES } from '@/routes';
import { apiInstance } from '@/services/api-instance.service';

export const getPublicPortal = async (): Promise<ResolvedPublicPortal> => {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host');
  const response = await apiInstance.get<ResolvedPublicPortal>(API_ROUTES.PUBLIC.GET_PORTAL, {
    authentication: 'none',
    headers: host ? { 'x-forwarded-host': host } : undefined,
  });

  if (response.success && response.body) return response.body;

  throw new Error(`Public portal API request failed with status ${response.statusCode}.`);
};
