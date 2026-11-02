'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import {
  type FileType,
  fileTypeDictionary,
  type StorageProvider,
  storageProviderDictionary,
  type SystemAdminFileListItem,
} from '@contenster/shared';
import { StorageFilePreview } from '@/features/core/admin/client-storage/components/StorageFilePreview';
import {
  getStorageFileTypeLabel,
  getStorageProviderLabel,
} from '@/features/core/admin/client-storage/utils/client-storage.utils';
import { API_ROUTES } from '@/routes';
import { type DataTableColumn, FieldType, Operation } from '@/shared';
import { formatDateTime, FormatUtils } from '@/utils';

export function useSystemAdminFileColumns(): DataTableColumn<SystemAdminFileListItem>[] {
  const locale = useLocale();
  const t = useTranslations('protected.system_admin.files');
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
        name: t('columns.preview'),
        renderCell: ({ row }: { row: SystemAdminFileListItem }) => (
          <StorageFilePreview file={row} />
        ),
        type: 'custom' as const,
      },
      {
        field: 'clientName',
        selector: 'clientId',
        name: t('columns.client'),
        renderCell: ({ row }: { row: SystemAdminFileListItem }) =>
          row.clientName ?? t('without_client'),
        filterable: true,
        sortable: true,
        type: 'text' as const,
        filter: {
          nullOperation: Operation.IS_NULL,
          operation: Operation.EQUALS,
          options: [{ label: t('without_client'), value: null }],
          optionsBody: {
            isOptional: false,
            pagination: {
              filters: [],
              page: 1,
              perPage: 1000,
              sort: [{ direction: 'asc', field: 'tradeName' }],
            },
          },
          optionsEndpoint: API_ROUTES.SYSTEM_ADMIN.POST_FILE_CLIENT_OPTIONS,
          optionsMethod: 'POST',
          type: FieldType.NUMBER,
        },
      },
      {
        field: 'originalName',
        name: t('columns.original_name'),
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'fileType',
        name: t('columns.file_type'),
        renderCell: ({ row }: { row: SystemAdminFileListItem }) =>
          getStorageFileTypeLabel(row.fileType, fileTypeLabels),
        filterable: true,
        sortable: true,
        type: 'text' as const,
        filter: {
          options: Object.entries(fileTypeDictionary).map(([value, translationKey]) => ({
            label: tEnum(translationKey),
            value,
          })),
          type: FieldType.STRING,
        },
      },
      {
        field: 'mimeType',
        name: 'MIME',
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'provider',
        name: t('columns.provider'),
        renderCell: ({ row }: { row: SystemAdminFileListItem }) =>
          getStorageProviderLabel(row.provider, storageProviderLabels),
        filterable: true,
        sortable: true,
        type: 'text' as const,
        filter: {
          options: Object.entries(storageProviderDictionary).map(([value, translationKey]) => ({
            label: tEnum(translationKey),
            value,
          })),
          type: FieldType.STRING,
        },
      },
      {
        field: 'sizeInBytes',
        name: t('columns.size'),
        renderCell: ({ row }: { row: SystemAdminFileListItem }) =>
          FormatUtils.formatFileSize(row.sizeInBytes, locale),
        sortable: true,
        type: 'number' as const,
      },
      {
        field: 'uploadedByName',
        name: t('columns.uploaded_by'),
        renderCell: ({ row }: { row: SystemAdminFileListItem }) => row.uploadedByName ?? '-',
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'createdAt',
        name: t('columns.uploaded_at'),
        renderCell: ({ row }: { row: SystemAdminFileListItem }) =>
          formatDateTime(row.createdAt, locale),
        filterable: true,
        sortable: true,
        type: 'datetime' as const,
      },
    ],
    [fileTypeLabels, locale, storageProviderLabels, t, tEnum],
  );
}
