'use client';

import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useRef } from 'react';

import { useGlobalContext } from '@/core/providers';
import { usePathname } from '@/i18n/navigation';
import { DRAWER_WIDTH, HEADER_HEIGHT } from '@/utils';

import { SystemAdminDrawerHeader } from './SystemAdminDrawerHeader';
import { SystemAdminDrawerNavigation } from './SystemAdminDrawerNavigation';

const collapsedDrawerWidth = 68;

export function SystemAdminDrawer() {
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
              backgroundColor: theme.palette.primary.dark,
              borderRight: `1px solid ${alpha(theme.palette.common.white, 0.22)}`,
              color: 'primary.contrastText',
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
        <SystemAdminDrawerHeader collapsed={!isOpen} />
        <SystemAdminDrawerNavigation
          collapsed={!isOpen}
          height={`calc(100dvh - ${HEADER_HEIGHT}px)`}
        />
      </Drawer>
    </Box>
  );
}
