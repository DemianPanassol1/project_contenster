'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { DocumentType } from '@contenster/shared';
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
  documentType: DocumentType;
}

export function ClientForm({ documentType }: ClientFormProps) {
  const t = useTranslations('protected.clients');
  const { createValidationRules } = useValidationRules<ClientFormValues>();

  return (
    <Box sx={{ display: 'grid', gap: '1.5rem 2rem' }}>
      <Box
        sx={{
          display: 'grid',
          gap: '1.5rem 2rem',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <FormInput<ClientFormValues>
          label={t('trade_name')}
          name="tradeName"
          rules={createValidationRules('required|max_length[150]')}
        />
        <FormInput<ClientFormValues>
          label={t('corporate_name')}
          name="corporateName"
          rules={createValidationRules('required|max_length[150]')}
        />
        <FormSelect<ClientFormValues>
          label={t('document_type')}
          name="documentType"
          options={Object.values(DocumentType).map((value) => ({
            label: value.toUpperCase(),
            value,
          }))}
          rules={createValidationRules('required')}
        />
        <FormMaskedInput<ClientFormValues>
          label={t('document')}
          maskType={documentType}
          name="document"
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
        <FormInput<ClientFormValues>
          label={t('email')}
          name="email"
          rules={createValidationRules('required|email|max_length[150]')}
          type="email"
        />
        <FormMaskedInput<ClientFormValues>
          label={t('primary_phone')}
          maskType="phone"
          name="primaryPhone"
          phoneCountry="BR"
          phonePrefixes={{ BR: '55', ES: '34', US: '1' }}
          rules={createValidationRules('required|phone|max_length[30]')}
        />
        <FormMaskedInput<ClientFormValues>
          label={t('secondary_phone')}
          maskType="phone"
          name="secondaryPhone"
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
          <FormInput<ClientFormValues>
            label={t('address')}
            name="address"
            rules={createValidationRules('required|max_length[150]')}
          />
        </Box>
        <Box sx={{ gridColumn: { md: 'span 2' } }}>
          <FormInput<ClientFormValues>
            label={t('address_number')}
            name="addressNumber"
            rules={createValidationRules('required|max_length[20]')}
          />
        </Box>
        <Box sx={{ gridColumn: { md: 'span 3' } }}>
          <FormInput<ClientFormValues>
            label={t('neighborhood')}
            name="neighborhood"
            rules={createValidationRules('required|max_length[100]')}
          />
        </Box>
        <Box sx={{ gridColumn: { md: 'span 3' } }}>
          <FormMaskedInput<ClientFormValues>
            label={t('zip_code')}
            maskType="cep"
            name="zipCode"
            rules={createValidationRules('required|cep')}
          />
        </Box>
        <Box sx={{ gridColumn: { md: 'span 9' } }}>
          <FormSelect<ClientFormValues>
            label={t('city')}
            name="cityId"
            optionsBody={OPTIONS_BODY}
            optionsEndpoint={API_ROUTES.ADMIN.POST_CLIENT_CITY_OPTIONS}
            optionsMethod="POST"
            revalidateOptions
          />
        </Box>
      </Box>

      <FormSelect<ClientFormValues>
        label={t('languages')}
        multiple
        name="languageIds"
        optionsBody={OPTIONS_BODY}
        optionsEndpoint={API_ROUTES.ADMIN.POST_CLIENT_LANGUAGE_OPTIONS}
        optionsMethod="POST"
        revalidateOptions
        rules={createValidationRules('required')}
      />
      <FormImageUpload<ClientFormValues> accept="image/*" label={t('image')} name="imageId" />
    </Box>
  );
}
