'use client';

import type { AccessModelListItem, SessionLanguage } from '@contenster/shared';
import { Box, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { portalFontSize } from '@/core/theme';
import { Button } from '@/shared';

import { AccessModelMetricChip } from './AccessModelMetricChip';

interface AccessModelCardProps {
  languages: SessionLanguage[];
  model: AccessModelListItem;
  onApply?: (model: AccessModelListItem) => void;
  onDelete?: (model: AccessModelListItem) => void;
  onEdit?: (model: AccessModelListItem) => void;
}

export function AccessModelCard({
  languages,
  model,
  onApply,
  onDelete,
  onEdit,
}: AccessModelCardProps) {
  const t = useTranslations('protected.access_models');
  const languageNameByCode = new Map(languages.map((language) => [language.locale, language.name]));

  return (
    <Paper variant="outlined" elevation={1} square={false} sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          alignItems: { md: 'center', xs: 'flex-start' },
          display: 'flex',
          flexDirection: { md: 'row', xs: 'column' },
          gap: '1.5rem 2rem',
          justifyContent: 'space-between',
          p: { md: 3, xs: 2 },
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            <Typography
              sx={{
                color: 'text.primary',
                fontSize: portalFontSize(16),
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {model.name}
            </Typography>
            <AccessModelMetricChip
              label={model.isActive ? t('active') : t('inactive')}
              tone={model.isActive ? 'success' : 'info'}
            />
          </Box>

          {model.description && (
            <Typography color="text.secondary" sx={{ fontSize: portalFontSize(12), mt: 0.25 }}>
              {model.description}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
              mt: 1,
            }}
          >
            <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              <AccessModelMetricChip
                label={t('module_count', { count: model.moduleCount })}
                tone="primary"
              />
              <AccessModelMetricChip
                label={t('functionality_count', { count: model.functionalityCount })}
                tone="primary"
              />
            </Box>

            {model.enabledLanguageCodes.length > 0 && (
              <Box sx={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {model.enabledLanguageCodes.map((languageCode) => (
                  <AccessModelMetricChip
                    key={languageCode}
                    label={languageNameByCode.get(languageCode) ?? languageCode.toUpperCase()}
                    tone="info"
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexShrink: 0, flexWrap: 'wrap', gap: 1 }}>
          {onEdit && (
            <Button
              icon="square-pen"
              iconPosition="start"
              label={t('edit')}
              onClick={() => onEdit(model)}
              variant="outlined"
            />
          )}
          {onApply && (
            <Button
              color="success"
              disabled={!model.isActive}
              icon="rocket"
              iconPosition="start"
              label={t('apply')}
              onClick={() => onApply(model)}
              variant="outlined"
            />
          )}
          {onDelete && (
            <Button
              color="error"
              icon="trash"
              iconPosition="start"
              label={t('delete')}
              onClick={() => onDelete(model)}
              variant="outlined"
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}
