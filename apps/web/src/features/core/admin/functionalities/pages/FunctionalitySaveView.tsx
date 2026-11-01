'use client';

import type { GetFunctionalityByIdResponse } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { crudListPath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { FunctionalityForm } from '../components/FunctionalityForm';
import type { FunctionalityFormValues } from '../types/functionality-form.types';
import {
  getFunctionalityDefaultValues,
  mapFunctionalityContent,
  mapFunctionalityPayload,
} from '../utils/functionality.utils';

const FUNCTIONALITY_FORM_ID = 'functionality-form';

export function FunctionalitySaveView({
  entityId,
  functionalitySlug,
  presentation,
}: AdminFeatureViewProps) {
  const router = useRouter();
  const t = useTranslations('protected.functionalities');
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
            form={FUNCTIONALITY_FORM_ID}
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
      <FormWrapper<FunctionalityFormValues>
        contentUrl={isEditing ? API_ROUTES.ADMIN.GET_FUNCTIONALITY(entityId) : undefined}
        fields={getFunctionalityDefaultValues(presentation.languages)}
        id={FUNCTIONALITY_FORM_ID}
        mapContent={(content) =>
          mapFunctionalityContent(content as GetFunctionalityByIdResponse, presentation.languages)
        }
        onSubmit={async (values) =>
          (
            await apiRequest<GetFunctionalityByIdResponse>({
              body: mapFunctionalityPayload(values, presentation.languages),
              endpoint: API_ROUTES.ADMIN.POST_FUNCTIONALITY,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <FunctionalityForm languages={presentation.languages} />
      </FormWrapper>
    </Page>
  );
}
