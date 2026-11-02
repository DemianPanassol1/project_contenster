'use client';

import type { SessionLanguage } from '@contenster/shared';
import { useMemo } from 'react';

import { API_ROUTES } from '@/routes';
import { type SelectOption, usePOST } from '@/services/hooks';

const request = {
  isOptional: false,
  pagination: {
    filters: [],
    page: 1,
    perPage: 1000,
    sort: [{ direction: 'asc' as const, field: 'name' }],
  },
};

const toLanguages = (options: SelectOption[]): SessionLanguage[] =>
  options.flatMap((option) => {
    const locale = option.metadata?.locale;

    return typeof option.value === 'number' && typeof locale === 'string'
      ? [{ id: option.value, locale, name: option.label }]
      : [];
  });

export function useSystemAdminLanguages() {
  const result = usePOST<SelectOption[]>(API_ROUTES.SYSTEM_ADMIN.POST_LANGUAGE_OPTIONS, request);
  const languages = useMemo(
    () => (result.data?.success ? toLanguages(result.data.body ?? []) : []),
    [result.data],
  );

  return {
    hasError: Boolean(result.data && !result.data.success),
    isLoading: result.isLoading,
    languages,
  };
}
