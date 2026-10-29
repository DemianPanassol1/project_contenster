'use client';

import type { StorageConfigurationListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { DataTableColumn } from '@/shared';

import { getStorageProviderLabel } from '../utils/client-storage.utils';

export function useStorageConfigurationColumns(): DataTableColumn<StorageConfigurationListItem>[] {
  const t = useTranslations('protected.client_storage');

  return useMemo(
    () => [
      {
        field: 'name',
        name: t('fields.name'),
        searchable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'provider',
        name: t('fields.provider'),
        renderCell: ({ row }: { row: StorageConfigurationListItem }) =>
          getStorageProviderLabel(row.provider),
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'identifier',
        name: t('fields.destination'),
        renderCell: ({ row }: { row: StorageConfigurationListItem }) =>
          row.identifier ?? row.bucketName ?? '-',
        type: 'text' as const,
      },
      {
        align: 'center' as const,
        field: 'hasCredential',
        name: t('fields.credentials'),
        type: 'boolean' as const,
      },
      {
        align: 'center' as const,
        field: 'isActive',
        name: t('fields.is_active'),
        sortable: true,
        type: 'boolean' as const,
        width: 112,
      },
    ],
    [t],
  );
}
