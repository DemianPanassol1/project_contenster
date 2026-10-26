'use client';

import type { SaveCityRequest, SessionLanguage } from '@contenster/shared';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useValidationRules } from '@/hooks';
import { API_ROUTES } from '@/routes';
import { FormInput, FormSelect, FormSwitch, TranslationsFields } from '@/shared';

const STATE_OPTIONS_BODY = {
  isOptional: false,
  pagination: { filters: [], page: 1, perPage: 1000, sort: [] },
} as const;

interface CityFormProps {
  languages: SessionLanguage[];
}

export function CityForm({ languages }: CityFormProps) {
  const t = useTranslations('protected.cities');
  const { createValidationRules } = useValidationRules<SaveCityRequest>();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      <TranslationsFields<SaveCityRequest>
        label={t('name')}
        languages={languages}
        name="translations"
        rules={createValidationRules('required|max_length[150]')}
        textProperty="name"
      />
      <FormSelect<SaveCityRequest>
        label={t('state')}
        name="stateId"
        optionsBody={STATE_OPTIONS_BODY}
        optionsEndpoint={API_ROUTES.ADMIN.POST_CITY_STATE_OPTIONS}
        optionsMethod="POST"
        revalidateOptions
        rules={createValidationRules('required|greater_than[0]')}
      />
      <FormInput<SaveCityRequest>
        label={t('ibge_code')}
        name="ibgeCode"
        rules={createValidationRules('max_length[20]')}
      />
      <FormSwitch<SaveCityRequest> label={t('is_active')} name="isActive" />
    </Box>
  );
}
