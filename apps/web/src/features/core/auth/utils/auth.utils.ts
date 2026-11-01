import type {
  AuthorizeRequest,
  AuthorizeResponse,
  SignInGlobalRequest,
  SignInRequest,
} from '@contenster/shared';
import { jwtDecode } from 'jwt-decode';

import type { LoginFormValues } from '../types/login.types';

export const getAutomaticClientId = (authorization: AuthorizeResponse): number | null => {
  if (authorization.isEligibleToGlobalContext || authorization.clients.length !== 1) {
    return null;
  }

  return authorization.clients[0].value;
};

export const toAuthorizeRequest = (values: LoginFormValues): AuthorizeRequest => ({
  password: values.password,
  username: values.username,
});

export const toSignInRequest = (values: LoginFormValues, clientId: number): SignInRequest => ({
  clientId,
  password: values.password,
  staySignedIn: values.staySignedIn,
  username: values.username,
});

export const toSignInGlobalRequest = (values: LoginFormValues): SignInGlobalRequest => ({
  password: values.password,
  staySignedIn: values.staySignedIn,
  username: values.username,
});

export const isDecodablePasswordResetToken = (value: string): boolean => {
  try {
    jwtDecode(value);

    return true;
  } catch {
    return false;
  }
};
