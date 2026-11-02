'use client';

import type { GetCountryByIdResponse, SaveCountryRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { useSystemAdminLanguages } from '../../shared/hooks/useSystemAdminLanguages';
import { CountryForm } from '../components/CountryForm';
import {
  getCountryDefaultValues,
  mapCountryContent,
  mapCountryPayload,
} from '../utils/country.utils';

const COUNTRY_FORM_ID = 'country-form';

export function SystemAdminCountrySaveView({ id }: { id: number | null }) {
  const router = useRouter();
  const t = useTranslations('protected.countries');
  const { apiRequest } = useGlobalContext();
  const tSystem = useTranslations('protected.system_admin');
  const { languages } = useSystemAdminLanguages();
  const isEditing = id !== null;
  const listPath = '/system-admin/countries';
  return (
    <Page
      actions={
        <>
          <Button
            icon="arrow-left"
            iconPosition="start"
            label={t('go_back')}
            variant="outlined"
            onClick={() => router.push(listPath)}
          />
          <Button
            form={COUNTRY_FORM_ID}
            icon="save"
            iconPosition="start"
            label={t('save')}
            type="submit"
          />
        </>
      }
      functionality={
        isEditing
          ? t('edit_title', { functionality: t('title') })
          : t('create_title', { functionality: t('title') })
      }
      module={tSystem('module')}
    >
      <FormWrapper<SaveCountryRequest>
        contentUrl={isEditing ? API_ROUTES.SYSTEM_ADMIN.GET_COUNTRY(id) : undefined}
        fields={getCountryDefaultValues(languages)}
        id={COUNTRY_FORM_ID}
        mapContent={(content) => mapCountryContent(content as GetCountryByIdResponse, languages)}
        onSubmit={async (values) =>
          (
            await apiRequest<GetCountryByIdResponse>({
              body: mapCountryPayload(values),
              endpoint: API_ROUTES.SYSTEM_ADMIN.POST_COUNTRY,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <CountryForm languages={languages} />
      </FormWrapper>
    </Page>
  );
}
