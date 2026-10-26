'use client';

import type { CountryListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';

export function useCountryColumns(): DataTableColumn<CountryListItem>[] {
  const t = useTranslations('protected.countries');
  return [
    { field: 'name', name: t('name'), searchable: true, sortable: true },
    { field: 'iso2', name: t('iso2'), searchable: true, sortable: true },
    { field: 'iso3', name: t('iso3'), searchable: true, sortable: true },
    {
      align: 'center',
      field: 'isActive',
      name: t('is_active'),
      sortable: true,
      type: 'boolean',
      width: 112,
    },
  ];
}
