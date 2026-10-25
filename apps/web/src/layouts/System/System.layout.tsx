import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface SystemLayoutProps {
  children: ReactNode;
}

export function SystemLayout({ children }: SystemLayoutProps) {
  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <Box component="header" sx={{ borderBottom: 1, borderColor: 'divider', px: 3, py: 2 }}>
        <Typography component="h1" variant="h6">
          System administration
        </Typography>
      </Box>

      <Box component="main" sx={{ p: 3 }}>
        {children}
      </Box>
    </Box>
  );
}
