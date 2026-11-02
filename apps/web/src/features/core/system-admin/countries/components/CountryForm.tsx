'use client';

import type { SaveCountryRequest, SessionLanguage } from '@contenster/shared';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useValidationRules } from '@/hooks';
import { FormInput, FormSwitch, TranslationsFields } from '@/shared';

interface CountryFormProps {
  languages: SessionLanguage[];
}

export function CountryForm({ languages }: CountryFormProps) {
  const t = useTranslations('protected.countries');
  const { createValidationRules } = useValidationRules<SaveCountryRequest>();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
      }}
    >
      <Box sx={{ gridColumn: { md: '1 / -1' } }}>
        <TranslationsFields<SaveCountryRequest>
          label={t('name')}
          languages={languages}
          name="translations"
          rules={createValidationRules('required|max_length[150]')}
          textProperty="name"
        />
      </Box>
      <FormInput<SaveCountryRequest>
        label={t('iso2')}
        name="iso2"
        rules={createValidationRules('required|exact_length[2]')}
      />
      <FormInput<SaveCountryRequest>
        label={t('iso3')}
        name="iso3"
        rules={createValidationRules('exact_length[3]')}
      />
      <FormInput<SaveCountryRequest>
        label={t('phone_code')}
        name="phoneCode"
        rules={createValidationRules('max_length[10]')}
      />
      <FormInput<SaveCountryRequest>
        label={t('currency_code')}
        name="currencyCode"
        rules={createValidationRules('exact_length[3]')}
      />
      <FormInput<SaveCountryRequest>
        label={t('locale')}
        name="locale"
        rules={createValidationRules('max_length[10]')}
      />
      <Box sx={{ alignSelf: 'center' }}>
        <FormSwitch<SaveCountryRequest> label={t('is_active')} name="isActive" />
      </Box>
    </Box>
  );
}
