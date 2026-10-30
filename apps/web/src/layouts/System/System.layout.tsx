import type { SessionUser } from '@contenster/shared';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';

import { webEnv } from '@/core/config';

import { SystemAdminDrawer } from './SystemAdminDrawer';
import { SystemAdminFooter } from './SystemAdminFooter';
import { SystemAdminHeader } from './SystemAdminHeader';

interface SystemLayoutProps {
  children: ReactNode;
  user: SessionUser;
}

export function SystemLayout({ children, user }: SystemLayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        height: '100dvh',
        maxWidth: '100%',
        minWidth: 0,
        width: '100%',
      }}
    >
      <SystemAdminDrawer />

      <Box
        sx={{
          display: 'flex',
          flex: '1 1 0',
          flexDirection: 'column',
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        <SystemAdminHeader user={user} />

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

        <SystemAdminFooter
          appVersion={webEnv.appVersion}
          currentYear={new Date().getFullYear()}
          environmentName={webEnv.appEnvironment}
        />
      </Box>
    </Box>
  );
}
