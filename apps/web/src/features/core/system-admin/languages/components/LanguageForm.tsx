'use client';

import type { SaveLanguageRequest } from '@contenster/shared';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useValidationRules } from '@/hooks';
import { FormInput } from '@/shared';

export function LanguageForm() {
  const t = useTranslations('protected.languages');
  const { createValidationRules } = useValidationRules<SaveLanguageRequest>();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
      }}
    >
      <Box sx={{ gridColumn: { md: 'span 3' } }}>
        <FormInput<SaveLanguageRequest>
          label={t('name')}
          name="name"
          rules={createValidationRules('required|max_length[150]')}
        />
      </Box>
      <FormInput<SaveLanguageRequest>
        label={t('language_code')}
        name="languageCode"
        rules={createValidationRules('required|exact_length[2]')}
      />
      <FormInput<SaveLanguageRequest>
        label={t('region_code')}
        name="regionCode"
        rules={createValidationRules('required|exact_length[2]')}
      />
    </Box>
  );
}
