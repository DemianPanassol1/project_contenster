'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import {
  type ClientStorageFileListItem,
  type FileType,
  fileTypeDictionary,
  type StorageProvider,
  storageProviderDictionary,
} from '@contenster/shared';
import type { DataTableColumn } from '@/shared';
import { formatDateTime, FormatUtils } from '@/utils';

import { StorageFilePreview } from '../components/StorageFilePreview';
import { getStorageFileTypeLabel, getStorageProviderLabel } from '../utils/client-storage.utils';

export function useClientStorageFileColumns(): DataTableColumn<ClientStorageFileListItem>[] {
  const locale = useLocale();
  const t = useTranslations('protected.client_storage');
  const tEnum = useTranslations();
  const fileTypeLabels = useMemo<Record<FileType, string>>(
    () =>
      Object.fromEntries(
        Object.entries(fileTypeDictionary).map(([value, key]) => [value, tEnum(key)]),
      ) as Record<FileType, string>,
    [tEnum],
  );
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
        field: 'preview',
        name: t('fields.preview'),
        renderCell: ({ row }: { row: ClientStorageFileListItem }) => (
          <StorageFilePreview file={row} />
        ),
        type: 'custom' as const,
      },
      {
        field: 'originalName',
        selector: 'originalName',
        name: t('fields.original_name'),
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'fileType',
        selector: 'fileType',
        name: t('fields.file_type'),
        filterable: true,
        renderCell: ({ row }: { row: ClientStorageFileListItem }) =>
          getStorageFileTypeLabel(row.fileType, fileTypeLabels),
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'mimeType',
        selector: 'mimeType',
        name: 'MIME',
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
        renderCell: ({ row }: { row: ClientStorageFileListItem }) =>
          getStorageProviderLabel(row.provider, storageProviderLabels),
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'sizeInBytes',
        name: t('fields.size'),
        renderCell: ({ row }: { row: ClientStorageFileListItem }) =>
          FormatUtils.formatFileSize(row.sizeInBytes, locale),
        sortable: true,
        type: 'number' as const,
      },
      {
        field: 'uploadedByName',
        selector: 'uploadedByName',
        name: t('fields.uploaded_by'),
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'createdAt',
        selector: 'createdAt',
        name: t('fields.uploaded_at'),
        filterable: true,
        renderCell: ({ row }: { row: ClientStorageFileListItem }) =>
          formatDateTime(row.createdAt, locale),
        sortable: true,
        type: 'datetime' as const,
      },
      {
        field: 'url',
        name: 'URL',
        renderCell: ({ row }: { row: ClientStorageFileListItem }) =>
          row.url ? t('public_url_available') : t('no_public_url'),
        type: 'text' as const,
      },
    ],
    [fileTypeLabels, locale, storageProviderLabels, t],
  );
}
