'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import {
  type StorageConfigurationListItem,
  type StorageProvider,
  storageProviderDictionary,
} from '@contenster/shared';
import type { DataTableColumn } from '@/shared';

import { getStorageProviderLabel } from '../utils/client-storage.utils';

export function useStorageConfigurationColumns(): DataTableColumn<StorageConfigurationListItem>[] {
  const t = useTranslations('protected.client_storage');
  const tEnum = useTranslations();
  const storageProviderLabels = useMemo<Record<StorageProvider, string>>(
    () =>
      Object.fromEntries(
        Object.entries(storageProviderDictionary).map(([value, key]) => [value, tEnum(key)]),
      ) as Record<StorageProvider, string>,
    [tEnum],
  );

  return useMemo(
    () => [
      {
        field: 'name',
        selector: 'name',
        name: t('fields.name'),
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'provider',
        selector: 'provider',
        name: t('fields.provider'),
        filterable: true,
        renderCell: ({ row }: { row: StorageConfigurationListItem }) =>
          getStorageProviderLabel(row.provider, storageProviderLabels),
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
        selector: 'isActive',
        name: t('fields.is_active'),
        filterable: true,
        sortable: true,
        type: 'boolean' as const,
        width: 112,
      },
    ],
    [storageProviderLabels, t],
  );
}
