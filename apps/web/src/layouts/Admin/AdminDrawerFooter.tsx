'use client';

import { Box, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { useRouter } from '@/i18n/navigation';
import { IconButton } from '@/shared';
import { FOOTER_HEIGHT } from '@/utils';

export function AdminDrawerFooter() {
  const theme = useTheme();
  const router = useRouter();
  const t = useTranslations('global');
  const {
    state: { drawerState, isLoading },
  } = useGlobalContext();
  const collapsed = drawerState === 'closed';

  return (
    <Box
      sx={{
        alignItems: 'center',
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexShrink: 0,
        height: FOOTER_HEIGHT,
        justifyContent: collapsed ? 'center' : 'flex-start',
        px: 1,
        width: '100%',
      }}
    >
      <IconButton
        disabled={isLoading}
        icon="user"
        onClick={() => router.push('/admin/profile')}
        size="medium"
        sx={{ borderRadius: '10px' }}
        toolTip={t('my_profile')}
      />
    </Box>
  );
}
