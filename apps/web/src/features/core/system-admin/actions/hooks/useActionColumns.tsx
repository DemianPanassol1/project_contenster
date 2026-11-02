'use client';

import { useTranslations } from 'next-intl';

import { type ActionListItem, type ActionType, actionTypeDictionary } from '@contenster/shared';
import { type DataTableColumn } from '@/shared';

export function useActionColumns(): DataTableColumn<ActionListItem>[] {
  const t = useTranslations('protected.actions');
  const tEnum = useTranslations();

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
      field: 'type',
      selector: 'type',
      name: t('type'),
      renderCell: ({ value }) => tEnum(actionTypeDictionary[value as ActionType]),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    { field: 'description', name: t('description') },
  ];
}
