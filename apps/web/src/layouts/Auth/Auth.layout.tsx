'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';

import {
  PortalLoginLayout,
  PortalLoginMediaSlot,
  PortalSplitMediaPosition,
} from '@contenster/shared';
import { usePortal } from '@/core/providers';

import { AuthMedia } from './AuthMedia';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { login } = usePortal();
  const isSplit = login.layout === PortalLoginLayout.split;
  const media = isSplit
    ? {
        desktop: login.media[PortalLoginMediaSlot.splitPanelDesktop],
        mobile: login.media[PortalLoginMediaSlot.splitPanelMobile],
      }
    : {
        desktop: login.media[PortalLoginMediaSlot.centeredBackgroundDesktop],
        mobile: login.media[PortalLoginMediaSlot.centeredBackgroundMobile],
      };
  const mediaOnLeft = login.splitMediaPosition === PortalSplitMediaPosition.left;

  return (
    <Box
      component="main"
      sx={{
        color: 'text.primary',
        display: isSplit ? { md: 'grid', xs: 'flex' } : 'flex',
        gridTemplateColumns: isSplit ? 'minmax(0, 1fr) minmax(0, 1fr)' : undefined,
        minHeight: '100dvh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          inset: isSplit ? { md: 'auto', xs: 0 } : 0,
          minHeight: isSplit ? { md: '100dvh' } : undefined,
          order: isSplit && !mediaOnLeft ? 2 : 0,
          position: isSplit ? { md: 'relative', xs: 'absolute' } : 'absolute',
        }}
      >
        <AuthMedia desktop={media.desktop} mobile={media.mobile} />
        <Box
          aria-hidden="true"
          sx={{
            background: isSplit
              ? {
                  md: 'none',
                  xs: 'linear-gradient(135deg, rgba(18, 20, 52, 0.82), rgba(7, 11, 28, 0.9))',
                }
              : 'linear-gradient(135deg, rgba(18, 20, 52, 0.82), rgba(7, 11, 28, 0.9))',
            inset: 0,
            pointerEvents: 'none',
            position: 'absolute',
          }}
        />
      </Box>

      <Box
        sx={{
          alignItems: 'center',
          bgcolor: isSplit ? { md: 'background.default', xs: 'transparent' } : 'transparent',
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100dvh',
          order: isSplit && mediaOnLeft ? 2 : 0,
          px: { lg: isSplit ? 6 : 3, sm: 3, xs: 2 },
          py: { sm: 6, xs: 4 },
          position: 'relative',
          width: '100%',
          zIndex: 1,
        }}
      >
        <Box sx={{ maxWidth: 460, width: '100%' }}>{children}</Box>
      </Box>
    </Box>
  );
}
