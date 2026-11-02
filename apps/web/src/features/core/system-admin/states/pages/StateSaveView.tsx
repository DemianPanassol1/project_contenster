'use client';

import type { GetStateByIdResponse, SaveStateRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { useSystemAdminLanguages } from '../../shared/hooks/useSystemAdminLanguages';
import { StateForm } from '../components/StateForm';
import { getStateDefaultValues, mapStateContent, mapStatePayload } from '../utils/state.utils';

const STATE_FORM_ID = 'state-form';

export function SystemAdminStateSaveView({ id }: { id: number | null }) {
  const router = useRouter();
  const t = useTranslations('protected.states');
  const { apiRequest } = useGlobalContext();
  const tSystem = useTranslations('protected.system_admin');
  const { languages } = useSystemAdminLanguages();
  const isEditing = id !== null;
  const listPath = '/system-admin/states';

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
            form={STATE_FORM_ID}
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
      <FormWrapper<SaveStateRequest>
        contentUrl={isEditing ? API_ROUTES.SYSTEM_ADMIN.GET_STATE(id) : undefined}
        fields={getStateDefaultValues(languages)}
        id={STATE_FORM_ID}
        mapContent={(content) => mapStateContent(content as GetStateByIdResponse, languages)}
        onSubmit={async (values) =>
          (
            await apiRequest<GetStateByIdResponse>({
              body: mapStatePayload(values),
              endpoint: API_ROUTES.SYSTEM_ADMIN.POST_STATE,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <StateForm
          countryOptionsEndpoint={API_ROUTES.SYSTEM_ADMIN.POST_STATE_COUNTRY_OPTIONS}
          languages={languages}
        />
      </FormWrapper>
    </Page>
  );
}
