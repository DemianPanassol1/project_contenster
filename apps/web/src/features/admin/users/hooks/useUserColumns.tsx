'use client';

import type { UserListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';

export function useUserColumns(): DataTableColumn<UserListItem>[] {
  const t = useTranslations('protected.users');

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
      field: 'username',
      selector: 'username',
      name: t('username'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      field: 'email',
      selector: 'email',
      name: t('email'),
      searchable: true,
      filterable: true,
      sortable: true,
    },
    {
      field: 'isActive',
      selector: 'isActive',
      name: t('is_active'),
      filterable: true,
      sortable: true,
      type: 'boolean',
      width: 112,
    },
    {
      field: 'isBlocked',
      selector: 'isBlocked',
      name: t('is_blocked'),
      filterable: true,
      sortable: true,
      type: 'boolean',
      width: 128,
    },
  ];
}
