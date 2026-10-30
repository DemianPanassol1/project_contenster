'use client';

import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { PortalLoginHeaderMode } from '@contenster/shared';
import { usePortal } from '@/core/providers';
import { ContensterIcon } from '@/shared/ui/ContensterIcon';

const DefaultHeaderIcon = () => (
  <Box
    sx={{
      bgcolor: 'primary.dark',
      borderRadius: 2,
      boxShadow: '0 10px 24px -12px rgba(114, 102, 255, 0.85)',
      color: 'primary.contrastText',
      display: 'grid',
      flex: '0 0 auto',
      height: 40,
      placeItems: 'center',
      width: 40,
    }}
  >
    <ContensterIcon size={18} />
  </Box>
);

export function AuthIdentityHeader() {
  const { identity, login } = usePortal();
  const [failedBrandAssetUrl, setFailedBrandAssetUrl] = useState<string | null>(null);
  const [failedHeaderIconUrl, setFailedHeaderIconUrl] = useState<string | null>(null);
  const brandAsset = login.brandAsset;
  const headerIcon = login.headerIcon;
  const shouldShowBrandAsset =
    login.headerMode === PortalLoginHeaderMode.brandAsset &&
    brandAsset !== null &&
    failedBrandAssetUrl !== brandAsset.url;

  if (shouldShowBrandAsset && brandAsset) {
    return (
      <Box
        alt={login.brandAssetAlt ?? identity.applicationName}
        component="img"
        src={brandAsset.url}
        sx={{ display: 'block', height: 'auto', mb: 3, maxWidth: '100%', width: '100%' }}
        onError={() => setFailedBrandAssetUrl(brandAsset.url)}
      />
    );
  }

  const shouldShowHeaderIcon = headerIcon !== null && failedHeaderIconUrl !== headerIcon.url;

  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 3 }}>
      {shouldShowHeaderIcon ? (
        <Box
          alt=""
          aria-hidden="true"
          component="img"
          src={headerIcon?.url}
          sx={{ borderRadius: 2, flex: '0 0 auto', height: 40, objectFit: 'contain', width: 40 }}
          onError={() => setFailedHeaderIconUrl(headerIcon?.url ?? null)}
        />
      ) : (
        <DefaultHeaderIcon />
      )}

      <Box sx={{ minWidth: 0 }}>
        <Typography component="div" sx={{ fontWeight: 700, lineHeight: 1.2 }} variant="body1">
          {identity.applicationName}
        </Typography>
        {identity.applicationDescription && (
          <Typography
            color="text.secondary"
            component="div"
            sx={{ lineHeight: 1.35, mt: 0.25, overflowWrap: 'anywhere' }}
            variant="caption"
          >
            {identity.applicationDescription}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
