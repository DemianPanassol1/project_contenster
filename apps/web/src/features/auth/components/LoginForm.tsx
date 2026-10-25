'use client';

import type { AuthorizeResponse } from '@contenster/shared';
import { Alert, Box, Divider, Link as MuiLink, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { ElementType } from 'react';

import { Link } from '@/i18n/navigation';
import {
  Button,
  FormCheckbox,
  FormInput,
  FormPasswordInput,
  FormSelect,
  FormWrapper,
} from '@/shared';

import { LOGIN_DEFAULT_VALUES, LOGIN_FORM_ID } from '../constants/auth.constants';
import type { LoginFormValues } from '../types/login.types';

interface LoginFormProps {
  authorization: AuthorizeResponse | null;
  isPending: boolean;
  onGlobalContextSignIn: (values: LoginFormValues) => Promise<void>;
  onSubmit: (values: LoginFormValues) => Promise<boolean>;
}

export function LoginForm({
  authorization,
  isPending,
  onGlobalContextSignIn,
  onSubmit,
}: LoginFormProps) {
  const t = useTranslations('auth.login');

  return (
    <FormWrapper<LoginFormValues>
      fields={LOGIN_DEFAULT_VALUES}
      id={LOGIN_FORM_ID}
      showPaper={false}
      onSubmit={onSubmit}
    >
      {({ getValues }) => (
        <Stack spacing={2}>
          {!authorization ? (
            <>
              <FormInput<LoginFormValues>
                autoComplete="username"
                disabled={isPending}
                label={t('username')}
                name="username"
                rules={{ required: true }}
              />
              <Box>
                <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 0.75 }}>
                  <MuiLink
                    component={Link as ElementType}
                    href="/auth/forgot-password"
                    underline="hover"
                    variant="body2"
                  >
                    {t('forgot_password')}
                  </MuiLink>
                </Stack>
                <FormPasswordInput<LoginFormValues>
                  autoComplete="current-password"
                  disabled={isPending}
                  label={t('password')}
                  name="password"
                  rules={{ required: true }}
                />
              </Box>
              <FormCheckbox<LoginFormValues>
                disabled={isPending}
                label={t('stay_signed_in')}
                name="staySignedIn"
              />
            </>
          ) : (
            <>
              {authorization.isEligibleToGlobalContext && (
                <Button
                  disabled={isPending}
                  label={t('global_context')}
                  type="button"
                  variant="outlined"
                  onClick={() => {
                    void onGlobalContextSignIn(getValues());
                  }}
                />
              )}
              {authorization.isEligibleToGlobalContext && authorization.clients.length > 0 && (
                <Divider>{t('or')}</Divider>
              )}
              {authorization.clients.length > 0 && (
                <FormSelect<LoginFormValues>
                  disabled={isPending}
                  label={t('client')}
                  name="clientId"
                  options={authorization.clients}
                  rules={{ required: true }}
                />
              )}
              {!authorization.isEligibleToGlobalContext && authorization.clients.length === 0 && (
                <Alert severity="warning">{t('no_available_access')}</Alert>
              )}
            </>
          )}
          <Button
            disabled={
              isPending ||
              (authorization !== null &&
                !authorization.isEligibleToGlobalContext &&
                authorization.clients.length === 0)
            }
            form={LOGIN_FORM_ID}
            label={t('submit')}
            type="submit"
          />
        </Stack>
      )}
    </FormWrapper>
  );
}
