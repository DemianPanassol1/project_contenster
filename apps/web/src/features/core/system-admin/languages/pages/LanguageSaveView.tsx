'use client';

import type { GetLanguageByIdResponse, SaveLanguageRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { LanguageForm } from '../components/LanguageForm';
import {
  getLanguageDefaultValues,
  mapLanguageContent,
  mapLanguagePayload,
} from '../utils/language.utils';

const LANGUAGE_FORM_ID = 'language-form';

export function SystemAdminLanguageSaveView({ id }: { id: number | null }) {
  const router = useRouter();
  const t = useTranslations('protected.languages');
  const tSystem = useTranslations('protected.system_admin');
  const { apiRequest } = useGlobalContext();
  const isEditing = id !== null;
  const listPath = '/system-admin/languages';
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
      functionality={
        isEditing
          ? t('edit_title', { functionality: t('title') })
          : t('create_title', { functionality: t('title') })
      }
      module={tSystem('module')}
    >
      <FormWrapper<SaveLanguageRequest>
        contentUrl={isEditing ? API_ROUTES.SYSTEM_ADMIN.GET_LANGUAGE(id) : undefined}
        fields={getLanguageDefaultValues()}
        id={LANGUAGE_FORM_ID}
        mapContent={(content) => mapLanguageContent(content as GetLanguageByIdResponse)}
        onSubmit={async (values) =>
          (
            await apiRequest<GetLanguageByIdResponse>({
              body: mapLanguagePayload(values),
              endpoint: API_ROUTES.SYSTEM_ADMIN.POST_LANGUAGE,
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
