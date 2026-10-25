'use client';

import { Box, Drawer, Typography } from '@mui/material';

import { useGlobalContext } from '@/core/providers';

const DRAWER_WIDTH = 260;

export function AdminDrawer() {
  const {
    state: { drawerState },
    toggleDrawer,
  } = useGlobalContext();

  return (
    <Drawer
      onClose={() => toggleDrawer('closed')}
      open={drawerState === 'open'}
      slotProps={{ paper: { sx: { p: 2, width: DRAWER_WIDTH } } }}
      variant="temporary"
    >
      <Box component="nav">
        <Typography sx={{ fontWeight: 700 }}>Contenster Slim Core</Typography>
      </Box>
    </Drawer>
  );
}
