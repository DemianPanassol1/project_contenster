'use client';
import type { CityListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';
export function useCityColumns(): DataTableColumn<CityListItem>[] {
  const t = useTranslations('protected.cities');
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
      field: 'stateName',
      selector: 'stateName',
      name: t('state'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      field: 'countryName',
      selector: 'countryName',
      name: t('country'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      field: 'ibgeCode',
      selector: 'ibgeCode',
      name: t('ibge_code'),
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
