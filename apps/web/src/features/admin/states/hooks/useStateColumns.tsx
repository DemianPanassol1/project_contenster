'use client';

import type { StateListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';

export function useStateColumns(): DataTableColumn<StateListItem>[] {
  const t = useTranslations('protected.states');

  return [
    {
      field: 'name',
      name: t('name'),
      searchable: true,
      sortable: true,
    },
    {
      field: 'countryName',
      name: t('country'),
      searchable: true,
      sortable: true,
    },
    {
      field: 'code',
      name: t('code'),
      searchable: true,
      sortable: true,
    },
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
