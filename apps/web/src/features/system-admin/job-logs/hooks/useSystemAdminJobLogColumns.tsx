'use client';

import { Chip } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { type CronExecutionLogListItem, CronExecutionStatus } from '@contenster/shared';
import { type DataTableColumn, FieldType } from '@/shared';
import { formatDateTime } from '@/utils';

const statusColor: Record<CronExecutionStatus, 'error' | 'success' | 'warning'> = {
  [CronExecutionStatus.error]: 'error',
  [CronExecutionStatus.partial]: 'warning',
  [CronExecutionStatus.success]: 'success',
};

export function useSystemAdminJobLogColumns(): DataTableColumn<CronExecutionLogListItem>[] {
  const locale = useLocale();
  const t = useTranslations('protected.system_admin.job_logs');

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
        field: 'taskName',
        selector: 'taskName',
        name: t('columns.task'),
        searchable: true,
        filterable: true,
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'status',
        selector: 'status',
        name: t('columns.status'),
        renderCell: ({ row }) => (
          <Chip
            color={statusColor[row.status]}
            label={t(`statuses.${row.status}`)}
            size="small"
            sx={{ fontSize: 11 }}
          />
        ),
        filterable: true,
        sortable: true,
        type: 'status' as const,
        filter: {
          type: FieldType.STRING,
          options: Object.values(CronExecutionStatus).map((status) => ({
            label: t(`statuses.${status}`),
            value: status,
          })),
        },
      },
      {
        field: 'durationMs',
        name: t('columns.duration'),
        renderCell: ({ row }) => (row.durationMs === null ? '-' : `${row.durationMs}ms`),
        sortable: true,
        type: 'number' as const,
      },
    ],
    [locale, t],
  );
}
