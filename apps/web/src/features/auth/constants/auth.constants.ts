import type { ForgotPasswordRequest } from '@contenster/shared';

import type { LoginFormValues } from '../types/login.types';
import type { ResetPasswordFormValues } from '../types/reset-password.types';

export const LOGIN_FORM_ID = 'login-form';
export const FORGOT_PASSWORD_FORM_ID = 'forgot-password-form';
export const RESET_PASSWORD_FORM_ID = 'reset-password-form';

export const LOGIN_DEFAULT_VALUES: LoginFormValues = {
  clientId: null,
  password: '',
  staySignedIn: false,
  username: '',
};

export const FORGOT_PASSWORD_DEFAULT_VALUES: ForgotPasswordRequest = {
  email: '',
};

export const RESET_PASSWORD_DEFAULT_VALUES: ResetPasswordFormValues = {
  confirmPassword: '',
  password: '',
};
