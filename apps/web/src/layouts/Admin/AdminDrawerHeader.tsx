'use client';

import type { SessionClient } from '@contenster/shared';
import { Box, Typography, useTheme } from '@mui/material';

import { useGlobalContext } from '@/core/providers';
import { portalFontSize } from '@/core/theme';
import { useRouter } from '@/i18n/navigation';
import { IconButton } from '@/shared';
import { FormatUtils, HEADER_HEIGHT } from '@/utils';

interface AdminDrawerHeaderProps {
  client: SessionClient;
}

export function AdminDrawerHeader({ client }: AdminDrawerHeaderProps) {
  const theme = useTheme();
  const router = useRouter();
  const {
    state: { drawerState, isLoading },
  } = useGlobalContext();
  const collapsed = drawerState === 'closed';

  return (
    <Box
      sx={{
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        gap: 1.5,
        height: HEADER_HEIGHT,
        justifyContent: collapsed ? 'center' : 'flex-start',
        px: collapsed ? 0 : '12px',
      }}
    >
      <IconButton
        disabled={isLoading}
        icon="building-2"
        iconSize={18}
        onClick={() => router.push('/admin')}
        size="medium"
        sx={{
          backgroundColor: 'primary.dark',
          borderRadius: '10px',
          boxShadow: 'rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px',
          color: 'primary.contrastText',
          scale: 0.95,
          '&:hover': {
            backgroundColor: 'primary.dark',
            color: 'primary.contrastText',
            opacity: 0.85,
          },
        }}
        toolTip={client.name}
      />

      {!collapsed && (
        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: portalFontSize(13.5),
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {client.name}
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: portalFontSize(11),
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {FormatUtils.formatDocument(client.document, client.documentType)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
