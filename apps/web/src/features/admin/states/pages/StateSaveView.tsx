'use client';

import type { GetStateByIdResponse, SaveStateRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { crudListPath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { StateForm } from '../components/StateForm';
import { getStateDefaultValues, mapStateContent, mapStatePayload } from '../utils/state.utils';

const STATE_FORM_ID = 'state-form';

export function StateSaveView({
  entityId,
  functionalitySlug,
  presentation,
}: AdminFeatureViewProps) {
  const router = useRouter();
  const t = useTranslations('protected.states');
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
            form={STATE_FORM_ID}
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
      <FormWrapper<SaveStateRequest>
        contentUrl={isEditing ? API_ROUTES.ADMIN.GET_STATE(entityId) : undefined}
        fields={getStateDefaultValues(presentation.languages)}
        id={STATE_FORM_ID}
        mapContent={(content) =>
          mapStateContent(content as GetStateByIdResponse, presentation.languages)
        }
        onSubmit={async (values) =>
          (
            await apiRequest<GetStateByIdResponse>({
              body: mapStatePayload(values),
              endpoint: API_ROUTES.ADMIN.POST_STATE,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <StateForm languages={presentation.languages} />
      </FormWrapper>
    </Page>
  );
}
