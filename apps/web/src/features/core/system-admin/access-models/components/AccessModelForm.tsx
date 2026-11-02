'use client';

import type { SaveAccessModelRequest, SessionLanguage } from '@contenster/shared';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useValidationRules } from '@/hooks';
import { FormCheckbox, TranslationsFields } from '@/shared';

import { AccessModelStructureEditor } from './AccessModelStructureEditor';

export type AccessModelFormValues = SaveAccessModelRequest;

export function AccessModelForm({
  languages,
  initiallyExpandFirstModule = false,
}: {
  languages: SessionLanguage[];
  initiallyExpandFirstModule?: boolean;
}) {
  const t = useTranslations('protected.access_models');
  const { createValidationRules } = useValidationRules<AccessModelFormValues>();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      <TranslationsFields<AccessModelFormValues>
        label={t('name')}
        languages={languages}
        name="translations"
        textProperty="name"
        rules={createValidationRules('required|max_length[75]')}
      />
      <FormCheckbox<AccessModelFormValues> label={t('active')} name="isActive" sx={{ mt: -0.5 }} />

      <TranslationsFields<AccessModelFormValues>
        label={t('description')}
        languages={languages}
        name="translations"
        textProperty="description"
        type="textarea"
        sx={{ gridColumn: '1 / -1' }}
      />
      <Box sx={{ gridColumn: '1 / -1' }}>
        <AccessModelStructureEditor
          languages={languages}
          initiallyExpandFirstModule={initiallyExpandFirstModule}
        />
      </Box>
    </Box>
  );
}
