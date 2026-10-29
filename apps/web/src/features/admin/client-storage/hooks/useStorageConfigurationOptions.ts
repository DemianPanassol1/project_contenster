'use client';

import type { AppOption } from '@contenster/shared';

import { API_ROUTES } from '@/routes';
import { usePOST } from '@/services/hooks';

const OPTIONS_REQUEST = {
  pagination: { filters: [], page: 1, perPage: 1000, sort: [] },
} as const;

export function useStorageConfigurationOptions() {
  const response = usePOST<AppOption[]>(
    API_ROUTES.ADMIN.POST_CLIENT_STORAGE_CONFIGURATION_OPTIONS,
    OPTIONS_REQUEST,
  );

  return {
    isLoading: response.isLoading,
    options: response.data?.success ? (response.data.body ?? []) : [],
    refresh: response.refresh,
  };
}
