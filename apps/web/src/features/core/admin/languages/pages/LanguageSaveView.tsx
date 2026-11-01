'use client';

import type { GetLanguageByIdResponse, SaveLanguageRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { crudListPath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { LanguageForm } from '../components/LanguageForm';
import {
  getLanguageDefaultValues,
  mapLanguageContent,
  mapLanguagePayload,
} from '../utils/language.utils';

const LANGUAGE_FORM_ID = 'language-form';

export function LanguageSaveView({
  entityId,
  functionalitySlug,
  presentation,
}: AdminFeatureViewProps) {
  const router = useRouter();
  const t = useTranslations('protected.languages');
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
            form={LANGUAGE_FORM_ID}
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
      <FormWrapper<SaveLanguageRequest>
        contentUrl={isEditing ? API_ROUTES.ADMIN.GET_LANGUAGE(entityId) : undefined}
        fields={getLanguageDefaultValues()}
        id={LANGUAGE_FORM_ID}
        mapContent={(content) => mapLanguageContent(content as GetLanguageByIdResponse)}
        onSubmit={async (values) =>
          (
            await apiRequest<GetLanguageByIdResponse>({
              body: mapLanguagePayload(values),
              endpoint: API_ROUTES.ADMIN.POST_LANGUAGE,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <LanguageForm />
      </FormWrapper>
    </Page>
  );
}
