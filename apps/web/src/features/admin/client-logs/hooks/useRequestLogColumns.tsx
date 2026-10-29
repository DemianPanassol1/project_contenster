'use client';

import type { RequestLogListItem } from '@contenster/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { DataTableColumn } from '@/shared';

import { HttpMethodChip } from '../components/HttpMethodChip';

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
        name: t('columns.date_time'),
        renderCell: ({ row }: { row: RequestLogListItem }) =>
          formatDateTime.format(new Date(row.createdAt)),
        sortable: true,
        type: 'datetime' as const,
      },
      {
        field: 'method',
        name: t('columns.method'),
        renderCell: ({ row }: { row: RequestLogListItem }) => (
          <HttpMethodChip method={row.method} />
        ),
        searchable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'route',
        name: t('columns.route'),
        searchable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'statusCode',
        name: t('columns.status'),
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
        name: t('columns.user'),
        searchable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'ip',
        name: t('columns.ip'),
        searchable: true,
        type: 'text' as const,
      },
    ],
    [formatDateTime, t],
  );
}
