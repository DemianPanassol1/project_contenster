'use client';

import type { GetActionByIdResponse, SaveActionRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { crudListPath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { ActionForm } from '../components/ActionForm';
import { getActionDefaultValues, mapActionContent, mapActionPayload } from '../utils/action.utils';

const ACTION_FORM_ID = 'action-form';

export function ActionSaveView({
  entityId,
  functionalitySlug,
  presentation,
}: AdminFeatureViewProps) {
  const router = useRouter();
  const t = useTranslations('protected.actions');
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
            form={ACTION_FORM_ID}
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
      <FormWrapper<SaveActionRequest>
        contentUrl={isEditing ? API_ROUTES.ADMIN.GET_ACTION(entityId) : undefined}
        fields={getActionDefaultValues(presentation.languages)}
        id={ACTION_FORM_ID}
        mapContent={(content) =>
          mapActionContent(content as GetActionByIdResponse, presentation.languages)
        }
        onSubmit={async (values) =>
          (
            await apiRequest<GetActionByIdResponse>({
              body: mapActionPayload(values),
              endpoint: API_ROUTES.ADMIN.POST_ACTION,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <ActionForm languages={presentation.languages} />
      </FormWrapper>
    </Page>
  );
}
