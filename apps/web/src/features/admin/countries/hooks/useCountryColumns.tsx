'use client';

import type { CountryListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';

export function useCountryColumns(): DataTableColumn<CountryListItem>[] {
  const t = useTranslations('protected.countries');
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
      field: 'iso2',
      selector: 'iso2',
      name: t('iso2'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      field: 'iso3',
      selector: 'iso3',
      name: t('iso3'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      align: 'center',
      field: 'isActive',
      selector: 'isActive',
      name: t('is_active'),
      filterable: true,
      sortable: true,
      type: 'boolean',
      width: 112,
    },
  ];
}
