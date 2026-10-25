'use client';

import { Box } from '@mui/material';

import { PortalLoginMediaType, type ResolvedPublicPortal } from '@contenster/shared';

type AuthMediaValue =
  ResolvedPublicPortal['login']['media'][keyof ResolvedPublicPortal['login']['media']];

interface AuthMediaProps {
  desktop: AuthMediaValue;
  mobile: AuthMediaValue;
}

const Video = ({ media }: { media: NonNullable<AuthMediaValue> }) => (
  <video
    autoPlay
    loop
    muted
    playsInline
    poster={media.poster?.url ?? undefined}
    style={{ height: '100%', inset: 0, objectFit: 'cover', position: 'absolute', width: '100%' }}
  >
    <source src={media.asset.url} type={media.asset.mimeType} />
  </video>
);

export function AuthMedia({ desktop, mobile }: AuthMediaProps) {
  const effectiveMobile = mobile ?? desktop;
  const desktopImage = desktop?.mediaType === PortalLoginMediaType.image ? desktop : null;
  const mobileImage =
    effectiveMobile?.mediaType === PortalLoginMediaType.image ? effectiveMobile : null;
  const desktopVideo = desktop?.mediaType === PortalLoginMediaType.video ? desktop : null;
  const mobileVideo =
    effectiveMobile?.mediaType === PortalLoginMediaType.video ? effectiveMobile : null;
  const usesSameVideo =
    desktopVideo !== null &&
    mobileVideo !== null &&
    desktopVideo.asset.url === mobileVideo.asset.url &&
    desktopVideo.asset.mimeType === mobileVideo.asset.mimeType &&
    desktopVideo.poster?.url === mobileVideo.poster?.url;
  const imageFallback = desktopImage ?? mobileImage;

  return (
    <Box sx={{ bgcolor: 'background.default', inset: 0, overflow: 'hidden', position: 'absolute' }}>
      {imageFallback && (
        <picture
          style={{
            display: 'block',
            height: '100%',
            inset: 0,
            position: 'absolute',
            width: '100%',
          }}
        >
          {mobileImage && (
            <source
              media="(max-width: 899.95px)"
              srcSet={mobileImage.asset.url}
              type={mobileImage.asset.mimeType}
            />
          )}
          {desktopImage && (
            <source
              media="(min-width: 900px)"
              srcSet={desktopImage.asset.url}
              type={desktopImage.asset.mimeType}
            />
          )}
          <img
            alt=""
            src={imageFallback.asset.url}
            style={{ height: '100%', objectFit: 'cover', width: '100%' }}
          />
        </picture>
      )}

      {usesSameVideo && desktopVideo ? (
        <Video media={desktopVideo} />
      ) : (
        <>
          {desktopVideo && (
            <Box
              sx={{
                display: { md: 'block', xs: 'none' },
                height: '100%',
                position: 'relative',
                width: '100%',
              }}
            >
              <Video media={desktopVideo} />
            </Box>
          )}
          {mobileVideo && (
            <Box
              sx={{
                display: { md: 'none', xs: 'block' },
                height: '100%',
                position: 'relative',
                width: '100%',
              }}
            >
              <Video media={mobileVideo} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
