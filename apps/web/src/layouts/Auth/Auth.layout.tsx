import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      component="main"
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100dvh',
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: 440, width: '100%' }}>{children}</Box>
    </Box>
  );
}
