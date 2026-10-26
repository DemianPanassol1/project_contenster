'use client';

import type { LanguageListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';

export function useLanguageColumns(): DataTableColumn<LanguageListItem>[] {
  const t = useTranslations('protected.languages');

  return [
    { field: 'name', name: t('name'), searchable: true, sortable: true },
    { field: 'languageCode', name: t('language_code'), searchable: true, sortable: true },
    { field: 'regionCode', name: t('region_code'), searchable: true, sortable: true },
  ];
}
