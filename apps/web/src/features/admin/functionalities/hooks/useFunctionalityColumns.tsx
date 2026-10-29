'use client';
import type { FunctionalityListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';
export function useFunctionalityColumns(): DataTableColumn<FunctionalityListItem>[] {
  const t = useTranslations('protected.functionalities');
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
      field: 'slug',
      selector: 'slug',
      name: t('slug'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      field: 'order',
      selector: 'order',
      name: t('order'),
      filterable: true,
      sortable: true,
      type: 'number',
    },
    { field: 'isNavigationGroup', name: t('is_navigation_group'), sortable: true, type: 'boolean' },
    {
      field: 'isActive',
      selector: 'isActive',
      name: t('is_active'),
      filterable: true,
      sortable: true,
      type: 'boolean',
    },
  ];
}
