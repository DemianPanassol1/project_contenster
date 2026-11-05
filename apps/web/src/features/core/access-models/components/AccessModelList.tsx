'use client';

import type { AccessModelListItem, SessionLanguage } from '@contenster/shared';
import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { portalFontSize } from '@/core/theme';

import { AccessModelCard } from './AccessModelCard';

interface AccessModelListProps {
  languages: SessionLanguage[];
  models: AccessModelListItem[];
  onApply?: (model: AccessModelListItem) => void;
  onDelete?: (model: AccessModelListItem) => void;
  onEdit?: (model: AccessModelListItem) => void;
}

export function AccessModelList({
  languages,
  models,
  onApply,
  onDelete,
  onEdit,
}: AccessModelListProps) {
  const t = useTranslations('protected.access_models');

  if (models.length === 0) {
    return (
      <Typography
        color="text.secondary"
        sx={{ fontSize: portalFontSize(13), py: 6, textAlign: 'center' }}
      >
        {t('empty')}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {models.map((model) => (
        <AccessModelCard
          key={model.id}
          languages={languages}
          model={model}
          onApply={onApply}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </Box>
  );
}
