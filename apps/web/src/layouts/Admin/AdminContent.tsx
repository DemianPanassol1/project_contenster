import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface AdminContentProps {
  children: ReactNode;
}

export function AdminContent({ children }: AdminContentProps) {
  return (
    <Box
      component="main"
      sx={{
        display: 'block',
        flex: 1,
        maxWidth: '100%',
        minHeight: 0,
        minWidth: 0,
        overflowY: 'auto',
      }}
    >
      {children}
    </Box>
  );
}
