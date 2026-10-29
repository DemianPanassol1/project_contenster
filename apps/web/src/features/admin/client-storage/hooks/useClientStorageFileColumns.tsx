'use client';

import type { ClientStorageFileListItem, FileType } from '@contenster/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { DataTableColumn } from '@/shared';
import { formatDateTime, FormatUtils } from '@/utils';

import { StorageFilePreview } from '../components/StorageFilePreview';
import { getStorageFileTypeLabel, getStorageProviderLabel } from '../utils/client-storage.utils';

export function useClientStorageFileColumns(): DataTableColumn<ClientStorageFileListItem>[] {
  const locale = useLocale();
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
        field: 'preview',
        name: t('fields.preview'),
        renderCell: ({ row }: { row: ClientStorageFileListItem }) => (
          <StorageFilePreview file={row} />
        ),
        type: 'custom' as const,
      },
      {
        field: 'originalName',
        name: t('fields.original_name'),
        searchable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'fileType',
        name: t('fields.file_type'),
        renderCell: ({ row }: { row: ClientStorageFileListItem }) =>
          getStorageFileTypeLabel(row.fileType, fileTypeLabels),
        sortable: true,
        type: 'text' as const,
      },
      { field: 'mimeType', name: 'MIME', searchable: true, sortable: true, type: 'text' as const },
      {
        field: 'provider',
        name: t('fields.provider'),
        renderCell: ({ row }: { row: ClientStorageFileListItem }) =>
          getStorageProviderLabel(row.provider),
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
        name: t('fields.uploaded_by'),
        searchable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'createdAt',
        name: t('fields.uploaded_at'),
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
    [fileTypeLabels, locale, t],
  );
}
