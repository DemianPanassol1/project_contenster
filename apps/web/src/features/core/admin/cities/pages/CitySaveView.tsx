'use client';
import type { GetCityByIdResponse, SaveCityRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { crudListPath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { CityForm } from '../components/CityForm';
import { getCityDefaultValues, mapCityContent, mapCityPayload } from '../utils/city.utils';

const CITY_FORM_ID = 'city-form';

export function CitySaveView({ entityId, functionalitySlug, presentation }: AdminFeatureViewProps) {
  const router = useRouter();
  const t = useTranslations('protected.cities');
  const { apiRequest } = useGlobalContext();
  const isEditing = entityId !== null;
  const listPath = crudListPath(functionalitySlug);

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
      description={presentation.description ?? undefined}
      functionality={
        isEditing
          ? t('edit_title', { functionality: presentation.functionalityName })
          : t('create_title', { functionality: presentation.functionalityName })
      }
      module={presentation.moduleName}
    >
      <FormWrapper<SaveCityRequest>
        contentUrl={isEditing ? API_ROUTES.ADMIN.GET_CITY(entityId) : undefined}
        fields={getCityDefaultValues(presentation.languages)}
        id={CITY_FORM_ID}
        mapContent={(content) =>
          mapCityContent(content as GetCityByIdResponse, presentation.languages)
        }
        onSubmit={async (values) =>
          (
            await apiRequest<GetCityByIdResponse>({
              body: mapCityPayload(values),
              endpoint: API_ROUTES.ADMIN.POST_CITY,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <CityForm languages={presentation.languages} />
      </FormWrapper>
    </Page>
  );
}
