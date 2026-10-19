import type { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

import { settings } from '@/infrastructure/config/app.config';

import { PASSWORD_RESET_TOKEN_ALGORITHM } from '../constants/password-reset-token.constants';

const getPasswordResetTokenSecret = (): string => {
  if (settings.PASSWORD_RESET_TOKEN_SECRET === null) {
    throw new Error('PASSWORD_RESET_TOKEN_SECRET is required to sign or verify reset tokens.');
  }

  return settings.PASSWORD_RESET_TOKEN_SECRET;
};

export const createPasswordResetTokenSignOptions = (): JwtSignOptions => {
  const audience =
    settings.PASSWORD_RESET_TOKEN_AUDIENCE === null
      ? {}
      : { audience: settings.PASSWORD_RESET_TOKEN_AUDIENCE };
  const issuer =
    settings.PASSWORD_RESET_TOKEN_ISSUER === null
      ? {}
      : { issuer: settings.PASSWORD_RESET_TOKEN_ISSUER };

  return {
    algorithm: PASSWORD_RESET_TOKEN_ALGORITHM,
    ...audience,
    expiresIn: `${settings.PASSWORD_RESET_TOKEN_TTL_SECONDS}s` as NonNullable<
      JwtSignOptions['expiresIn']
    >,
    ...issuer,
    secret: getPasswordResetTokenSecret(),
  };
};

export const createPasswordResetTokenVerifyOptions = (): JwtVerifyOptions => {
  const audience =
    settings.PASSWORD_RESET_TOKEN_AUDIENCE === null
      ? {}
      : { audience: settings.PASSWORD_RESET_TOKEN_AUDIENCE };
  const issuer =
    settings.PASSWORD_RESET_TOKEN_ISSUER === null
      ? {}
      : { issuer: settings.PASSWORD_RESET_TOKEN_ISSUER };

  return {
    algorithms: [PASSWORD_RESET_TOKEN_ALGORITHM],
    ...audience,
    ...issuer,
    secret: getPasswordResetTokenSecret(),
  };
};
