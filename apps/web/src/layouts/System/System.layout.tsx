import { Box, Typography } from '@mui/material';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

interface SystemLayoutProps {
  children: ReactNode;
}

export async function SystemLayout({ children }: SystemLayoutProps) {
  const t = await getTranslations('protected.system_admin');

  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <Box component="header" sx={{ borderBottom: 1, borderColor: 'divider', px: 3, py: 2 }}>
        <Typography component="h1" variant="h6">
          {t('home_title')}
        </Typography>
      </Box>

      <Box component="main" sx={{ p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
