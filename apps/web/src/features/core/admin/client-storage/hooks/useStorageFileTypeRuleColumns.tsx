'use client';

import type { FileType, StorageFileTypeRuleListItem } from '@contenster/shared';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { DataTableColumn } from '@/shared';

import { getStorageFileTypeLabel } from '../utils/client-storage.utils';

export function useStorageFileTypeRuleColumns(): DataTableColumn<StorageFileTypeRuleListItem>[] {
  const t = useTranslations('protected.client_storage');
  const fileTypeLabels = useMemo<Record<FileType, string>>(
    () => ({
      arquivo: t('file_types.file'),
      icone: t('file_types.icon'),
      imagem: t('file_types.image'),
      video: t('file_types.video'),
    }),
    [t],
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
