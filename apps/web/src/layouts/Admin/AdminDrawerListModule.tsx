import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface AdminDrawerListModuleProps {
  children: ReactNode;
  drawerOpen: boolean;
  title: string;
}

export function AdminDrawerListModule({ children, drawerOpen, title }: AdminDrawerListModuleProps) {
  return (
    <Box sx={{ mb: 1.5, pt: 1.5 }}>
      {drawerOpen && (
        <Typography
          color="text.secondary"
          sx={{
            fontSize: '10.5px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            px: 3,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>
      )}

      <Box sx={{ mt: drawerOpen ? 0.75 : 0 }}>{children}</Box>
    </Box>
  );
}
