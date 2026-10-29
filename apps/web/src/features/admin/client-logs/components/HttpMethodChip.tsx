'use client';

import { Chip, type SxProps, type Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface HttpMethodChipProps {
  method: string;
}

type MethodColor = 'error' | 'info' | 'secondary' | 'success' | 'warning';

const methodColorMap: Partial<Record<string, MethodColor>> = {
  DELETE: 'error',
  GET: 'info',
  PATCH: 'secondary',
  POST: 'success',
  PUT: 'warning',
};

export function HttpMethodChip({ method }: HttpMethodChipProps) {
  const normalizedMethod = method.trim().toUpperCase() || '-';
  const paletteKey = methodColorMap[normalizedMethod];

  const sx: SxProps<Theme> = (theme) => {
    if (!paletteKey) {
      return {
        backgroundColor: theme.palette.action.hover,
        borderColor: theme.palette.divider,
        color: theme.palette.text.secondary,
      };
    }

    const palette = theme.palette[paletteKey];

    return {
      backgroundColor: alpha(palette.main, 0.12),
      borderColor: alpha(palette.main, 0.35),
      color: palette.dark,
    };
  };

  return (
    <Chip
      label={normalizedMethod}
      size="small"
      sx={[
        {
          '& .MuiChip-label': { px: 0.75 },
          borderRadius: 1,
          fontSize: 11,
          fontWeight: 800,
          height: 22,
          letterSpacing: 0,
          minWidth: 58,
        },
        sx,
      ]}
      variant="outlined"
    />
  );
}
