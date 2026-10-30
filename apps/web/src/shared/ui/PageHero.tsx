'use client';

import { Box, type SxProps, type Theme, Typography } from '@mui/material';

import { portalFontSize } from '@/core/theme';

interface PageHeroProps {
  module: string;
  functionality: string;
  description?: string;
  sx?: SxProps<Theme>;
}

export const PageHero = ({ module, functionality, description, sx }: PageHeroProps) => {
  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Typography
        variant="body2"
        sx={{
          mb: 1.5,
          lineHeight: 1,
          fontWeight: 500,
          letterSpacing: 0,
          fontSize: portalFontSize(11),
          color: 'primary.main',
          textTransform: 'uppercase',
        }}
      >
        {module}
      </Typography>

      <Typography
        variant="h1"
        sx={{
          fontSize: portalFontSize(18),
          fontWeight: 600,
          lineHeight: 1.25,
          letterSpacing: 0,
          color: 'text.primary',
        }}
      >
        {functionality}
      </Typography>

      {description && (
        <Typography
          variant="body1"
          sx={{
            mt: 0.75,
            lineHeight: 1.55,
            maxWidth: '42rem',
            fontSize: portalFontSize(13.5),
            color: 'text.secondary',
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};
