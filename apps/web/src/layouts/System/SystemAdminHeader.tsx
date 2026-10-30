'use client';

import type { SessionUser } from '@contenster/shared';
import { Box, Divider } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { IconButton } from '@/shared';
import { HEADER_HEIGHT } from '@/utils';

import { SystemAdminHeaderActions } from './SystemAdminHeaderActions';
import { SystemAdminHeaderUserMenu } from './SystemAdminHeaderUserMenu';

interface SystemAdminHeaderProps {
  user: SessionUser;
}

export function SystemAdminHeader({ user }: SystemAdminHeaderProps) {
  const t = useTranslations('global');
  const {
    state: { drawerState },
    toggleDrawer,
  } = useGlobalContext();

  return (
    <Box
      component="header"
      sx={{
        alignItems: 'center',
        backgroundColor: 'background.paper',
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
        sx={{
          '&:hover': { backgroundColor: 'action.hover' },
        }}
        toolTip={t(drawerState === 'open' ? 'toggle_drawer_close' : 'toggle_drawer_open')}
      />

      <Box sx={{ flex: 1 }} />

      <SystemAdminHeaderActions />

      <Divider orientation="vertical" sx={{ height: '45%', mx: 1 }} />

      <SystemAdminHeaderUserMenu user={user} />
    </Box>
  );
}
