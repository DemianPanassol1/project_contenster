'use client';
import type { CityListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';
export function useCityColumns(): DataTableColumn<CityListItem>[] {
  const t = useTranslations('protected.cities');
  return [
    { field: 'name', name: t('name'), searchable: true, sortable: true },
    { field: 'stateName', name: t('state'), searchable: true, sortable: true },
    { field: 'countryName', name: t('country'), searchable: true, sortable: true },
    { field: 'ibgeCode', name: t('ibge_code'), searchable: true, sortable: true },
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
