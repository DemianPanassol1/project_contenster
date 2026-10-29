'use client';

import { Box, FormHelperText } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useWatch } from 'react-hook-form';

import { FUNCTIONALITY_CATALOG, type SessionLanguage } from '@contenster/shared';
import { useValidationRules } from '@/hooks';
import { API_ROUTES } from '@/routes';
import { FormCheckbox, FormIconSelect, FormInput, FormSelect, TranslationsFields } from '@/shared';

import type { FunctionalityFormValues } from '../types/functionality-form.types';

const OPTIONS_BODY = {
  isOptional: false,
  pagination: { filters: [], page: 1, perPage: 1000, sort: [] },
} as const;

interface FunctionalityFormProps {
  languages: SessionLanguage[];
}

export function FunctionalityForm({ languages }: FunctionalityFormProps) {
  const t = useTranslations('protected.functionalities');
  const { createValidationRules } = useValidationRules<FunctionalityFormValues>();
  const languageIds = (useWatch<FunctionalityFormValues>({ name: 'languageIds' }) ??
    []) as number[];
  const enabledLanguages = languages.filter((language) => languageIds.includes(language.id));

  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1.5rem 2rem',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      <FormSelect<FunctionalityFormValues>
        label={t('module')}
        name="moduleId"
        optionsBody={OPTIONS_BODY}
        optionsEndpoint={API_ROUTES.ADMIN.POST_FUNCTIONALITY_MODULE_OPTIONS}
        optionsMethod="POST"
        revalidateOptions
        rules={createValidationRules('required|greater_than[0]')}
      />
      <FormSelect<FunctionalityFormValues>
        label={t('slug')}
        name="slug"
        options={FUNCTIONALITY_CATALOG.map((functionality) => ({
          label: functionality.slug,
          value: functionality.slug,
        }))}
        rules={createValidationRules('required')}
      />
      <TranslationsFields<FunctionalityFormValues>
        label={t('name')}
        languages={enabledLanguages}
        name="translations"
        rules={createValidationRules('required|max_length[150]')}
        sx={{ gridColumn: { md: 'span 1' } }}
        textProperty="name"
      />
      <Box sx={{ display: 'grid', gap: '1.5rem 2rem', gridTemplateColumns: '1fr 1fr' }}>
        <FormIconSelect<FunctionalityFormValues> label={t('icon')} name="icon" />
        <FormInput<FunctionalityFormValues>
          label={t('order')}
          name="order"
          rules={createValidationRules('required|integer')}
          type="number"
        />
      </Box>
      <TranslationsFields<FunctionalityFormValues>
        label={t('description')}
        languages={enabledLanguages}
        name="translations"
        sx={{ gridColumn: { md: '1 / -1' } }}
        textProperty="description"
        type="textarea"
      />
      <Box
        sx={{
          display: 'grid',
          gap: '1.5rem 2rem',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
          gridColumn: '1 / -1',
        }}
      >
        <FormSelect<FunctionalityFormValues>
          label={t('parent')}
          name="parentId"
          optionsBody={OPTIONS_BODY}
          optionsEndpoint={API_ROUTES.ADMIN.POST_FUNCTIONALITY_PARENT_OPTIONS}
          optionsMethod="POST"
          revalidateOptions
        />
        <FormSelect<FunctionalityFormValues>
          label={t('enabled_languages')}
          multiple
          name="languageIds"
          optionsBody={OPTIONS_BODY}
          optionsEndpoint={API_ROUTES.ADMIN.POST_FUNCTIONALITY_LANGUAGE_OPTIONS}
          optionsMethod="POST"
          revalidateOptions
          rules={createValidationRules('required')}
        />
      </Box>
      <Box sx={{ gridColumn: { md: '1 / -1' } }}>
        <FormCheckbox<FunctionalityFormValues> label={t('is_active')} name="isActive" />
        <FormCheckbox<FunctionalityFormValues>
          label={t('is_navigation_group')}
          name="isNavigationGroup"
        />
        <FormHelperText sx={{ color: 'text.secondary', fontSize: 12, m: '3px 0 4px' }}>
          {t('navigation_group_helper')}
        </FormHelperText>
      </Box>
    </Box>
  );
}
