'use client';

import { CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { Menu } from 'lucide-react';

import { useGlobalContext } from '@/core/providers';

export function AdminHeader() {
  const {
    state: { isLoading },
    toggleDrawer,
  } = useGlobalContext();

  return (
    <Stack
      component="header"
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', borderBottom: 1, borderColor: 'divider', minHeight: 64, px: 2 }}
    >
      <IconButton aria-label="Toggle navigation" onClick={() => toggleDrawer()}>
        <Menu size={20} />
      </IconButton>

      <Typography component="span" sx={{ fontWeight: 600 }}>
        Administration
      </Typography>

      {isLoading && <CircularProgress size={18} sx={{ ml: 'auto' }} />}
    </Stack>
  );
}
