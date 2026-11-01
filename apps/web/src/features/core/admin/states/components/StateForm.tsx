'use client';

import type { SaveStateRequest, SessionLanguage } from '@contenster/shared';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useValidationRules } from '@/hooks';
import { API_ROUTES } from '@/routes';
import { FormInput, FormSelect, FormSwitch, TranslationsFields } from '@/shared';

const COUNTRY_OPTIONS_BODY = {
  isOptional: false,
  pagination: { filters: [], page: 1, perPage: 1000, sort: [] },
} as const;

interface StateFormProps {
  languages: SessionLanguage[];
}

export function StateForm({ languages }: StateFormProps) {
  const t = useTranslations('protected.states');
  const { createValidationRules } = useValidationRules<SaveStateRequest>();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      <TranslationsFields<SaveStateRequest>
        label={t('name')}
        languages={languages}
        name="translations"
        rules={createValidationRules('required|max_length[150]')}
        textProperty="name"
      />
      <FormSelect<SaveStateRequest>
        label={t('country')}
        name="countryId"
        optionsBody={COUNTRY_OPTIONS_BODY}
        optionsEndpoint={API_ROUTES.ADMIN.POST_STATE_COUNTRY_OPTIONS}
        optionsMethod="POST"
        revalidateOptions
        rules={createValidationRules('required|greater_than[0]')}
      />
      <FormInput<SaveStateRequest>
        label={t('code')}
        name="code"
        rules={createValidationRules('required|max_length[20]')}
      />
      <FormSwitch<SaveStateRequest> label={t('is_active')} name="isActive" />
    </Box>
  );
}
