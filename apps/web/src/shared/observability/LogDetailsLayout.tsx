'use client';

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import { portalFontSize } from '@/core/theme';

import { LogJsonViewer } from './LogJsonViewer';

interface LogFieldProps {
  emptyLabel: string;
  label: string;
  value: unknown;
}
interface LogSectionProps {
  children: ReactNode;
  title: string;
}
interface LogJsonSectionProps {
  emptyLabel: string;
  label: string;
  maxHeight?: number | string | null;
  value: unknown;
}

const formatTextValue = (value: unknown, emptyLabel: string): string =>
  value === null || value === undefined || value === ''
    ? emptyLabel
    : typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : JSON.stringify(value);

export function LogField({ label, value, emptyLabel }: LogFieldProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{ color: 'text.secondary', fontSize: portalFontSize(11), fontWeight: 700, mb: 0.25 }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: portalFontSize(13), overflowWrap: 'anywhere' }}>
        {formatTextValue(value, emptyLabel)}
      </Typography>
    </Box>
  );
}
export function LogSection({ title, children }: LogSectionProps) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Typography sx={{ fontSize: portalFontSize(14), fontWeight: 700 }}>{title}</Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
export function LogJsonSection({ label, value, emptyLabel, maxHeight }: LogJsonSectionProps) {
  return (
    <Box sx={{ gridColumn: '1 / -1' }}>
      <Typography
        sx={{ color: 'text.secondary', fontSize: portalFontSize(11), fontWeight: 700, mb: 0.75 }}
      >
        {label}
      </Typography>
      <LogJsonViewer emptyLabel={emptyLabel} maxHeight={maxHeight} value={value} />
    </Box>
  );
}
