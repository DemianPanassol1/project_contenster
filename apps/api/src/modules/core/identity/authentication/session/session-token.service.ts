import { createHmac, randomBytes } from 'node:crypto';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import type { I18nTranslations } from '@/i18n/translations';
import { settings } from '@/infrastructure/config/app.config';

@Injectable()
export class SessionTokenService {
  constructor(private readonly i18n: I18nService<I18nTranslations>) {}

  create(): string {
    this.getSecret();

    return randomBytes(48).toString('base64url');
  }

  hash(token: string): string {
    return createHmac('sha256', this.getSecret()).update(token).digest('base64url');
  }

  private getSecret(): string {
    if (!settings.SESSION_HMAC_SECRET) {
      throw new ServiceUnavailableException(
        this.i18n.t('errors.infrastructure.session_authentication_unconfigured'),
      );
    }

    return settings.SESSION_HMAC_SECRET;
  }
}
