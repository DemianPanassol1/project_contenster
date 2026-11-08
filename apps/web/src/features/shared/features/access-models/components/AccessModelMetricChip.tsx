'use client';

import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

type AccessModelMetricChipTone = 'error' | 'info' | 'primary' | 'success' | 'warning';

interface AccessModelMetricChipProps {
  label: string;
  tone?: AccessModelMetricChipTone;
}

export function AccessModelMetricChip({ label, tone = 'primary' }: AccessModelMetricChipProps) {
  return (
    <Chip
      label={label}
      size="small"
      sx={(theme) => {
        const mainColor = theme.palette[tone].main;

        return {
          '& .MuiChip-label': {
            px: 0.75,
          },
          '&::before': {
            backgroundColor: mainColor,
            borderRadius: '50%',
            content: '""',
            flexShrink: 0,
            height: 6,
            ml: 1,
            width: 6,
          },
          backgroundColor: alpha(mainColor, theme.palette.mode === 'dark' ? 0.3 : 0.18),
          border: 0,
          borderRadius: 999,
          color: mainColor,
          fontSize: 12,
          fontWeight: 600,
          height: 24,
        };
      }}
    />
  );
}
