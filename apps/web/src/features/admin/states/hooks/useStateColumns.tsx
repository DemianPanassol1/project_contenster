'use client';

import type { StateListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';

export function useStateColumns(): DataTableColumn<StateListItem>[] {
  const t = useTranslations('protected.states');

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
      field: 'countryName',
      selector: 'countryName',
      name: t('country'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      field: 'code',
      selector: 'code',
      name: t('code'),
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
