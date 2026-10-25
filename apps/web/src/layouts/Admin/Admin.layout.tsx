import type { AuthenticatedSession, ClientSessionContext } from '@contenster/shared';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';

import { webEnv } from '@/core/config';

import { AdminContent } from './AdminContent';
import { AdminDrawer } from './AdminDrawer';
import { AdminFooter } from './AdminFooter';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
  session: AuthenticatedSession & { context: ClientSessionContext };
}

export function AdminLayout({ children, session }: AdminLayoutProps) {
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
      <AdminDrawer client={session.context.client} modules={session.modules} />

      <Box
        sx={{
          display: 'flex',
          flex: '1 1 0',
          flexDirection: 'column',
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        <AdminHeader
          client={session.context.client}
          accessType={session.context.accessType}
          profile={session.context.profile}
          user={session.user}
        />
        <AdminContent>{children}</AdminContent>
        <AdminFooter
          appVersion={webEnv.appVersion}
          currentYear={new Date().getFullYear()}
          environmentName={webEnv.appEnvironment}
        />
      </Box>
    </Box>
  );
}
