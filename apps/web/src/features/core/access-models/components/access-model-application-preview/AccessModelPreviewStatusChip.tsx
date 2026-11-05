'use client';

import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { AccessModelPreviewStatusTone } from './access-model-preview.types';

interface AccessModelPreviewStatusChipProps {
  label: string;
  tone: AccessModelPreviewStatusTone;
}

export function AccessModelPreviewStatusChip({ label, tone }: AccessModelPreviewStatusChipProps) {
  return (
    <Chip
      label={label}
      size="small"
      sx={(theme) => {
        const mainColor = theme.palette[tone].main;

        return {
          height: 24,
          border: 0,
          borderRadius: 999,
          bgcolor: alpha(mainColor, theme.palette.mode === 'dark' ? 0.3 : 0.18),
          color: mainColor,
          fontSize: 12,
          fontWeight: 600,
          '&::before': {
            width: 6,
            height: 6,
            ml: 1,
            content: '""',
            flexShrink: 0,
            borderRadius: '50%',
            bgcolor: mainColor,
          },
          '& .MuiChip-label': {
            px: 0.75,
          },
        };
      }}
    />
  );
}
