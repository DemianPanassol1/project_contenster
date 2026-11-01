import { describe, expect, it } from 'vitest';

import {
  buildPasswordRecoveryPath,
  resolvePasswordRecoveryLocale,
} from './password-recovery-url.helper';

describe('password recovery URL helpers', () => {
  it('uses the default locale without a URL prefix', () => {
    expect(buildPasswordRecoveryPath('pt', 'token/value')).toBe(
      '/auth/reset-password/token%2Fvalue',
    );
  });

  it('uses a locale prefix for supported non-default locales', () => {
    expect(buildPasswordRecoveryPath('en', 'token')).toBe('/en/auth/reset-password/token');
    expect(buildPasswordRecoveryPath('es', 'token')).toBe('/es/auth/reset-password/token');
  });

  it('falls back to Portuguese for unsupported locales', () => {
    expect(resolvePasswordRecoveryLocale('fr')).toBe('pt');
  });
});
