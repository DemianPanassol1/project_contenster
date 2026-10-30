'use client';

import type { PortalDetail, SessionLanguage } from '@contenster/shared';
import { Alert, Paper, Skeleton, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useGlobalContext } from '@/core/providers';
import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { type SelectOption, useGET, usePOST } from '@/services/hooks';
import { Button, FormWrapper, Page } from '@/shared';

import { PortalForm } from '../components/PortalForm';
import type { PortalFormValues } from '../types/portal-form.types';
import { createPortalFormValues, mapPortalPayload } from '../types/portal-form.utils';

const PORTAL_FORM_ID = 'system-admin-portal-form';

const languageOptionsRequest = {
  isOptional: false,
  pagination: {
    filters: [],
    page: 1,
    perPage: 1000,
    sort: [{ direction: 'asc' as const, field: 'name' }],
  },
};

const toLanguages = (options: SelectOption[]): SessionLanguage[] =>
  options.flatMap((option) => {
    const locale = option.metadata?.locale;

    return typeof option.value === 'number' && typeof locale === 'string'
      ? [{ id: option.value, locale, name: option.label }]
      : [];
  });

export function SystemAdminPortalSaveView({ id }: { id: number | null }) {
  const router = useRouter();
  const t = useTranslations('protected.system_admin.portals');
  const tSystem = useTranslations('protected.system_admin');
  const { apiRequest } = useGlobalContext();
  const detailRequest = useGET<PortalDetail>(
    id === null ? null : API_ROUTES.SYSTEM_ADMIN.GET_PORTAL(id),
  );
  const languageOptionsRequestResult = usePOST<SelectOption[]>(
    API_ROUTES.SYSTEM_ADMIN.POST_PORTAL_LANGUAGE_OPTIONS,
    languageOptionsRequest,
  );
  const languages = useMemo(
    () =>
      languageOptionsRequestResult.data?.success
        ? toLanguages(languageOptionsRequestResult.data.body ?? [])
        : [],
    [languageOptionsRequestResult.data],
  );
  const detail = detailRequest.data?.success ? (detailRequest.data.body ?? null) : null;
  const isLoading =
    languageOptionsRequestResult.isLoading || (id !== null && detailRequest.isLoading);
  const hasError =
    Boolean(languageOptionsRequestResult.data && !languageOptionsRequestResult.data.success) ||
    Boolean(id !== null && detailRequest.data && !detailRequest.data.success);
  const formValues = useMemo(() => createPortalFormValues(languages, detail), [detail, languages]);

  return (
    <Page
      actions={
        <>
          <Button
            icon="arrow-left"
            iconPosition="start"
            label={t('go_back')}
            variant="outlined"
            onClick={() => router.push('/system-admin/portals')}
          />
          <Button
            form={PORTAL_FORM_ID}
            icon="save"
            iconPosition="start"
            label={t('save')}
            type="submit"
          />
        </>
      }
      description={t('save_description')}
      functionality={id === null ? t('create_title') : t('edit_title')}
      module={tSystem('module')}
    >
      {isLoading ? (
        <Paper elevation={1} square={false} sx={{ px: 2, py: 3 }}>
          <Stack spacing={1.5}>
            <Skeleton width="35%" />
            <Skeleton height={48} />
            <Skeleton height={280} />
          </Stack>
        </Paper>
      ) : hasError ? (
        <Alert severity="error">{t('detail_load_error')}</Alert>
      ) : (
        <FormWrapper<PortalFormValues>
          fields={formValues}
          id={PORTAL_FORM_ID}
          onSubmit={async (values) =>
            (
              await apiRequest<PortalDetail>({
                body: mapPortalPayload(values),
                endpoint: API_ROUTES.SYSTEM_ADMIN.POST_PORTAL,
                method: 'POST',
                onSuccess: () => router.push('/system-admin/portals'),
              })
            ).success
          }
          sx={{ overflow: 'hidden', p: 0 }}
        >
          <PortalForm languages={languages} />
        </FormWrapper>
      )}
    </Page>
  );
}
