'use client';

import type {
  RequestLogAccessType,
  SessionClient,
  SessionProfile,
  SessionUser,
} from '@contenster/shared';
import { Box, Divider } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { IconButton } from '@/shared';
import { HEADER_HEIGHT } from '@/utils';

import { AdminHeaderActions } from './AdminHeaderActions';
import { AdminHeaderUserMenu } from './AdminHeaderUserMenu';

interface AdminHeaderProps {
  accessType: RequestLogAccessType;
  client: SessionClient;
  profile: SessionProfile;
  user: SessionUser;
}

export function AdminHeader({ accessType, client, profile, user }: AdminHeaderProps) {
  const {
    state: { drawerState },
    toggleDrawer,
  } = useGlobalContext();
  const t = useTranslations('global');

  return (
    <Box
      component="header"
      sx={{
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        boxSizing: 'border-box',
        display: 'flex',
        flexShrink: 0,
        height: HEADER_HEIGHT,
        maxWidth: '100%',
        minWidth: 0,
        pl: 1,
        pr: 1.5,
        width: '100%',
      }}
    >
      <IconButton
        icon={drawerState === 'open' ? 'panel-left-close' : 'panel-left-open'}
        onClick={() => toggleDrawer()}
        toolTip={t(drawerState === 'open' ? 'toggle_drawer_close' : 'toggle_drawer_open')}
      />

      <Box sx={{ flex: 1 }} />

      <AdminHeaderActions />

      <Divider orientation="vertical" sx={{ height: '45%', mx: 1 }} />

      <AdminHeaderUserMenu accessType={accessType} client={client} profile={profile} user={user} />
    </Box>
  );
}
