'use client';

import type { UserListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { type DataTableColumn } from '@/shared';

export function useUserColumns(): DataTableColumn<UserListItem>[] {
  const t = useTranslations('protected.users');

  return [
    { field: 'name', name: t('name'), searchable: true, sortable: true },
    { field: 'username', name: t('username'), searchable: true, sortable: true },
    { field: 'email', name: t('email'), searchable: true, sortable: true },
    { field: 'isActive', name: t('is_active'), sortable: true, type: 'boolean', width: 112 },
    { field: 'isBlocked', name: t('is_blocked'), sortable: true, type: 'boolean', width: 128 },
  ];
}
