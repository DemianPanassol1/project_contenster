'use client';

import { Alert, Box, Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useWatch } from 'react-hook-form';

import { type DocumentType, type SessionLanguage } from '@contenster/shared';
import { portalFontSize } from '@/core/theme';
import { ClientForm } from '@/features/core/admin/clients/components/ClientForm';
import { useValidationRules } from '@/hooks';
import { API_ROUTES } from '@/routes';
import { Chip, FormSwitch, TranslationsFields } from '@/shared';

import type { SystemAdminClientFormValues } from '../types/system-admin-client-form.types';

import { SystemAdminClientStorageEditor } from './SystemAdminClientStorageEditor';

interface SystemAdminClientFormProps {
  languages: SessionLanguage[];
}

function FormSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Box>
      <Box sx={{ mb: 1.5, px: { sm: 1, xs: 0 } }}>
        <Typography sx={{ color: 'text.primary', fontSize: portalFontSize(14), fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: portalFontSize(12.5), mt: 0.5 }}>
          {description}
        </Typography>
      </Box>
      <Paper elevation={1} square={false} sx={{ px: { sm: 3, xs: 2 }, py: 2.5 }}>
        {children}
      </Paper>
    </Box>
  );
}

export function SystemAdminClientForm({ languages }: SystemAdminClientFormProps) {
  const t = useTranslations('protected.system_admin.clients');
  const tProfiles = useTranslations('protected.profiles');
  const { createValidationRules } = useValidationRules<SystemAdminClientFormValues>();
  const documentType = useWatch<SystemAdminClientFormValues>({
    name: 'documentType',
  }) as DocumentType;
  const languageIds =
    (useWatch<SystemAdminClientFormValues>({ name: 'languageIds' }) as number[] | undefined) ?? [];
  const enabledLanguages = languages.filter((language) => languageIds.includes(language.id));

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <FormSection description={t('client_section_description')} title={t('client_section_title')}>
        <ClientForm<SystemAdminClientFormValues>
          cityOptionsEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_CLIENT_CITY_OPTIONS}
          documentType={documentType}
          languageOptionsEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_CLIENT_LANGUAGE_OPTIONS}
        />
      </FormSection>

      <FormSection
        description={t('administrator_section_description')}
        title={t('administrator_section_title')}
      >
        {enabledLanguages.length ? (
          <Box
            sx={{
              display: 'grid',
              gap: '1.5rem 2rem',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            }}
          >
            <TranslationsFields<SystemAdminClientFormValues>
              label={tProfiles('name')}
              languages={enabledLanguages}
              name="adminProfileTranslations"
              rules={createValidationRules('required|max_length[150]')}
              textProperty="name"
            />

            <Box sx={{ alignItems: 'center', display: 'flex', gap: 1 }}>
              <Chip color="info" label={tProfiles('administrator')} />
              <FormSwitch<SystemAdminClientFormValues>
                disabled
                label={tProfiles('is_active')}
                name="adminProfileIsActive"
              />
            </Box>

            <TranslationsFields<SystemAdminClientFormValues>
              label={tProfiles('description')}
              languages={enabledLanguages}
              name="adminProfileTranslations"
              sx={{ gridColumn: { md: '1 / -1' } }}
              textProperty="description"
              type="textarea"
            />
          </Box>
        ) : (
          <Alert severity="info">{t('administrator_languages_helper')}</Alert>
        )}
      </FormSection>

      <FormSection
        description={t('storage_section_description')}
        title={t('storage_section_title')}
      >
        <SystemAdminClientStorageEditor />
      </FormSection>
    </Box>
  );
}
