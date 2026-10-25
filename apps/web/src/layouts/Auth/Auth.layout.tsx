'use client';

/* eslint-disable @next/next/no-img-element -- Portal media comes from a runtime-configured origin. */

import { Box, Link } from '@mui/material';
import type { ReactNode } from 'react';

import {
  PortalLoginHeaderMode,
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
  const { identity, login } = usePortal();
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
        <Box sx={{ maxWidth: 440, width: '100%' }}>
          <Box sx={{ mb: 3 }}>
            {login.headerMode === PortalLoginHeaderMode.brandAsset && login.brandAsset ? (
              <img
                alt={login.brandAssetAlt ?? identity.applicationName}
                src={login.brandAsset.url}
                style={{ maxHeight: 56, maxWidth: '100%' }}
              />
            ) : (
              <>
                {login.headerIcon && (
                  <img
                    alt=""
                    src={login.headerIcon.url}
                    style={{ display: 'block', height: 40, marginBottom: 12, width: 40 }}
                  />
                )}
                <Box component="h1" sx={{ fontSize: '1.4rem', m: 0 }}>
                  {login.title ?? identity.applicationName}
                </Box>
                {(login.description ?? identity.applicationDescription) && (
                  <Box sx={{ color: 'text.secondary', mt: 0.5 }}>
                    {login.description ?? identity.applicationDescription}
                  </Box>
                )}
              </>
            )}
          </Box>
          {children}
          {identity.supportText && identity.supportUrl && (
            <Box sx={{ color: 'text.secondary', mt: 4, textAlign: 'center' }}>
              <Link href={identity.supportUrl} rel="noreferrer" target="_blank">
                {identity.supportText}
              </Link>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
