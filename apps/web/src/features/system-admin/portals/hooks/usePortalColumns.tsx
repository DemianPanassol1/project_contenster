'use client';

import type { PortalListItem } from '@contenster/shared';
import { Tooltip, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { DataTableColumn } from '@/shared';
import { formatDateTime } from '@/utils/date-time.util';

export function usePortalColumns(): DataTableColumn<PortalListItem>[] {
  const locale = useLocale();
  const t = useTranslations('protected.system_admin.portals');

  return useMemo(
    () => [
      {
        field: 'internalName',
        name: t('columns.internal_name'),
        searchable: true,
        selector: 'internalName',
        sortable: true,
        type: 'text' as const,
      },
      {
        field: 'hosts',
        getValue: (portal: PortalListItem) => portal.hosts.join(', '),
        name: t('columns.hosts'),
        renderCell: ({ row }: { row: PortalListItem }) => {
          const [firstHost, ...otherHosts] = row.hosts;
          const label = firstHost
            ? `${firstHost}${otherHosts.length > 0 ? ` +${otherHosts.length}` : ''}`
            : t('values.no_hosts');

          return (
            <Tooltip disableHoverListener={otherHosts.length === 0} title={row.hosts.join(', ')}>
              <Typography sx={{ fontSize: 13 }}>{label}</Typography>
            </Tooltip>
          );
        },
        type: 'custom' as const,
      },
      {
        field: 'updatedAt',
        name: t('columns.updated_at'),
        renderCell: ({ row }: { row: PortalListItem }) => (
          <Typography sx={{ fontSize: 13 }}>{formatDateTime(row.updatedAt, locale)}</Typography>
        ),
        selector: 'updatedAt',
        sortable: true,
        type: 'datetime' as const,
      },
    ],
    [locale, t],
  );
}
