'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { portalFontSize } from '@/core/theme';
import { Icon } from '@/shared/ui/Icon';

export const DataTableEmptyState = () => {
  const t = useTranslations();

  return (
    <Box
      sx={{
        py: 6,
        gap: 1,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        color: 'text.secondary',
      }}
    >
      <Icon name="scan-search" size={24} />
      <Typography sx={{ fontSize: portalFontSize(13) }}>{t('data_table.empty')}</Typography>
    </Box>
  );
};
