'use client';

import type { RequestLogListItem } from '@contenster/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { DataTableColumn } from '@/shared';
import { HttpMethodChip } from '@/shared/observability';

export function useRequestLogColumns(): DataTableColumn<RequestLogListItem>[] {
  const locale = useLocale();
  const t = useTranslations('protected.client_logs');
  const formatDateTime = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        timeStyle: 'medium',
      }),
    [locale],
  );

  return useMemo(
    () => [
      {
        field: 'createdAt',
        selector: 'createdAt',
        name: t('columns.date_time'),
        renderCell: ({ row }: { row: RequestLogListItem }) =>
          formatDateTime.format(new Date(row.createdAt)),
        sortable: true,
        filterable: true,
        type: 'datetime' as const,
      },
      {
        field: 'method',
        selector: 'method',
        name: t('columns.method'),
        renderCell: ({ row }: { row: RequestLogListItem }) => (
          <HttpMethodChip method={row.method} />
        ),
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
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
        renderCell: ({ row }: { row: RequestLogListItem }) => `${row.responseTimeMs}ms`,
        sortable: true,
        type: 'number' as const,
      },
      {
        field: 'userName',
        selector: 'userName',
        name: t('columns.user'),
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'ip',
        selector: 'ip',
        name: t('columns.ip'),
        searchable: true,
        filterable: true,
        type: 'text' as const,
      },
    ],
    [formatDateTime, t],
  );
}
