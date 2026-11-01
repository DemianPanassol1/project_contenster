'use client';

import type { GetUserByIdResponse, SaveUserRequest } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { crudListPath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { UserForm } from '../components/UserForm';
import { getUserDefaultValues, mapUserContent } from '../utils/user.utils';

const USER_FORM_ID = 'user-form';

export function UserSaveView({ entityId, functionalitySlug, presentation }: AdminFeatureViewProps) {
  const router = useRouter();
  const t = useTranslations('protected.users');
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
            form={USER_FORM_ID}
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
      <FormWrapper<SaveUserRequest>
        contentUrl={isEditing ? API_ROUTES.ADMIN.GET_USER(entityId) : undefined}
        fields={getUserDefaultValues()}
        id={USER_FORM_ID}
        mapContent={(content) => mapUserContent(content as GetUserByIdResponse)}
        onSubmit={async (values) =>
          (
            await apiRequest<GetUserByIdResponse>({
              body: values,
              endpoint: API_ROUTES.ADMIN.POST_USER,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <UserForm isCreateMode={!isEditing} />
      </FormWrapper>
    </Page>
  );
}
