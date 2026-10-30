'use client';

import { Box, Chip as MuiChip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { portalFontSize } from '@/core/theme';

import { Icon, type IconName } from './Icon';

type ChipColor = 'default' | 'error' | 'info' | 'primary' | 'secondary' | 'success' | 'warning';

interface ChipProps {
  color?: ChipColor;
  icon?: IconName;
  label: ReactNode;
}

export const Chip = ({ color = 'default', icon, label }: ChipProps) => (
  <MuiChip
    size="small"
    icon={
      icon ? (
        <Icon name={icon} size={13} />
      ) : (
        <Box
          component="span"
          aria-hidden="true"
          sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'currentColor', opacity: 0.65 }}
        />
      )
    }
    label={label}
    sx={(theme) => {
      const palette = color === 'default' ? null : theme.palette[color];

      return {
        height: 24,
        borderRadius: 999,
        border: 0,
        bgcolor: palette ? alpha(palette.main, 0.14) : theme.palette.action.hover,
        color: palette ? palette.dark : theme.palette.text.secondary,
        fontSize: portalFontSize(11.5),
        fontWeight: 600,
        '& .MuiChip-icon': {
          ml: 1,
          mr: -0.25,
          color: 'inherit',
        },
        '& .MuiChip-label': {
          px: 1,
        },
      };
    }}
  />
);
