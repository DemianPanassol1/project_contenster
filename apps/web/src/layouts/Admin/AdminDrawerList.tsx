'use client';

import type { SessionModule } from '@contenster/shared';
import { Box } from '@mui/material';

import { useGlobalContext } from '@/core/providers';
import { FOOTER_HEIGHT, HEADER_HEIGHT } from '@/utils';

import { AdminDrawerListItem } from './AdminDrawerListItem';
import { AdminDrawerListModule } from './AdminDrawerListModule';

interface AdminDrawerListProps {
  modules: SessionModule[];
}

export function AdminDrawerList({ modules }: AdminDrawerListProps) {
  const {
    state: { drawerState, isLoading },
  } = useGlobalContext();
  const drawerOpen = drawerState === 'open';

  return (
    <Box sx={{ height: `calc(100dvh - ${HEADER_HEIGHT}px - ${FOOTER_HEIGHT}px)`, width: '100%' }}>
      <Box
        sx={{
          height: '100%',
          overflow: 'clip auto',
          width: '100%',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { background: '#d9d9dd', borderRadius: '999px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
        }}
      >
        {modules.map((module) => (
          <AdminDrawerListModule key={module.id} drawerOpen={drawerOpen} title={module.name}>
            {module.functionalities.map((functionality) => (
              <AdminDrawerListItem
                drawerOpen={drawerOpen}
                functionality={functionality}
                isLoading={isLoading}
                key={functionality.id}
              />
            ))}
          </AdminDrawerListModule>
        ))}
      </Box>
    </Box>
  );
}
