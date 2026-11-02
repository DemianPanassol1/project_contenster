'use client';

import type { GetActionByIdResponse, SaveActionRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { useSystemAdminLanguages } from '../../shared/hooks/useSystemAdminLanguages';
import { ActionForm } from '../components/ActionForm';
import { getActionDefaultValues, mapActionContent, mapActionPayload } from '../utils/action.utils';

const ACTION_FORM_ID = 'action-form';

export function SystemAdminActionSaveView({ id }: { id: number | null }) {
  const router = useRouter();
  const t = useTranslations('protected.actions');
  const tSystem = useTranslations('protected.system_admin');
  const { apiRequest } = useGlobalContext();
  const { languages } = useSystemAdminLanguages();
  const isEditing = id !== null;
  const listPath = '/system-admin/actions';

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
            form={ACTION_FORM_ID}
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
      <FormWrapper<SaveActionRequest>
        contentUrl={isEditing ? API_ROUTES.SYSTEM_ADMIN.GET_ACTION(id) : undefined}
        fields={getActionDefaultValues(languages)}
        id={ACTION_FORM_ID}
        mapContent={(content) => mapActionContent(content as GetActionByIdResponse, languages)}
        onSubmit={async (values) =>
          (
            await apiRequest<GetActionByIdResponse>({
              body: mapActionPayload(values),
              endpoint: API_ROUTES.SYSTEM_ADMIN.POST_ACTION,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <ActionForm languages={languages} />
      </FormWrapper>
    </Page>
  );
}
