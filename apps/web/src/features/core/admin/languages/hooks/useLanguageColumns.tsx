'use client';

import type { LanguageListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';

export function useLanguageColumns(): DataTableColumn<LanguageListItem>[] {
  const t = useTranslations('protected.languages');

  return [
    {
      field: 'name',
      selector: 'name',
      name: t('name'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      field: 'languageCode',
      selector: 'languageCode',
      name: t('language_code'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      field: 'regionCode',
      selector: 'regionCode',
      name: t('region_code'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
  ];
}
