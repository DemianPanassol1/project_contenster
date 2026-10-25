import { Box } from '@mui/material';
import type { ReactNode } from 'react';

interface AdminContentProps {
  children: ReactNode;
}

export function AdminContent({ children }: AdminContentProps) {
  return (
    <Box component="main" sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 3 }}>
      {children}
    </Box>
  );
}
