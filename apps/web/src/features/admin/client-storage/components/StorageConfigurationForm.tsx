'use client';

import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { StorageProvider, type TestStorageConnectionResponse } from '@contenster/shared';
import { useGlobalContext } from '@/core/providers';
import { useValidationRules } from '@/hooks';
import { API_ROUTES } from '@/routes';
import {
  Button,
  FormInput,
  FormPasswordInput,
  FormSelect,
  FormSwitch,
  FormTextArea,
} from '@/shared';

import type { StorageConfigurationFormValues } from '../types/client-storage.types';
import {
  mapStorageConfigurationPayload,
  storageProviderOptions,
} from '../utils/client-storage.utils';

export function StorageConfigurationForm() {
  const t = useTranslations('protected.client_storage');
  const { apiRequest } = useGlobalContext();
  const { createValidationRules } = useValidationRules<StorageConfigurationFormValues>();
  const { control, getValues } = useFormContext<StorageConfigurationFormValues>();
  const provider = useWatch({ control, name: 'provider' });
  const useSignedUrls = useWatch({ control, name: 'useSignedUrls' });
  const hasCredential = useWatch({ control, name: 'hasCredential' });
  const shouldRequireCredentials = !hasCredential;
  const credentialHelperText = hasCredential ? t('credentials_already_registered') : undefined;

  const getCredentialRules = useCallback(
    (rules: string) =>
      shouldRequireCredentials
        ? createValidationRules(`required|${rules}`)
        : createValidationRules(rules),
    [createValidationRules, shouldRequireCredentials],
  );

  const testConnection = async () => {
    await apiRequest<TestStorageConnectionResponse>({
      body: mapStorageConfigurationPayload(getValues()),
      endpoint: API_ROUTES.ADMIN.POST_CLIENT_STORAGE_CONFIGURATION_TEST,
      method: 'POST',
      successMessage: t('connection_test_succeeded'),
    });
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { md: 'repeat(2, minmax(0, 1fr))', xs: '1fr' },
      }}
    >
      <FormInput<StorageConfigurationFormValues>
        label={t('fields.name')}
        name="name"
        rules={createValidationRules('required|max_length[100]')}
      />
      <FormSelect<StorageConfigurationFormValues>
        label={t('fields.provider')}
        name="provider"
        options={[...storageProviderOptions]}
        rules={createValidationRules('required')}
      />

      {provider === StorageProvider.local && (
        <Box sx={{ gridColumn: { md: '1 / -1' } }}>
          <FormInput<StorageConfigurationFormValues>
            label={t('fields.identifier')}
            name="identifier"
            rules={createValidationRules('required|max_length[150]')}
          />
        </Box>
      )}

      {provider === StorageProvider.cloudflareR2 && (
        <>
          <FormInput<StorageConfigurationFormValues>
            label={t('fields.bucket_name')}
            name="bucketName"
            rules={createValidationRules('required|max_length[150]')}
          />
          <FormInput<StorageConfigurationFormValues>
            label={t('fields.account_id')}
            name="accountId"
            rules={createValidationRules('max_length[150]')}
          />
          <Box sx={{ gridColumn: { md: '1 / -1' } }}>
            <FormInput<StorageConfigurationFormValues>
              label={t('fields.endpoint')}
              name="endpoint"
              rules={createValidationRules('max_length[255]')}
            />
          </Box>
          <FormPasswordInput<StorageConfigurationFormValues>
            helperText={credentialHelperText}
            label={t('fields.access_key_id')}
            name="accessKeyId"
            rules={getCredentialRules('max_length[255]')}
          />
          <FormPasswordInput<StorageConfigurationFormValues>
            helperText={credentialHelperText}
            label={t('fields.secret_access_key')}
            name="secretAccessKey"
            rules={getCredentialRules('max_length[255]')}
          />
        </>
      )}

      {provider === StorageProvider.googleCloudStorage && (
        <>
          <FormInput<StorageConfigurationFormValues>
            label={t('fields.bucket_name')}
            name="bucketName"
            rules={createValidationRules('required|max_length[150]')}
          />
          <FormInput<StorageConfigurationFormValues>
            label={t('fields.project_id')}
            name="projectId"
            rules={createValidationRules('required|max_length[150]')}
          />
          <Box sx={{ gridColumn: { md: '1 / -1' } }}>
            <FormPasswordInput<StorageConfigurationFormValues>
              helperText={credentialHelperText}
              label={t('fields.client_email')}
              name="clientEmail"
              rules={getCredentialRules('max_length[255]')}
            />
          </Box>
          <Box sx={{ gridColumn: { md: '1 / -1' } }}>
            <FormTextArea<StorageConfigurationFormValues>
              helperText={credentialHelperText}
              label={t('fields.private_key')}
              minRows={4}
              name="privateKey"
              rules={shouldRequireCredentials ? createValidationRules('required') : undefined}
            />
          </Box>
        </>
      )}

      {provider !== StorageProvider.local && (
        <>
          <Box sx={{ gridColumn: { md: '1 / -1' } }}>
            <FormInput<StorageConfigurationFormValues>
              label={t('fields.public_base_url')}
              name="publicBaseUrl"
              rules={createValidationRules('max_length[255]')}
            />
          </Box>
          <FormSwitch<StorageConfigurationFormValues>
            label={t('fields.use_signed_urls')}
            name="useSignedUrls"
          />
          {useSignedUrls && (
            <FormInput<StorageConfigurationFormValues>
              label={t('fields.signed_url_expires_in_seconds')}
              name="signedUrlExpiresInSeconds"
              rules={createValidationRules('required')}
              type="number"
            />
          )}
        </>
      )}

      <Box sx={{ gridColumn: { md: '1 / -1' } }}>
        <FormSwitch<StorageConfigurationFormValues> label={t('fields.is_active')} name="isActive" />
      </Box>

      <Box sx={{ gridColumn: { md: '1 / -1' } }}>
        <Button
          label={t('test_connection')}
          onClick={() => void testConnection()}
          variant="outlined"
        />
      </Box>
    </Box>
  );
}
