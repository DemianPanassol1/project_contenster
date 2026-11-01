'use client';

import type { GetCountryByIdResponse, SaveCountryRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { crudListPath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { CountryForm } from '../components/CountryForm';
import {
  getCountryDefaultValues,
  mapCountryContent,
  mapCountryPayload,
} from '../utils/country.utils';

const COUNTRY_FORM_ID = 'country-form';

export function CountrySaveView({
  entityId,
  functionalitySlug,
  presentation,
}: AdminFeatureViewProps) {
  const router = useRouter();
  const t = useTranslations('protected.countries');
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
            form={COUNTRY_FORM_ID}
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
      <FormWrapper<SaveCountryRequest>
        contentUrl={isEditing ? API_ROUTES.ADMIN.GET_COUNTRY(entityId) : undefined}
        fields={getCountryDefaultValues(presentation.languages)}
        id={COUNTRY_FORM_ID}
        mapContent={(content) =>
          mapCountryContent(content as GetCountryByIdResponse, presentation.languages)
        }
        onSubmit={async (values) =>
          (
            await apiRequest<GetCountryByIdResponse>({
              body: mapCountryPayload(values),
              endpoint: API_ROUTES.ADMIN.POST_COUNTRY,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <CountryForm languages={presentation.languages} />
      </FormWrapper>
    </Page>
  );
}
