'use client';

import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

interface AccessModelPreviewSummaryProps {
  additions: number;
  conflicts: number;
  existing: number;
  outside: number;
}

interface SummaryItem {
  count: number;
  description: string;
  key: 'additions' | 'conflicts' | 'existing' | 'outside';
  label: string;
}

const textPrimarySx = { color: 'text.primary' } as const;
const textSecondarySx = { color: 'text.secondary' } as const;

const getCountColor = (key: SummaryItem['key']) => {
  if (key === 'additions') {
    return 'success.main';
  }

  if (key === 'outside') {
    return 'warning.main';
  }

  if (key === 'conflicts') {
    return 'error.main';
  }

  return 'text.secondary';
};

export function AccessModelPreviewSummary({
  additions,
  conflicts,
  existing,
  outside,
}: AccessModelPreviewSummaryProps) {
  const t = useTranslations('protected.access_models');
  const items: SummaryItem[] = [
    {
      count: additions,
      description: t('preview_additions_description'),
      key: 'additions',
      label: t('preview_additions'),
    },
    {
      count: existing,
      description: t('preview_existing_description'),
      key: 'existing',
      label: t('preview_existing'),
    },
    {
      count: outside,
      description: t('preview_outside_description'),
      key: 'outside',
      label: t('preview_outside'),
    },
    {
      count: conflicts,
      description: t('preview_conflicts_description'),
      key: 'conflicts',
      label: t('preview_conflicts'),
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.25,
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
      }}
    >
      {items.map((item) => (
        <Box
          key={item.key}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            p: 1.5,
          }}
        >
          <Typography
            component="span"
            sx={{ color: getCountColor(item.key), fontSize: 26, fontWeight: 700, mr: 1 }}
          >
            {item.count}
          </Typography>
          <Typography component="span" sx={{ ...textPrimarySx, fontSize: 14, fontWeight: 700 }}>
            {item.label}
          </Typography>
          <Typography sx={{ ...textSecondarySx, fontSize: 13, mt: 0.5 }}>
            {item.description}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
