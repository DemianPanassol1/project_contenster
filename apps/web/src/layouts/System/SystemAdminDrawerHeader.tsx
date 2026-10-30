'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { useRouter } from '@/i18n/navigation';
import { IconButton } from '@/shared';
import { HEADER_HEIGHT } from '@/utils';

interface SystemAdminDrawerHeaderProps {
  collapsed: boolean;
}

export function SystemAdminDrawerHeader({ collapsed }: SystemAdminDrawerHeaderProps) {
  const router = useRouter();
  const t = useTranslations('protected.system_admin');
  const {
    state: { isLoading },
  } = useGlobalContext();

  return (
    <Box
      sx={{
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.22)',
        display: 'flex',
        gap: 1.5,
        height: HEADER_HEIGHT,
        justifyContent: collapsed ? 'center' : 'flex-start',
        px: collapsed ? 0 : '12px',
      }}
    >
      <IconButton
        disabled={isLoading}
        icon="layout-dashboard"
        iconSize={18}
        onClick={() => router.push('/system-admin')}
        size="medium"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.16)',
          borderRadius: '10px',
          color: 'primary.contrastText',
          scale: 0.95,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.24)',
            color: 'primary.contrastText',
          },
        }}
        toolTip={t('home_title')}
      />

      {!collapsed && (
        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, minWidth: 0 }}>
          <Typography
            sx={{
              color: 'primary.contrastText',
              fontSize: '13.5px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {t('home_title')}
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255, 255, 255, 0.78)',
              fontSize: '11px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {t('home_description')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
