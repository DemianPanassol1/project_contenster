'use client';

import type { ProfileListItem } from '@contenster/shared';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { Chip, type DataTableColumn } from '@/shared';

export function useProfileColumns(): DataTableColumn<ProfileListItem>[] {
  const t = useTranslations('protected.profiles');

  return [
    {
      field: 'name',
      name: t('name'),
      renderCell: ({ row }) => (
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.75 }}>
          <Box component="span">{row.name}</Box>
          {row.isAdmin && <Chip color="info" label={t('administrator')} />}
        </Box>
      ),
      searchable: true,
      sortable: true,
      type: 'custom',
    },
    { field: 'description', name: t('description'), searchable: true, type: 'text' },
    { field: 'isActive', name: t('is_active'), sortable: true, type: 'boolean' },
  ];
}
