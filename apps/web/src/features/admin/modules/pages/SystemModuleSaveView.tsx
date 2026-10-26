'use client';

import type { GetSystemModuleByIdResponse, SaveSystemModuleRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { crudListPath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { SystemModuleForm } from '../components/SystemModuleForm';
import {
  getSystemModuleDefaultValues,
  mapSystemModuleContent,
  mapSystemModulePayload,
} from '../utils/system-module.utils';

const SYSTEM_MODULE_FORM_ID = 'system-module-form';

export function SystemModuleSaveView({
  entityId,
  functionalitySlug,
  presentation,
}: AdminFeatureViewProps) {
  const router = useRouter();
  const t = useTranslations('protected.modules');
  const { apiRequest } = useGlobalContext();
  const isEditing = entityId !== null;
  const listPath = crudListPath(functionalitySlug);

  return (
    <Page
      description={presentation.description ?? undefined}
      functionality={
        isEditing
          ? t('edit_title', { functionality: presentation.functionalityName })
          : t('create_title', { functionality: presentation.functionalityName })
      }
      module={presentation.moduleName}
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
            form={SYSTEM_MODULE_FORM_ID}
            icon="save"
            iconPosition="start"
            label={t('save')}
            type="submit"
          />
        </>
      }
    >
      <FormWrapper<SaveSystemModuleRequest>
        contentUrl={isEditing ? API_ROUTES.ADMIN.GET_SYSTEM_MODULE(entityId) : undefined}
        fields={getSystemModuleDefaultValues(presentation.languages)}
        id={SYSTEM_MODULE_FORM_ID}
        mapContent={(content) =>
          mapSystemModuleContent(content as GetSystemModuleByIdResponse, presentation.languages)
        }
        onSubmit={async (values) => {
          const response = await apiRequest<GetSystemModuleByIdResponse>({
            body: mapSystemModulePayload(values),
            endpoint: API_ROUTES.ADMIN.POST_SYSTEM_MODULE,
            method: 'POST',
            onSuccess: () => router.push(listPath),
          });

          return response.success;
        }}
      >
        <SystemModuleForm languages={presentation.languages} />
      </FormWrapper>
    </Page>
  );
}
