'use client';

import { Box, Typography } from '@mui/material';

interface LogJsonViewerProps {
  emptyLabel: string;
  maxHeight?: number | string | null;
  value: unknown;
}

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return typeof value === 'object' && Object.keys(value).length === 0;
};

const formatValue = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2);

export function LogJsonViewer({ value, emptyLabel, maxHeight = 240 }: LogJsonViewerProps) {
  if (isEmptyValue(value)) {
    return <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>{emptyLabel}</Typography>;
  }

  return (
    <Box
      component="pre"
      sx={{
        backgroundColor: 'action.hover',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        color: 'text.primary',
        fontFamily: 'monospace',
        fontSize: 12,
        lineHeight: 1.55,
        m: 0,
        maxHeight: maxHeight ?? undefined,
        overflow: 'auto',
        p: 1.25,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {formatValue(value)}
    </Box>
  );
}
