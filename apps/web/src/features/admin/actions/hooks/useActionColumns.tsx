'use client';

import { useTranslations } from 'next-intl';

import { type ActionListItem, type ActionType } from '@contenster/shared';
import { type DataTableColumn } from '@/shared';

export function useActionColumns(): DataTableColumn<ActionListItem>[] {
  const t = useTranslations('protected.actions');

  return [
    { field: 'name', name: t('name'), searchable: true, sortable: true },
    {
      field: 'type',
      name: t('type'),
      renderCell: ({ value }) => t(`types.${value as ActionType}`),
      searchable: true,
      sortable: true,
    },
    { field: 'description', name: t('description') },
  ];
}
