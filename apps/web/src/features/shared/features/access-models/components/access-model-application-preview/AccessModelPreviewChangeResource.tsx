'use client';

import type { AccessModelPreviewChange } from '@contenster/shared';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';

import type {
  AccessModelPreviewCategory,
  AccessModelPreviewStatusTone,
} from './access-model-preview.types';
import { AccessModelPreviewChangeDetails } from './AccessModelPreviewChangeDetails';
import { AccessModelPreviewStatusChip } from './AccessModelPreviewStatusChip';

interface AccessModelPreviewChangeResourceProps {
  category: AccessModelPreviewCategory;
  change: AccessModelPreviewChange;
  checked: boolean;
  moduleNames: Record<string, string>;
  onCheckedChange: (checked: boolean) => void;
}

const textPrimarySx = { color: 'text.primary' } as const;
const textSecondarySx = { color: 'text.secondary' } as const;

const getFunctionalitySlug = (change: AccessModelPreviewChange): string | null => {
  if (!change.kind.endsWith('_functionality')) {
    return null;
  }

  return change.id.replace(/^functionality:/, '');
};

export function AccessModelPreviewChangeResource({
  category,
  change,
  checked,
  moduleNames,
  onCheckedChange,
}: AccessModelPreviewChangeResourceProps) {
  const t = useTranslations('protected.access_models');
  const isModule = change.kind.endsWith('_module');
  const action =
    category === 'additions'
      ? t('preview_add')
      : category === 'existing'
        ? t('preview_overwrite')
        : t('preview_remove');
  const status =
    category === 'additions'
      ? t('preview_status_new')
      : category === 'existing'
        ? checked
          ? t('preview_status_synchronized')
          : t('preview_status_divergent')
        : checked
          ? t('preview_status_removal_selected')
          : t('preview_status_outside');
  const tone: AccessModelPreviewStatusTone =
    category === 'outside'
      ? checked
        ? 'error'
        : 'warning'
      : category === 'existing'
        ? checked
          ? 'success'
          : 'warning'
        : 'success';
  const resourceLabel = isModule ? t('preview_module_configuration') : change.label;
  const functionalitySlug = getFunctionalitySlug(change);

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: '8px !important',
        '&::before': { display: 'none' },
      }}
    >
      <AccordionSummary
        sx={{
          minHeight: 52,
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 1,
            minWidth: 0,
            my: 0.75,
          },
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onClick={(event) => event.stopPropagation()}
              onChange={(_, nextChecked) => onCheckedChange(nextChecked)}
            />
          }
          label=""
          onClick={(event) => event.stopPropagation()}
          sx={{ mr: 0 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ ...textPrimarySx, fontSize: 14, fontWeight: 700 }}>
            {resourceLabel}
          </Typography>
          <Typography sx={{ ...textSecondarySx, fontSize: 12 }}>
            {isModule
              ? t('preview_module')
              : `${t('functionality')} · ${t('technical_slug')}: ${functionalitySlug}`}
          </Typography>
          <Typography sx={{ ...textSecondarySx, fontSize: 11, mt: 0.25 }}>
            {t('preview_selected_action', { action })}
          </Typography>
        </Box>
        <Box sx={{ mr: 1 }}>
          <AccessModelPreviewStatusChip label={status} tone={tone} />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 1.5, pt: 0 }}>
        <AccessModelPreviewChangeDetails change={change} moduleNames={moduleNames} />
      </AccordionDetails>
    </Accordion>
  );
}
