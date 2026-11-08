'use client';

import type { GetSystemAdminClientResponse } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { systemAdminClientsPath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { useSystemAdminLanguages } from '../../shared/hooks/useSystemAdminLanguages';
import { SystemAdminClientForm } from '../components/SystemAdminClientForm';
import type { SystemAdminClientFormValues } from '../types/system-admin-client-form.types';
import {
  getSystemAdminClientDefaultValues,
  mapSystemAdminClientContent,
  mapSystemAdminClientPayload,
} from '../utils/system-admin-client.utils';

const FORM_ID = 'system-admin-client-form';

export function SystemAdminClientSaveView({ id }: { id: number | null }) {
  const router = useRouter();
  const { apiRequest } = useGlobalContext();
  const t = useTranslations('protected.system_admin.clients');
  const tSystem = useTranslations('protected.system_admin');
  const { languages } = useSystemAdminLanguages();
  const isEditing = id !== null;
  const listPath = systemAdminClientsPath();

  return (
    <Page
      actions={
        <>
          <Button
            icon="arrow-left"
            iconPosition="start"
            label={t('go_back')}
            onClick={() => router.push(listPath)}
            variant="outlined"
          />
          <Button form={FORM_ID} icon="save" iconPosition="start" label={t('save')} type="submit" />
        </>
      }
      description={t('save_description')}
      functionality={isEditing ? t('edit_title') : t('create_title')}
      module={tSystem('module')}
    >
      <FormWrapper<SystemAdminClientFormValues>
        contentUrl={isEditing ? API_ROUTES.SYSTEM_ADMIN.GET_CLIENT(id) : undefined}
        fields={getSystemAdminClientDefaultValues()}
        id={FORM_ID}
        mapContent={(content) =>
          mapSystemAdminClientContent(content as GetSystemAdminClientResponse)
        }
        onSubmit={async (values) =>
          (
            await apiRequest<unknown>({
              body: mapSystemAdminClientPayload(values),
              endpoint: isEditing
                ? API_ROUTES.SYSTEM_ADMIN.PATCH_CLIENT(id)
                : API_ROUTES.SYSTEM_ADMIN.POST_CLIENT,
              method: isEditing ? 'PATCH' : 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
        showPaper={false}
      >
        <SystemAdminClientForm languages={languages} />
      </FormWrapper>
    </Page>
  );
}
