'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { FieldPath } from 'react-hook-form';

import { type DocumentType, documentTypeDictionary } from '@contenster/shared';
import { useValidationRules } from '@/hooks';
import { API_ROUTES } from '@/routes';
import { FormImageUpload, FormInput, FormMaskedInput, FormSelect } from '@/shared';

import type { ClientFormValues } from '../types/client-form.types';
import { getDocumentValidationRules } from '../utils/client.utils';

const OPTIONS_BODY = {
  isOptional: false,
  pagination: { filters: [], page: 1, perPage: 1000, sort: [] },
} as const;

interface ClientFormProps {
  cityOptionsEndpoint?: string;
  documentType: DocumentType;
  languageOptionsEndpoint?: string;
}

const clientField = <_TForm extends ClientFormValues>(name: keyof ClientFormValues) =>
  name as FieldPath<_TForm>;

export function ClientForm<TForm extends ClientFormValues = ClientFormValues>({
  cityOptionsEndpoint = API_ROUTES.ADMIN.POST_CLIENT_CITY_OPTIONS,
  documentType,
  languageOptionsEndpoint = API_ROUTES.ADMIN.POST_CLIENT_LANGUAGE_OPTIONS,
}: ClientFormProps) {
  const t = useTranslations('protected.clients');
  const tEnum = useTranslations();
  const { createValidationRules } = useValidationRules<TForm>();

  return (
    <Box sx={{ display: 'grid', gap: '1.5rem 2rem' }}>
      <Box
        sx={{
          display: 'grid',
          gap: '1.5rem 2rem',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <FormInput<TForm>
          label={t('trade_name')}
          name={clientField<TForm>('tradeName')}
          rules={createValidationRules('required|max_length[150]')}
        />
        <FormInput<TForm>
          label={t('corporate_name')}
          name={clientField<TForm>('corporateName')}
          rules={createValidationRules('required|max_length[150]')}
        />
        <FormSelect<TForm>
          label={t('document_type')}
          name={clientField<TForm>('documentType')}
          options={Object.entries(documentTypeDictionary).map(([value, translationKey]) => ({
            label: tEnum(translationKey),
            value,
          }))}
          rules={createValidationRules('required')}
        />
        <FormMaskedInput<TForm>
          label={t('document')}
          maskType={documentType}
          name={clientField<TForm>('document')}
          rules={createValidationRules(getDocumentValidationRules(documentType))}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: '1.5rem 2rem',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        }}
      >
        <FormInput<TForm>
          label={t('email')}
          name={clientField<TForm>('email')}
          rules={createValidationRules('required|email|max_length[150]')}
          type="email"
        />
        <FormMaskedInput<TForm>
          label={t('primary_phone')}
          maskType="phone"
          name={clientField<TForm>('primaryPhone')}
          phoneCountry="BR"
          phonePrefixes={{ BR: '55', ES: '34', US: '1' }}
          rules={createValidationRules('required|phone|max_length[30]')}
        />
        <FormMaskedInput<TForm>
          label={t('secondary_phone')}
          maskType="phone"
          name={clientField<TForm>('secondaryPhone')}
          phoneCountry="BR"
          phonePrefixes={{ BR: '55', ES: '34', US: '1' }}
          rules={createValidationRules('phone|max_length[30]')}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: '1.5rem 2rem',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
        }}
      >
        <Box sx={{ gridColumn: { md: 'span 7' } }}>
          <FormInput<TForm>
            label={t('address')}
            name={clientField<TForm>('address')}
            rules={createValidationRules('required|max_length[150]')}
          />
        </Box>
        <Box sx={{ gridColumn: { md: 'span 2' } }}>
          <FormInput<TForm>
            label={t('address_number')}
            name={clientField<TForm>('addressNumber')}
            rules={createValidationRules('required|max_length[20]')}
          />
        </Box>
        <Box sx={{ gridColumn: { md: 'span 3' } }}>
          <FormInput<TForm>
            label={t('neighborhood')}
            name={clientField<TForm>('neighborhood')}
            rules={createValidationRules('required|max_length[100]')}
          />
        </Box>
        <Box sx={{ gridColumn: { md: 'span 3' } }}>
          <FormMaskedInput<TForm>
            label={t('zip_code')}
            maskType="cep"
            name={clientField<TForm>('zipCode')}
            rules={createValidationRules('required|cep')}
          />
        </Box>
        <Box sx={{ gridColumn: { md: 'span 9' } }}>
          <FormSelect<TForm>
            label={t('city')}
            name={clientField<TForm>('cityId')}
            optionsBody={OPTIONS_BODY}
            optionsEndpoint={cityOptionsEndpoint}
            optionsMethod="POST"
            revalidateOptions
          />
        </Box>
      </Box>

      <FormSelect<TForm>
        label={t('languages')}
        multiple
        name={clientField<TForm>('languageIds')}
        optionsBody={OPTIONS_BODY}
        optionsEndpoint={languageOptionsEndpoint}
        optionsMethod="POST"
        revalidateOptions
        rules={createValidationRules('required')}
      />
      <FormImageUpload<TForm>
        accept="image/*"
        label={t('image')}
        name={clientField<TForm>('imageId')}
      />
    </Box>
  );
}
