'use client';
import type { FunctionalityListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';
export function useFunctionalityColumns(): DataTableColumn<FunctionalityListItem>[] {
  const t = useTranslations('protected.functionalities');
  return [
    { field: 'name', name: t('name'), searchable: true, sortable: true },
    { field: 'slug', name: t('slug'), searchable: true, sortable: true },
    { field: 'order', name: t('order'), sortable: true, type: 'number' },
    { field: 'isNavigationGroup', name: t('is_navigation_group'), sortable: true, type: 'boolean' },
    { field: 'isActive', name: t('is_active'), sortable: true, type: 'boolean' },
  ];
}
