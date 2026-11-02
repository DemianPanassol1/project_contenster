'use client';

import { useTranslations } from 'next-intl';

import {
  type GetAccessModelByIdResponse,
  parseAccessModelStructure,
  type SaveAccessModelRequest,
} from '@contenster/shared';
import { useGlobalContext } from '@/core/providers';
import { useToast } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { useSystemAdminLanguages } from '../../shared/hooks/useSystemAdminLanguages';
import { AccessModelForm, type AccessModelFormValues } from '../components/AccessModelForm';
import {
  getAccessModelDefaultValues,
  mapAccessModelContent,
  mapAccessModelPayload,
} from '../utils/access-model.utils';

const FORM_ID = 'access-model-form';

export function SystemAdminAccessModelSaveView({ id }: { id: number | null }) {
  const t = useTranslations('protected.access_models');
  const { errorMessage } = useToast();
  const { apiRequest } = useGlobalContext();
  const router = useRouter();
  const { languages } = useSystemAdminLanguages();
  const isEditing = id !== null;
  const fields = getAccessModelDefaultValues(languages);

  return (
    <Page
      module={t('module')}
      functionality={isEditing ? t('edit_title') : t('create_title')}
      actions={
        <>
          <Button
            icon="arrow-left"
            iconPosition="start"
            label={t('back')}
            variant="outlined"
            onClick={() => router.push('/system-admin/access-models')}
          />
          <Button form={FORM_ID} icon="save" iconPosition="start" label={t('save')} type="submit" />
        </>
      }
    >
      <FormWrapper<AccessModelFormValues>
        id={FORM_ID}
        fields={fields}
        contentUrl={isEditing ? API_ROUTES.SYSTEM_ADMIN.GET_ACCESS_MODEL(id) : undefined}
        mapContent={(content) =>
          mapAccessModelContent(content as GetAccessModelByIdResponse, languages)
        }
        onSubmit={async (values) => {
          const payload = mapAccessModelPayload(values);
          let structure: SaveAccessModelRequest['structure'];

          try {
            structure = parseAccessModelStructure(payload.structure);
          } catch {
            errorMessage(t('invalid_json'));
            return false;
          }

          return (
            await apiRequest({
              method: 'POST',
              endpoint: API_ROUTES.SYSTEM_ADMIN.POST_ACCESS_MODEL,
              successMessage: t('save_success'),
              body: {
                id: payload.id,
                isActive: payload.isActive,
                translations: payload.translations,
                structure,
              },
              onSuccess: () => router.push('/system-admin/access-models'),
            })
          ).success;
        }}
      >
        <AccessModelForm languages={languages} initiallyExpandFirstModule={!isEditing} />
      </FormWrapper>
    </Page>
  );
}
