'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import {
  type FileType,
  fileTypeDictionary,
  type StorageFileTypeRuleListItem,
} from '@contenster/shared';
import type { DataTableColumn } from '@/shared';

import { getStorageFileTypeLabel } from '../utils/client-storage.utils';

export function useStorageFileTypeRuleColumns(): DataTableColumn<StorageFileTypeRuleListItem>[] {
  const t = useTranslations('protected.client_storage');
  const tEnum = useTranslations();
  const fileTypeLabels = useMemo<Record<FileType, string>>(
    () =>
      Object.fromEntries(
        Object.entries(fileTypeDictionary).map(([value, key]) => [value, tEnum(key)]),
      ) as Record<FileType, string>,
    [tEnum],
  );

  return useMemo(
    () => [
      {
        field: 'fileType',
        selector: 'fileType',
        name: t('fields.file_type'),
        filterable: true,
        renderCell: ({ row }: { row: StorageFileTypeRuleListItem }) =>
          getStorageFileTypeLabel(row.fileType, fileTypeLabels),
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'storageConfigurationName',
        selector: 'storageConfigurationName',
        name: t('fields.storage_configuration'),
        filterable: true,
        sortable: true,
        type: 'text' as const,
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
    [fileTypeLabels, t],
  );
}
