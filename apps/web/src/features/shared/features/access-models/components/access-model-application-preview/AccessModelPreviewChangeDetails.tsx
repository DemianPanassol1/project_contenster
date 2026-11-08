'use client';

import type { AccessModelPreviewChange } from '@contenster/shared';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

import { parseAccessModelPreviewValues } from '../../utils/access-model-preview.utils';

interface AccessModelPreviewChangeDetailsProps {
  change: AccessModelPreviewChange;
  moduleNames: Record<string, string>;
}

const textPrimarySx = { color: 'text.primary' } as const;
const textSecondarySx = { color: 'text.secondary' } as const;

const formatValue = (value: unknown, emptyValue: string, yes: string, no: string): string => {
  if (value === null || value === undefined || value === '') {
    return emptyValue;
  }

  if (typeof value === 'boolean') {
    return value ? yes : no;
  }

  if (Array.isArray(value)) {
    return value.length
      ? value.map((item) => formatValue(item, emptyValue, yes, no)).join(', ')
      : emptyValue;
  }

  if (typeof value === 'object') {
    const item = value as Record<string, unknown>;

    if (typeof item.locale === 'string' && typeof item.name === 'string') {
      const description = typeof item.description === 'string' ? item.description : '';

      return `${item.locale.toUpperCase()} · ${item.name}${description ? ` — ${description}` : ''}`;
    }

    return JSON.stringify(value) ?? emptyValue;
  }

  return typeof value === 'string' || typeof value === 'number' ? String(value) : emptyValue;
};

const getFieldLabel = (field: string, t: ReturnType<typeof useTranslations>) => {
  const labels: Record<string, string> = {
    enabledLanguageCodes: t('enabled_languages'),
    icon: t('icon'),
    isActive: t('active'),
    isNavigationGroup: t('navigation_group'),
    moduleKey: t('module_assignment'),
    order: t('order'),
    parentSlug: t('parent'),
    synchronizeAdminPermissions: t('admin_permissions'),
    translations: t('translations'),
  };

  return labels[field] ?? field;
};

export function AccessModelPreviewChangeDetails({
  change,
  moduleNames,
}: AccessModelPreviewChangeDetailsProps) {
  const t = useTranslations('protected.access_models');
  const current = parseAccessModelPreviewValues(change.currentValue);
  const proposed = parseAccessModelPreviewValues(change.proposedValue);
  const fields = [
    ...new Set([...Object.keys(current ?? {}), ...Object.keys(proposed ?? {})]),
  ].filter((field) => JSON.stringify(current?.[field]) !== JSON.stringify(proposed?.[field]));

  if (!fields.length && !change.affectedItems.length) {
    return <Typography sx={textSecondarySx}>{t('preview_empty_details')}</Typography>;
  }

  const renderValue = (field: string, value: unknown) => {
    if (field === 'moduleKey' && typeof value === 'string') {
      const moduleName = moduleNames[value];

      return (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ ...textPrimarySx, fontSize: 12, overflowWrap: 'anywhere' }}>
            {moduleName ?? value}
          </Typography>
          {moduleName && moduleName !== value && (
            <Typography sx={{ ...textSecondarySx, fontSize: 11, overflowWrap: 'anywhere' }}>
              {t('module_key')}: {value}
            </Typography>
          )}
        </Box>
      );
    }

    return (
      <Typography
        sx={{ ...textPrimarySx, fontSize: 12, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
      >
        {formatValue(value, t('empty_value'), t('yes'), t('no'))}
      </Typography>
    );
  };

  return (
    <Stack spacing={1.25}>
      {fields.map((field) => (
        <Box
          key={field}
          sx={{
            display: 'grid',
            alignItems: 'start',
            gap: 1.25,
            gridTemplateColumns: { xs: '1fr', md: 'minmax(140px, 0.45fr) 1fr 1fr' },
            py: 1,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography sx={{ ...textSecondarySx, fontSize: 12, fontWeight: 700 }}>
            {getFieldLabel(field, t)}
          </Typography>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...textSecondarySx, fontSize: 11, mb: 0.25 }}>
              {t('current')}
            </Typography>
            {renderValue(field, current?.[field])}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ ...textSecondarySx, fontSize: 11, mb: 0.25 }}>
              {t('proposed')}
            </Typography>
            {renderValue(field, proposed?.[field])}
          </Box>
        </Box>
      ))}

      {change.affectedItems.length > 0 && (
        <Box sx={{ display: 'grid', gap: 0.75 }}>
          <Typography sx={{ ...textSecondarySx, fontSize: 12, fontWeight: 700 }}>
            {t('affected')}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {change.affectedItems.map((item) => (
              <Chip key={item} label={item} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
