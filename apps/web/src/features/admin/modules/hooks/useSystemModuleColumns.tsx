'use client';

import type { SystemModuleListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';

export const useSystemModuleColumns = (): DataTableColumn<SystemModuleListItem>[] => {
  const t = useTranslations('protected.modules');

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
      field: 'description',
      name: t('description'),
    },
    {
      align: 'center',
      field: 'order',
      selector: 'order',
      name: t('order'),
      filterable: true,
      sortable: true,
      type: 'number',
      width: 112,
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
};
