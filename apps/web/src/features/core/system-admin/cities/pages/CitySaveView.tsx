'use client';
import type { GetCityByIdResponse, SaveCityRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { useSystemAdminLanguages } from '../../shared/hooks/useSystemAdminLanguages';
import { CityForm } from '../components/CityForm';
import { getCityDefaultValues, mapCityContent, mapCityPayload } from '../utils/city.utils';

const CITY_FORM_ID = 'city-form';

export function SystemAdminCitySaveView({ id }: { id: number | null }) {
  const router = useRouter();
  const t = useTranslations('protected.cities');
  const { apiRequest } = useGlobalContext();
  const tSystem = useTranslations('protected.system_admin');
  const { languages } = useSystemAdminLanguages();
  const isEditing = id !== null;
  const listPath = '/system-admin/cities';

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
            form={CITY_FORM_ID}
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
      <FormWrapper<SaveCityRequest>
        contentUrl={isEditing ? API_ROUTES.SYSTEM_ADMIN.GET_CITY(id) : undefined}
        fields={getCityDefaultValues(languages)}
        id={CITY_FORM_ID}
        mapContent={(content) => mapCityContent(content as GetCityByIdResponse, languages)}
        onSubmit={async (values) =>
          (
            await apiRequest<GetCityByIdResponse>({
              body: mapCityPayload(values),
              endpoint: API_ROUTES.SYSTEM_ADMIN.POST_CITY,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <CityForm
          languages={languages}
          stateOptionsEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_CITY_STATE_OPTIONS}
        />
      </FormWrapper>
    </Page>
  );
}
