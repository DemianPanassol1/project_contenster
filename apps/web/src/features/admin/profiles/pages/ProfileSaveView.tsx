'use client';

import type { GetProfileByIdResponse } from '@contenster/shared';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { crudListPath } from '@/features/shared/navigation';
import { useRouter } from '@/i18n/navigation';
import type { AdminFeatureViewProps } from '@/registry/admin';
import { API_ROUTES } from '@/routes';
import { Button, FormWrapper, Page } from '@/shared';

import { ProfileForm } from '../components/ProfileForm';
import {
  getProfileDefaultValues,
  mapProfileContent,
  mapProfilePayload,
  type ProfileFormValues,
} from '../utils/profile.utils';

const PROFILE_FORM_ID = 'profile-form';

export function ProfileSaveView({
  entityId,
  functionalitySlug,
  presentation,
}: AdminFeatureViewProps) {
  const router = useRouter();
  const t = useTranslations('protected.profiles');
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
            form={PROFILE_FORM_ID}
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
      <FormWrapper<ProfileFormValues>
        contentUrl={isEditing ? API_ROUTES.ADMIN.GET_PROFILE(entityId) : undefined}
        fields={getProfileDefaultValues(presentation.languages)}
        id={PROFILE_FORM_ID}
        mapContent={(content) =>
          mapProfileContent(content as GetProfileByIdResponse, presentation.languages)
        }
        onSubmit={async (values) =>
          (
            await apiRequest<GetProfileByIdResponse>({
              body: mapProfilePayload(values),
              endpoint: API_ROUTES.ADMIN.POST_PROFILE,
              method: 'POST',
              onSuccess: () => router.push(listPath),
            })
          ).success
        }
      >
        <ProfileForm languages={presentation.languages} />
      </FormWrapper>
    </Page>
  );
}
