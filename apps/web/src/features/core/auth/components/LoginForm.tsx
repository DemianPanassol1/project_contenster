'use client';

import type { AuthorizeResponse } from '@contenster/shared';
import { Alert, Box, Divider, Link as MuiLink, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { ElementType } from 'react';

import { useValidationRules } from '@/hooks';
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
  const { createValidationRules } = useValidationRules<LoginFormValues>();

  return (
    <FormWrapper<LoginFormValues>
      fields={LOGIN_DEFAULT_VALUES}
      id={LOGIN_FORM_ID}
      showPaper={false}
      onSubmit={onSubmit}
    >
      {({ getValues }) => (
        <Box
          sx={{
            display: 'grid',
            gap: '1rem 2rem',
            gridTemplateColumns: '1fr',
            margin: '0 0 1rem',
          }}
        >
          {!authorization ? (
            <>
              <FormInput<LoginFormValues>
                autoComplete="username"
                disabled={isPending}
                label={t('username')}
                name="username"
                rules={createValidationRules('required')}
              />
              <Box>
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'flex-end', mb: 0.75 }}
                >
                  <MuiLink
                    component={Link as ElementType}
                    href="/auth/forgot-password"
                    sx={{ fontWeight: 600 }}
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
                  rules={createValidationRules('required')}
                />
              </Box>
              <FormCheckbox<LoginFormValues>
                disabled={isPending}
                label={t('stay_signed_in')}
                name="staySignedIn"
                sx={{ ml: -1 }}
              />
            </>
          ) : (
            <>
              {authorization.isEligibleToGlobalContext && (
                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  <Typography color="text.secondary" variant="body2">
                    {t('choose_access')}
                  </Typography>
                  <Button
                    disabled={isPending}
                    label={t('global_context')}
                    sx={{ height: 40, width: '100%' }}
                    type="button"
                    variant="outlined"
                    onClick={() => {
                      void onGlobalContextSignIn(getValues());
                    }}
                  />
                </Box>
              )}
              {authorization.isEligibleToGlobalContext && authorization.clients.length > 0 && (
                <Divider sx={{ typography: 'caption' }}>{t('or')}</Divider>
              )}
              {authorization.clients.length > 0 && (
                <FormSelect<LoginFormValues>
                  disabled={isPending}
                  label={t('client')}
                  name="clientId"
                  options={authorization.clients}
                  rules={createValidationRules('required')}
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
            sx={{ height: 40, width: '100%' }}
            type="submit"
          />
        </Box>
      )}
    </FormWrapper>
  );
}
