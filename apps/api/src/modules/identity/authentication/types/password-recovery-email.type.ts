export type PasswordRecoveryEmailLocale = 'pt' | 'en' | 'es';

export interface SendPasswordRecoveryEmailInput {
  recipient: string;
  recipientName: string;
  resetLink: string;
}

export interface PasswordRecoveryMailConfiguration {
  fromAddress: string;
  fromName: string | null;
  host: string;
  password: string;
  port: number;
  user: string;
}
