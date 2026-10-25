'use client';

import type { SessionClient, SessionModule } from '@contenster/shared';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useRef } from 'react';

import { useGlobalContext } from '@/core/providers';
import { usePathname } from '@/i18n/navigation';
import { DRAWER_WIDTH } from '@/utils';

import { AdminDrawerFooter } from './AdminDrawerFooter';
import { AdminDrawerHeader } from './AdminDrawerHeader';
import { AdminDrawerList } from './AdminDrawerList';

interface AdminDrawerProps {
  client: SessionClient;
  modules: SessionModule[];
}

const collapsedDrawerWidth = 68;

export function AdminDrawer({ client, modules }: AdminDrawerProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    state: { drawerState },
    toggleDrawer,
  } = useGlobalContext();
  const previousPathname = useRef(pathname);
  const isOpen = drawerState === 'open';

  useEffect(() => {
    const hasRouteChanged = previousPathname.current !== pathname;
    previousPathname.current = pathname;

    if (isMobile && hasRouteChanged && isOpen) {
      toggleDrawer('closed');
    }
  }, [isMobile, isOpen, pathname, toggleDrawer]);

  const width = isOpen ? DRAWER_WIDTH : collapsedDrawerWidth;

  return (
    <Box component="aside" sx={{ flexShrink: 0 }}>
      <Drawer
        onClose={() => toggleDrawer('closed')}
        open={isOpen}
        slotProps={{
          paper: {
            sx: {
              borderRight: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            },
          },
        }}
        sx={{
          '& .MuiDrawer-paper': {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              duration: isOpen
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
              easing: theme.transitions.easing.sharp,
            }),
            width,
          },
          flexShrink: 0,
          whiteSpace: 'nowrap',
          width,
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
      >
        <AdminDrawerHeader client={client} />
        <AdminDrawerList modules={modules} />
        <AdminDrawerFooter />
      </Drawer>
    </Box>
  );
}
