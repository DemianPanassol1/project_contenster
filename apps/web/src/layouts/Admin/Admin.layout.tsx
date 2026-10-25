import { Box } from '@mui/material';
import type { ReactNode } from 'react';

import { AdminContent } from './AdminContent';
import { AdminDrawer } from './AdminDrawer';
import { AdminFooter } from './AdminFooter';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <AdminDrawer />

      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', minWidth: 0 }}>
        <AdminHeader />
        <AdminContent>{children}</AdminContent>
        <AdminFooter />
      </Box>
    </Box>
  );
}
