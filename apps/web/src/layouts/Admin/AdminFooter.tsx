'use client';

import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Circle } from 'lucide-react';

import { usePortal } from '@/core/providers';
import { ENVIRONMENT_COLORS, FOOTER_HEIGHT } from '@/utils';

type EnvironmentName = keyof typeof ENVIRONMENT_COLORS;

interface AdminFooterProps {
  appVersion: string;
  currentYear: number;
  environmentName: string;
}

const resolveEnvironmentName = (value: string): EnvironmentName =>
  value in ENVIRONMENT_COLORS ? (value as EnvironmentName) : 'local';

export function AdminFooter({ appVersion, currentYear, environmentName }: AdminFooterProps) {
  const { identity } = usePortal();
  const resolvedEnvironmentName = resolveEnvironmentName(environmentName);
  const environmentColor = ENVIRONMENT_COLORS[resolvedEnvironmentName];

  return (
    <Box
      component="footer"
      sx={{
        alignItems: 'center',
        backgroundColor: 'background.paper',
        borderColor: 'divider',
        borderTop: 1,
        boxSizing: 'border-box',
        display: 'flex',
        flexShrink: 0,
        flexWrap: 'wrap',
        gap: 1,
        height: { xs: 'auto', sm: FOOTER_HEIGHT },
        justifyContent: 'space-between',
        maxWidth: '100%',
        minHeight: FOOTER_HEIGHT,
        minWidth: 0,
        px: { xs: 1.5, sm: 3 },
        py: { xs: 1, sm: 0 },
        width: '100%',
      }}
    >
      <Typography
        color="text.secondary"
        sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
        variant="caption"
      >
        © {currentYear} {identity.applicationName}
      </Typography>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          minWidth: 0,
          ml: 'auto',
        }}
        useFlexGap
      >
        <Typography
          color="text.secondary"
          sx={{ fontFamily: 'monospace', textTransform: 'lowercase' }}
          variant="caption"
        >
          v.{appVersion}
        </Typography>

        <Divider flexItem orientation="vertical" />

        <Chip
          color="info"
          icon={<Circle fill={environmentColor} size={8} strokeWidth={0} />}
          label={resolvedEnvironmentName}
          size="small"
          sx={{
            backgroundColor: alpha(environmentColor, 0.12),
            height: 24,
            p: '0 0.25rem 0 0.5rem',
            typography: 'caption',
            '& .MuiChip-label': {
              color: environmentColor,
              fontWeight: 500,
              opacity: 1,
              px: 1.25,
            },
            '&:hover': {
              backgroundColor: alpha(environmentColor, 0.12),
              opacity: 0.75,
            },
          }}
        />
      </Stack>
    </Box>
  );
}
