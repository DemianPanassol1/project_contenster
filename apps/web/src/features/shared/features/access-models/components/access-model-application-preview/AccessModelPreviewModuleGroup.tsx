'use client';

import { Box, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

interface AccessModelPreviewModuleGroupProps {
  children: ReactNode;
  label: string;
  moduleKey: string | null;
}

const textPrimarySx = { color: 'text.primary' } as const;
const textSecondarySx = { color: 'text.secondary' } as const;

export function AccessModelPreviewModuleGroup({
  children,
  label,
  moduleKey,
}: AccessModelPreviewModuleGroupProps) {
  const t = useTranslations('protected.access_models');

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ bgcolor: 'action.hover', px: 1.5, py: 1.25 }}>
        <Typography sx={{ ...textPrimarySx, fontSize: 14, fontWeight: 700 }}>{label}</Typography>
        {moduleKey && (
          <Typography sx={{ ...textSecondarySx, fontSize: 12, mt: 0.25 }}>
            {t('preview_module')} · {t('module_key')}: {moduleKey}
          </Typography>
        )}
      </Box>
      <Stack spacing={0.75} sx={{ p: 1 }}>
        {children}
      </Stack>
    </Box>
  );
}
