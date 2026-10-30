'use client';

import { Chip } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { RequestLogAccessType, type SystemAdminRequestLogListItem } from '@contenster/shared';
import { API_ROUTES } from '@/routes';
import { type DataTableColumn, FieldType, Operation } from '@/shared';
import { HttpMethodChip } from '@/shared/observability';
import { formatDateTime } from '@/utils';

export function useSystemAdminRequestLogColumns(): DataTableColumn<SystemAdminRequestLogListItem>[] {
  const locale = useLocale();
  const t = useTranslations('protected.system_admin.request_logs');

  return useMemo(
    () => [
      {
        field: 'createdAt',
        selector: 'createdAt',
        name: t('columns.date_time'),
        renderCell: ({ row }) => formatDateTime(row.createdAt, locale),
        sortable: true,
        filterable: true,
        type: 'datetime' as const,
      },
      {
        field: 'clientName',
        selector: 'clientId',
        name: t('columns.client'),
        renderCell: ({ row }) => row.clientName ?? t('without_client'),
        sortable: true,
        filterable: true,
        type: 'text' as const,
        filter: {
          type: FieldType.NUMBER,
          operation: Operation.EQUALS,
          nullOperation: Operation.IS_NULL,
          options: [{ label: t('without_client'), value: null }],
          optionsBody: {
            pagination: {
              filters: [],
              page: 1,
              perPage: 1000,
              sort: [{ direction: 'asc', field: 'tradeName' }],
            },
          },
          optionsEndpoint: API_ROUTES.SYSTEM_ADMIN.POST_REQUEST_LOG_CLIENT_OPTIONS,
          optionsMethod: 'POST',
        },
      },
      {
        field: 'method',
        selector: 'method',
        name: t('columns.method'),
        renderCell: ({ row }) => <HttpMethodChip method={row.method} />,
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
        filter: {
          type: FieldType.STRING,
          options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((method) => ({
            label: method,
            value: method,
          })),
        },
      },
      {
        field: 'route',
        selector: 'route',
        name: t('columns.route'),
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'statusCode',
        selector: 'statusCode',
        name: t('columns.status'),
        filterable: true,
        sortable: true,
        type: 'number' as const,
      },
      {
        field: 'responseTimeMs',
        name: t('columns.time'),
        renderCell: ({ row }) => `${row.responseTimeMs}ms`,
        sortable: true,
        type: 'number' as const,
      },
      {
        field: 'userName',
        selector: 'userName',
        name: t('columns.user'),
        renderCell: ({ row }) => row.userName ?? '-',
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'accessType',
        selector: 'accessType',
        name: t('columns.access_type'),
        renderCell: ({ row }) => (
          <Chip
            color={row.accessType === RequestLogAccessType.superuser ? 'secondary' : 'primary'}
            label={t(`access_types.${row.accessType}`)}
            size="small"
            sx={{ fontSize: 11 }}
          />
        ),
        filterable: true,
        sortable: true,
        type: 'status' as const,
        filter: {
          type: FieldType.STRING,
          options: [
            { label: t('access_types.client'), value: RequestLogAccessType.client },
            { label: t('access_types.superuser'), value: RequestLogAccessType.superuser },
          ],
        },
      },
      {
        field: 'ip',
        selector: 'ip',
        name: t('columns.ip'),
        renderCell: ({ row }) => row.ip ?? '-',
        searchable: true,
        filterable: true,
        type: 'text' as const,
      },
    ],
    [locale, t],
  );
}
