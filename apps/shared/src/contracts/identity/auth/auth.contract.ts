import type { AppOption } from '../../../platform/options/app-option.interface.js';
import type { AuthenticatedSession } from '../../../platform/session/session.contract.js';

export interface AuthorizeRequest {
  username: string;
  password: string;
}

export type AuthorizeClientOption = AppOption<number>;

export interface AvailableClientsResponse {
  clients: AuthorizeClientOption[];
}

export interface AuthorizeResponse {
  clients: AuthorizeClientOption[];
  isEligibleToGlobalContext: boolean;
}

export interface SignInRequest extends AuthorizeRequest {
  clientId: number;
  staySignedIn: boolean;
}

export interface SignInGlobalRequest extends AuthorizeRequest {
  staySignedIn: boolean;
}

export interface SessionResponse {
  expiresAt: string;
  session: AuthenticatedSession;
}

export interface SwitchClientRequest {
  clientId: number;
}

export interface SignOutResponse {
  signedOut: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  emailSent: boolean;
}

export interface ResetPasswordRequest {
  password: string;
  token: string;
}

export interface ResetPasswordResponse {
  passwordReset: boolean;
}
