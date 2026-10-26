'use client';

import type { SystemModuleListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';

export const useSystemModuleColumns = (): DataTableColumn<SystemModuleListItem>[] => {
  const t = useTranslations('protected.modules');

  return [
    {
      field: 'name',
      name: t('name'),
      searchable: true,
      sortable: true,
    },
    {
      field: 'description',
      name: t('description'),
    },
    {
      align: 'center',
      field: 'order',
      name: t('order'),
      sortable: true,
      type: 'number',
      width: 112,
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
};
