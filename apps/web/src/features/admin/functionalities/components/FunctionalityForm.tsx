'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import {
  FUNCTIONALITY_CATALOG,
  type SaveFunctionalityRequest,
  type SessionLanguage,
} from '@contenster/shared';
import { useValidationRules } from '@/hooks';
import { API_ROUTES } from '@/routes';
import { FormIconSelect, FormInput, FormSelect, FormSwitch, TranslationsFields } from '@/shared';

const OPTIONS_BODY = {
  isOptional: false,
  pagination: { filters: [], page: 1, perPage: 1000, sort: [] },
} as const;

interface FunctionalityFormProps {
  languages: SessionLanguage[];
}

export function FunctionalityForm({ languages }: FunctionalityFormProps) {
  const t = useTranslations('protected.functionalities');
  const { createValidationRules } = useValidationRules<SaveFunctionalityRequest>();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
      }}
    >
      <TranslationsFields<SaveFunctionalityRequest>
        label={t('name')}
        languages={languages}
        name="translations"
        rules={createValidationRules('required|max_length[150]')}
        textProperty="name"
      />
      <FormSelect<SaveFunctionalityRequest>
        label={t('module')}
        name="moduleId"
        optionsBody={OPTIONS_BODY}
        optionsEndpoint={API_ROUTES.ADMIN.POST_FUNCTIONALITY_MODULE_OPTIONS}
        optionsMethod="POST"
        revalidateOptions
        rules={createValidationRules('required|greater_than[0]')}
      />
      <TranslationsFields<SaveFunctionalityRequest>
        label={t('description')}
        languages={languages}
        name="translations"
        sx={{ gridColumn: { md: '1 / -1' } }}
        textProperty="description"
        type="textarea"
      />
      <FormSelect<SaveFunctionalityRequest>
        label={t('slug')}
        name="slug"
        options={FUNCTIONALITY_CATALOG.map((functionality) => ({
          label: functionality.slug,
          value: functionality.slug,
        }))}
        rules={createValidationRules('required')}
      />
      <FormIconSelect<SaveFunctionalityRequest> label={t('icon')} name="icon" />
      <FormSelect<SaveFunctionalityRequest>
        label={t('parent')}
        name="parentId"
        optionsBody={OPTIONS_BODY}
        optionsEndpoint={API_ROUTES.ADMIN.POST_FUNCTIONALITY_PARENT_OPTIONS}
        optionsMethod="POST"
        revalidateOptions
      />
      <FormInput<SaveFunctionalityRequest>
        label={t('order')}
        name="order"
        rules={createValidationRules('required|integer')}
        slotProps={{ htmlInput: { step: 1 } }}
        type="number"
      />
      <FormSwitch<SaveFunctionalityRequest>
        label={t('is_navigation_group')}
        name="isNavigationGroup"
      />
      <FormSwitch<SaveFunctionalityRequest> label={t('is_active')} name="isActive" />
    </Box>
  );
}
