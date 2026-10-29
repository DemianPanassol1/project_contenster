'use client';

import type {
  GetCurrentUserProfileResponse,
  SaveCurrentUserProfileRequest,
} from '@contenster/shared';
import { Box } from '@mui/material';
import { useTranslations } from 'next-intl';

import { useGlobalContext } from '@/core/providers';
import { useValidationRules } from '@/hooks';
import { useRouter } from '@/i18n/navigation';
import { API_ROUTES } from '@/routes';
import { Button, FormImageUpload, FormInput, FormMaskedInput, FormWrapper, Page } from '@/shared';

const PROFILE_FORM_ID = 'current-user-profile-form';

const defaultValues: SaveCurrentUserProfileRequest = {
  email: '',
  imageId: null,
  name: '',
  primaryPhone: '',
  secondaryPhone: null,
  username: '',
};

export function ProfileView() {
  const router = useRouter();
  const t = useTranslations('protected.profile');
  const { apiRequest } = useGlobalContext();
  const { createValidationRules } = useValidationRules<SaveCurrentUserProfileRequest>();

  return (
    <Page
      actions={
        <Button
          form={PROFILE_FORM_ID}
          icon="save"
          iconPosition="start"
          label={t('save')}
          type="submit"
        />
      }
      functionality={t('title')}
      module={t('module')}
    >
      <FormWrapper<SaveCurrentUserProfileRequest>
        contentUrl={API_ROUTES.ADMIN.GET_CURRENT_USER_PROFILE}
        fields={defaultValues}
        id={PROFILE_FORM_ID}
        mapContent={(content) => content as GetCurrentUserProfileResponse}
        onSubmit={async (values) =>
          (
            await apiRequest<GetCurrentUserProfileResponse>({
              body: values,
              endpoint: API_ROUTES.ADMIN.POST_CURRENT_USER_PROFILE,
              method: 'POST',
              onSuccess: () => router.refresh(),
            })
          ).success
        }
      >
        <Box
          sx={{
            display: 'grid',
            gap: '1.5rem 2rem',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          <FormInput<SaveCurrentUserProfileRequest>
            label={t('name')}
            name="name"
            rules={createValidationRules('required|max_length[255]')}
          />
          <FormInput<SaveCurrentUserProfileRequest>
            label={t('username')}
            name="username"
            rules={createValidationRules('required|max_length[75]')}
          />
          <FormInput<SaveCurrentUserProfileRequest>
            label={t('email')}
            name="email"
            rules={createValidationRules('required|email|max_length[255]')}
            type="email"
          />
          <FormMaskedInput<SaveCurrentUserProfileRequest>
            label={t('primary_phone')}
            maskType="phone"
            name="primaryPhone"
            phoneCountry="BR"
            phonePrefixes={{ BR: '55', ES: '34', US: '1' }}
            rules={createValidationRules('required|max_length[30]')}
          />
          <FormMaskedInput<SaveCurrentUserProfileRequest>
            label={t('secondary_phone')}
            maskType="phone"
            name="secondaryPhone"
            phoneCountry="BR"
            phonePrefixes={{ BR: '55', ES: '34', US: '1' }}
            rules={createValidationRules('max_length[30]')}
          />
          <Box sx={{ gridColumn: { md: '1 / -1' } }}>
            <FormImageUpload<SaveCurrentUserProfileRequest> label={t('image')} name="imageId" />
          </Box>
        </Box>
      </FormWrapper>
    </Page>
  );
}
